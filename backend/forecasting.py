"""
Prophet-based demand forecasting module for FreshPredict.
Uses historical sales data with Malaysian holiday effects.
"""

import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
import os
import warnings
import logging

# Import configuration
from config import (
    ForecastConfig,
    get_prophet_holidays,
    get_malaysian_festivals,
    PAYDAY_PERIODS,
)

# Suppress Prophet's verbose output
logging.getLogger('prophet').setLevel(logging.WARNING)
logging.getLogger('cmdstanpy').setLevel(logging.WARNING)
warnings.filterwarnings('ignore')

# Path to sales data
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'sales_history.csv')

# Load Malaysian holidays from config (dynamic based on current year)
MALAYSIAN_HOLIDAYS = get_prophet_holidays()

# Cache for trained models
_model_cache = {}
_sales_data = None


def load_sales_data() -> pd.DataFrame:
    """Load and cache sales data."""
    global _sales_data
    if _sales_data is None:
        _sales_data = pd.read_csv(DATA_PATH)
        _sales_data['date'] = pd.to_datetime(_sales_data['date'])
    return _sales_data


def is_payday(day_of_month: int) -> bool:
    """Check if a day of month falls within payday periods."""
    return any(start <= day_of_month <= end for start, end in PAYDAY_PERIODS)


def get_product_data(product_id: str) -> pd.DataFrame:
    """Get sales data for a specific product in Prophet format."""
    sales = load_sales_data()
    product_sales = sales[sales['product_id'] == product_id].copy()
    
    # Prophet requires 'ds' and 'y' columns
    prophet_df = product_sales[['date', 'quantity_sold']].rename(
        columns={'date': 'ds', 'quantity_sold': 'y'}
    )
    
    # Add weekend regressor
    prophet_df['is_weekend'] = prophet_df['ds'].dt.dayofweek >= 5
    prophet_df['is_weekend'] = prophet_df['is_weekend'].astype(int)
    
    # Add payday regressor (uses config-defined periods)
    day = prophet_df['ds'].dt.day
    prophet_df['is_payday'] = day.apply(is_payday).astype(int)
    
    return prophet_df


def train_model(product_id: str) -> Prophet:
    """Train a Prophet model for a specific product."""
    if product_id in _model_cache:
        return _model_cache[product_id]
    
    # Get training data
    df = get_product_data(product_id)
    
    if len(df) < ForecastConfig.MIN_TRAINING_SAMPLES:
        return None
    
    # Initialize Prophet with Malaysian holidays
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        holidays=MALAYSIAN_HOLIDAYS,
        changepoint_prior_scale=ForecastConfig.CHANGEPOINT_PRIOR_SCALE,
        seasonality_mode=ForecastConfig.SEASONALITY_MODE,
    )
    
    # Add custom regressors
    model.add_regressor('is_weekend')
    model.add_regressor('is_payday')
    
    # Train the model
    model.fit(df)
    
    # Cache it
    _model_cache[product_id] = model
    
    return model


def generate_forecast(product_id: str, days: int = None) -> dict:
    """
    Generate demand forecast using Prophet.
    
    Args:
        product_id: Product ID to forecast
        days: Number of days to forecast (default from config)
    
    Returns dict with:
    - dates: List of forecast dates
    - predicted_demand: List of predicted values
    - confidence_lower: Lower confidence interval (80%)
    - confidence_upper: Upper confidence interval (80%)
    - trend: "increasing", "decreasing", or "stable"
    - festive_impact: Description of any upcoming festival impact
    """
    if days is None:
        days = ForecastConfig.DEFAULT_FORECAST_DAYS
    model = train_model(product_id)
    
    if model is None:
        return None
    
    # Create future dataframe
    future = model.make_future_dataframe(periods=days, freq='D')
    
    # Add regressors
    future['is_weekend'] = (future['ds'].dt.dayofweek >= 5).astype(int)
    day = future['ds'].dt.day
    future['is_payday'] = day.apply(is_payday).astype(int)
    
    # Generate predictions
    forecast = model.predict(future)
    
    # Get only the future predictions
    future_forecast = forecast.tail(days)
    
    # Extract values
    dates = future_forecast['ds'].dt.strftime('%Y-%m-%d').tolist()
    predictions = future_forecast['yhat'].round(1).tolist()
    lower = future_forecast['yhat_lower'].round(1).tolist()
    upper = future_forecast['yhat_upper'].round(1).tolist()
    
    # Ensure no negative predictions
    predictions = [max(0, p) for p in predictions]
    lower = [max(0, l) for l in lower]
    upper = [max(0, u) for u in upper]
    
    # Determine trend using config thresholds
    avg_first_half = sum(predictions[:days//2]) / (days//2)
    avg_second_half = sum(predictions[days//2:]) / (days//2)
    
    if avg_second_half > avg_first_half * ForecastConfig.TREND_INCREASE_THRESHOLD:
        trend = "increasing"
    elif avg_second_half < avg_first_half * ForecastConfig.TREND_DECREASE_THRESHOLD:
        trend = "decreasing"
    else:
        trend = "stable"
    
    # Check for festive impact using festival config
    festive_impact = None
    today = datetime.now()
    current_year = today.year
    festivals = get_malaysian_festivals(current_year) + get_malaysian_festivals(current_year + 1)
    
    for festival in festivals:
        festival_date = datetime.strptime(festival['date'], '%Y-%m-%d')
        days_until = (festival_date - today).days
        if 0 < days_until <= days:
            festive_impact = f"{festival['name']} ({days_until} days away)"
            break
    
    return {
        'dates': dates,
        'predicted_demand': predictions,
        'confidence_lower': lower,
        'confidence_upper': upper,
        'trend': trend,
        'festive_impact': festive_impact
    }


def get_model_metrics(product_id: str) -> dict:
    """Get model performance metrics (for display purposes)."""
    df = get_product_data(product_id)
    model = train_model(product_id)
    
    if model is None:
        return None
    
    # Cross-validation would be done here in production
    # For demo, return basic stats
    return {
        'training_samples': len(df),
        'date_range': f"{df['ds'].min().strftime('%Y-%m-%d')} to {df['ds'].max().strftime('%Y-%m-%d')}",
        'avg_daily_demand': round(df['y'].mean(), 1),
        'demand_std': round(df['y'].std(), 1),
    }


def get_available_products() -> list:
    """Get list of products with enough data for forecasting."""
    sales = load_sales_data()
    product_counts = sales.groupby('product_id').size()
    # Only return products with enough data points for training
    min_samples = ForecastConfig.MIN_TRAINING_SAMPLES
    valid_products = product_counts[product_counts >= min_samples].index.tolist()
    return valid_products


# Pre-train models on startup for faster inference
def initialize_models():
    """Pre-train models for all products (call on app startup)."""
    products = get_available_products()
    for product_id in products:
        try:
            train_model(product_id)
        except Exception as e:
            print(f"Warning: Could not train model for {product_id}: {e}")


if __name__ == "__main__":
    # Test the forecasting module
    print("Testing Prophet forecasting module...")
    
    # Load data
    sales = load_sales_data()
    print(f"Loaded {len(sales)} sales records")
    
    # Test forecast for a product
    test_product = "PLT001"  # Whole Chicken
    print(f"\nGenerating forecast for {test_product}...")
    
    forecast = generate_forecast(test_product, days=14)
    if forecast:
        print(f"Dates: {forecast['dates'][:3]}... (14 days)")
        print(f"Predictions: {forecast['predicted_demand'][:3]}...")
        print(f"Trend: {forecast['trend']}")
        print(f"Festive Impact: {forecast['festive_impact']}")
    
    metrics = get_model_metrics(test_product)
    if metrics:
        print(f"\nModel Metrics:")
        print(f"  Training samples: {metrics['training_samples']}")
        print(f"  Avg daily demand: {metrics['avg_daily_demand']}")
