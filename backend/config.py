"""
Configuration settings for FreshPredict backend.
All magic numbers and configurable values should be defined here.
Environment variables can override defaults.
"""

import os
from datetime import datetime
from typing import List, Tuple

# ============== ENVIRONMENT ==============

# Server settings
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# CORS settings
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:3000,http://localhost:3001"
).split(",")

# ============== FORECASTING SETTINGS ==============

class ForecastConfig:
    """Prophet and forecasting configuration."""
    
    # Minimum data points required for model training
    MIN_TRAINING_SAMPLES = int(os.getenv("MIN_TRAINING_SAMPLES", "30"))
    
    # Prophet hyperparameters
    CHANGEPOINT_PRIOR_SCALE = float(os.getenv("CHANGEPOINT_PRIOR_SCALE", "0.05"))
    SEASONALITY_MODE = os.getenv("SEASONALITY_MODE", "multiplicative")
    
    # Trend detection thresholds
    TREND_INCREASE_THRESHOLD = float(os.getenv("TREND_INCREASE_THRESHOLD", "1.10"))  # 10% increase
    TREND_DECREASE_THRESHOLD = float(os.getenv("TREND_DECREASE_THRESHOLD", "0.90"))  # 10% decrease
    
    # Default forecast parameters
    DEFAULT_FORECAST_DAYS = int(os.getenv("DEFAULT_FORECAST_DAYS", "14"))
    
    # Fallback forecast parameters
    FALLBACK_BASE_DEMAND_FACTOR = 0.15  # Multiplied by current stock
    FALLBACK_WEEKEND_MULTIPLIER = 1.2
    FALLBACK_PAYDAY_MULTIPLIER = 1.3
    FALLBACK_CONFIDENCE_INTERVAL = 0.2  # +/- 20%

# ============== INVENTORY SETTINGS ==============

class InventoryConfig:
    """Inventory management thresholds."""
    
    # Expiry risk thresholds (days)
    EXPIRY_CRITICAL_DAYS = int(os.getenv("EXPIRY_CRITICAL_DAYS", "2"))
    EXPIRY_WARNING_DAYS = int(os.getenv("EXPIRY_WARNING_DAYS", "4"))
    EXPIRY_ALERT_DAYS = int(os.getenv("EXPIRY_ALERT_DAYS", "5"))
    
    # Stock level thresholds
    LOW_STOCK_CRITICAL_FACTOR = 0.5  # Below 50% of reorder point = critical
    OVERSTOCK_FACTOR = 3.0  # Above 3x reorder point = overstock
    OVERSTOCK_EXPIRY_WINDOW_DAYS = 10
    
    # Demand spike detection
    DEMAND_SPIKE_FACTOR = 1.5  # 50% above current stock = high severity
    
    # Days coverage thresholds for AI insight
    MIN_COVERAGE_DAYS = 5
    SHELF_LIFE_BUFFER_DAYS = 3

# ============== ESG SETTINGS ==============

class ESGConfig:
    """ESG metrics and sustainability configuration."""
    
    # IPCC standard: Avoided food waste methane factor
    # Source: IPCC Guidelines for National Greenhouse Gas Inventories
    METHANE_CONVERSION_FACTOR = float(os.getenv("METHANE_CONVERSION_FACTOR", "0.918"))  # kg CO2e per kg waste
    
    # Baseline monthly waste for comparison (kg)
    BASELINE_MONTHLY_WASTE_KG = float(os.getenv("BASELINE_MONTHLY_WASTE_KG", "180"))
    
    # Starting values for waste tracker (historical baseline)
    INITIAL_WASTE_SAVED_KG = float(os.getenv("INITIAL_WASTE_SAVED_KG", "150.0"))
    INITIAL_ITEMS_RESCUED = int(os.getenv("INITIAL_ITEMS_RESCUED", "42"))
    INITIAL_COST_SAVED_RM = float(os.getenv("INITIAL_COST_SAVED_RM", "2250.0"))
    
    # Compliance score settings
    BASE_COMPLIANCE_SCORE = 85.0
    COMPLIANCE_IMPROVEMENT_PER_ITEM = 0.5
    MAX_COMPLIANCE_SCORE = 100.0
    
    # Weight conversion for non-kg units (approximate)
    NON_KG_UNIT_WEIGHT = 0.06  # kg per unit (eggs, milk bottles, etc.)

# ============== PRICING ACTIONS ==============

class PricingConfig:
    """Markdown and discount recommendations."""
    
    CRITICAL_MARKDOWN_PERCENT = 50  # For items expiring in ≤2 days
    WARNING_DISCOUNT_PERCENT = 30   # For items expiring in 3-4 days
    
    # Reorder timing
    IMMEDIATE_REORDER_DAYS = 3

# ============== PAYDAY SETTINGS ==============

# Payday periods (day of month ranges)
# Most Malaysian workers paid 25th-end of month, spending continues 1st-5th
PAYDAY_PERIODS: List[Tuple[int, int]] = [
    (25, 31),  # End of month
    (1, 5),    # Start of next month
]

# ============== MALAYSIAN HOLIDAYS ==============

def get_malaysian_festivals(year: int = None) -> List[dict]:
    """
    Get Malaysian festivals for a specific year.
    In production, this should fetch from a database or external API.
    """
    if year is None:
        year = datetime.now().year
    
    # Festival definitions with relative dates
    # Format: (name, month, day, impact_categories, demand_multiplier)
    FESTIVAL_DEFINITIONS = [
        # Chinese New Year (dates vary - lunar calendar)
        # These are approximate for demo purposes
        ("Chinese New Year", 
         {"2025": "01-29", "2026": "02-17", "2027": "02-06"}, 
         ["poultry", "produce", "dairy"], 2.5),
        ("Chinese New Year Day 2", 
         {"2025": "01-30", "2026": "02-18", "2027": "02-07"}, 
         ["poultry", "produce", "dairy"], 2.5),
        
        # Hari Raya Aidilfitri (dates vary - Islamic calendar)
        ("Hari Raya Aidilfitri", 
         {"2025": "03-30", "2026": "03-20", "2027": "03-10"}, 
         ["poultry", "dairy"], 3.0),
        ("Hari Raya Aidilfitri Day 2", 
         {"2025": "03-31", "2026": "03-21", "2027": "03-11"}, 
         ["poultry", "dairy"], 3.0),
        
        # Deepavali (dates vary - Hindu calendar)
        ("Deepavali", 
         {"2025": "10-20", "2026": "11-08", "2027": "10-29"}, 
         ["produce", "dairy"], 2.0),
        
        # Fixed date holidays
        ("Christmas", 
         {"2025": "12-25", "2026": "12-25", "2027": "12-25"}, 
         ["poultry", "dairy"], 1.8),
    ]
    
    festivals = []
    year_str = str(year)
    
    for name, dates, categories, multiplier in FESTIVAL_DEFINITIONS:
        if year_str in dates:
            festivals.append({
                "name": name,
                "date": f"{year}-{dates[year_str]}",
                "impact_categories": categories,
                "demand_multiplier": multiplier
            })
    
    return sorted(festivals, key=lambda x: x["date"])

# ============== PROPHET HOLIDAY CONFIGURATION ==============

def get_prophet_holidays(years: List[int] = None):
    """
    Generate holiday dataframe for Prophet model.
    Returns pandas DataFrame with holiday dates and windows.
    """
    import pandas as pd
    
    if years is None:
        current_year = datetime.now().year
        years = [current_year - 1, current_year, current_year + 1]
    
    holidays_data = []
    
    # Holiday window configurations (days before/after for demand impact)
    HOLIDAY_WINDOWS = {
        "Chinese New Year": {"lower": -7, "upper": 1},
        "Chinese New Year Day 2": {"lower": -7, "upper": 1},
        "Hari Raya Aidilfitri": {"lower": -7, "upper": 1},
        "Hari Raya Aidilfitri Day 2": {"lower": -7, "upper": 1},
        "Deepavali": {"lower": -3, "upper": 1},
        "Christmas": {"lower": -3, "upper": 1},
    }
    
    for year in years:
        festivals = get_malaysian_festivals(year)
        for festival in festivals:
            window = HOLIDAY_WINDOWS.get(festival["name"], {"lower": -3, "upper": 1})
            holidays_data.append({
                "holiday": festival["name"],
                "ds": pd.to_datetime(festival["date"]),
                "lower_window": window["lower"],
                "upper_window": window["upper"],
            })
    
    return pd.DataFrame(holidays_data)

# ============== SUPPLIERS ==============

SUPPLIERS = {
    "poultry": ["QL Resources", "Leong Hup", "Kee Song"],
    "produce": ["Cameron Highlands Farm", "Local Supplier", "Sime Darby Plantation"],
    "dairy": ["Dutch Lady Malaysia", "Nestle Malaysia", "Farm Fresh"],
}

# ============== PRODUCT DEFINITIONS ==============

# Centralized product catalog
PRODUCT_CATALOG = [
    {
        "id": "PLT001",
        "name": "Whole Chicken",
        "category": "poultry",
        "unit": "kg",
        "cost_per_unit": 12.50,
        "shelf_life_days": 4,
        "reorder_point": 30,
        "default_supplier": "QL Resources"
    },
    {
        "id": "PLT002",
        "name": "Chicken Wings",
        "category": "poultry",
        "unit": "kg",
        "cost_per_unit": 15.50,
        "shelf_life_days": 4,
        "reorder_point": 20,
        "default_supplier": "QL Resources"
    },
    {
        "id": "PRD001",
        "name": "Kangkung",
        "category": "produce",
        "unit": "kg",
        "cost_per_unit": 4.50,
        "shelf_life_days": 4,
        "reorder_point": 15,
        "default_supplier": "Cameron Highlands Farm"
    },
    {
        "id": "PRD002",
        "name": "Tomatoes",
        "category": "produce",
        "unit": "kg",
        "cost_per_unit": 6.50,
        "shelf_life_days": 6,
        "reorder_point": 20,
        "default_supplier": "Cameron Highlands Farm"
    },
    {
        "id": "DRY001",
        "name": "Fresh Milk 1L",
        "category": "dairy",
        "unit": "units",
        "cost_per_unit": 7.50,
        "shelf_life_days": 10,
        "reorder_point": 40,
        "default_supplier": "Dutch Lady Malaysia"
    },
    {
        "id": "DRY002",
        "name": "Eggs (30 pack)",
        "category": "dairy",
        "unit": "packs",
        "cost_per_unit": 15.00,
        "shelf_life_days": 21,
        "reorder_point": 25,
        "default_supplier": "Lay Hong"
    },
]

# ============== DEMO DATA SCENARIOS ==============

# Stock scenarios for demo (can be overridden by database in production)
DEMO_STOCK_SCENARIOS = [
    {"id": "PLT001", "stock": 45, "expiry_offset": 2},   # Expiring soon - critical
    {"id": "PLT002", "stock": 18, "expiry_offset": 4},   # Low stock, ok expiry
    {"id": "PRD001", "stock": 12, "expiry_offset": 1},   # Critical - expires tomorrow
    {"id": "PRD002", "stock": 35, "expiry_offset": 5},   # Good stock and expiry
    {"id": "DRY001", "stock": 55, "expiry_offset": 8},   # Healthy
    {"id": "DRY002", "stock": 40, "expiry_offset": 18},  # Long shelf life
]

# Historical ESG trend data (in production, fetch from database)
ESG_HISTORICAL_TREND = [
    {"month": "Sep 2025", "waste_kg": 180, "saved_kg": 45},
    {"month": "Oct 2025", "waste_kg": 165, "saved_kg": 62},
    {"month": "Nov 2025", "waste_kg": 142, "saved_kg": 85},
    {"month": "Dec 2025", "waste_kg": 128, "saved_kg": 110},
    {"month": "Jan 2026", "waste_kg": 105, "saved_kg": 150},
]
