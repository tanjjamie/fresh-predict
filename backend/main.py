from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random
import math

# Import configuration
from config import (
    CORS_ORIGINS,
    ForecastConfig,
    InventoryConfig,
    ESGConfig,
    PricingConfig,
    PAYDAY_PERIODS,
    SUPPLIERS,
    PRODUCT_CATALOG,
    DEMO_STOCK_SCENARIOS,
    ESG_HISTORICAL_TREND,
    get_malaysian_festivals,
)

# ============== DEMO MODE ==============
# Demo mode allows simulating different dates for showcasing scenarios

DEMO_MODE = {
    "enabled": False,
    "simulated_date": None,  # datetime object when demo mode is active
}

def get_current_datetime() -> datetime:
    """Get current datetime - uses simulated date if demo mode is enabled."""
    if DEMO_MODE["enabled"] and DEMO_MODE["simulated_date"]:
        return DEMO_MODE["simulated_date"]
    return datetime.now()

def get_current_date():
    """Get current date - uses simulated date if demo mode is enabled."""
    return get_current_datetime().date()

# Prophet forecasting module
try:
    from forecasting import generate_forecast as prophet_forecast, initialize_models, get_available_products
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("Warning: Prophet not available, using fallback forecasting")

app = FastAPI(
    title="FreshPredict API",
    description="AI-driven inventory decision-support system for Malaysian SME grocers",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== DATA MODELS ==============

class InventoryItem(BaseModel):
    id: str
    name: str
    category: str  # poultry, produce, dairy
    current_stock: int
    unit: str
    cost_per_unit: float  # RM
    expiry_date: str
    reorder_point: int
    supplier: str

class ForecastResult(BaseModel):
    product_id: str
    product_name: str
    dates: List[str]
    predicted_demand: List[float]
    confidence_lower: List[float]
    confidence_upper: List[float]
    trend: str  # "increasing", "decreasing", "stable"
    festive_impact: Optional[str]

class PreparationAlert(BaseModel):
    id: str
    product_id: str
    product_name: str
    alert_type: str  # "demand_spike", "stock_out_risk", "festive_surge"
    severity: str  # "high", "medium", "low"
    message: str
    recommended_action: str
    predicted_demand_increase: float  # percentage
    days_until_event: int
    created_at: str

class SustainabilityAlert(BaseModel):
    id: str
    product_id: str
    product_name: str
    alert_type: str  # "expiry_risk", "overstock", "slow_moving"
    severity: str
    message: str
    recommended_action: str
    days_until_expiry: int
    potential_waste_kg: float
    potential_loss_rm: float
    created_at: str

class ESGMetrics(BaseModel):
    waste_saved_kg: float
    methane_offset_kg_co2e: float
    cost_savings_rm: float
    items_rescued: int
    waste_reduction_percentage: float
    compliance_score: float  # 0-100
    monthly_trend: List[dict]

class DashboardSummary(BaseModel):
    total_products: int
    low_stock_count: int
    expiry_risk_count: int
    preparation_alerts_count: int
    sustainability_alerts_count: int
    total_inventory_value_rm: float
    esg_metrics: ESGMetrics

class AddStockRequest(BaseModel):
    product_id: str
    quantity: int
    expiry_date: str  # YYYY-MM-DD
    supplier: Optional[str] = None

class AIInsight(BaseModel):
    recommendation: str
    demand_forecast: float
    festival_warning: Optional[str]
    suggested_quantity: int
    risk_level: str  # "low", "medium", "high"

class MarkSoldRequest(BaseModel):
    alert_id: str
    product_id: str
    quantity_kg: float
    cost_rm: float

class MarkDonatedRequest(BaseModel):
    alert_id: str
    product_id: str
    quantity_kg: float
    cost_rm: float
    recipient: Optional[str] = None  # Food bank name

# ============== WASTE TRACKING ==============
# Track items marked as sold/donated to prevent waste
WASTE_TRACKER = {
    "items_sold": [],  # List of {product_id, quantity_kg, cost_rm, timestamp}
    "items_donated": [],  # List of {product_id, quantity_kg, cost_rm, timestamp, recipient}
    "total_waste_saved_kg": ESGConfig.INITIAL_WASTE_SAVED_KG,
    "total_items_rescued": ESGConfig.INITIAL_ITEMS_RESCUED,
    "total_cost_saved_rm": ESGConfig.INITIAL_COST_SAVED_RM,
    "total_donated_kg": 0.0,
    "total_donated_items": 0,
}

# ============== SAMPLE DATA (Malaysian Context) ==============

# Malaysian festive calendar (loaded from config)
def get_festivals_for_year(year: int = None) -> List[dict]:
    """Get Malaysian festivals from config."""
    if year is None:
        year = get_current_datetime().year
    return get_malaysian_festivals(year)

MALAYSIAN_FESTIVALS = get_festivals_for_year()

# Use product catalog from config
PRODUCT_DEFINITIONS = PRODUCT_CATALOG
def generate_dynamic_inventory() -> List[dict]:
    """Generate inventory with expiry dates relative to today"""
    today = get_current_date()
    inventory = []
    
    # Use demo stock scenarios from config
    for scenario in DEMO_STOCK_SCENARIOS:
        product_def = next((p for p in PRODUCT_DEFINITIONS if p["id"] == scenario["id"]), None)
        if product_def:
            expiry_date = today + timedelta(days=scenario["expiry_offset"])
            inventory.append({
                "id": product_def["id"],
                "name": product_def["name"],
                "category": product_def["category"],
                "current_stock": scenario["stock"],
                "unit": product_def["unit"],
                "cost_per_unit": product_def["cost_per_unit"],
                "expiry_date": expiry_date.strftime("%Y-%m-%d"),
                "reorder_point": product_def["reorder_point"],
                "supplier": product_def["default_supplier"],
            })
    
    return inventory

# Initialize inventory (will be regenerated on each server start for fresh demo)
SAMPLE_INVENTORY: List[dict] = generate_dynamic_inventory()

# Historical ESG performance (from config)
ESG_MONTHLY_TREND = ESG_HISTORICAL_TREND

# ============== HELPER FUNCTIONS ==============

def get_days_until_expiry(expiry_date: str) -> int:
    """Calculate days until expiry from today"""
    today = get_current_date()
    expiry = datetime.strptime(expiry_date, "%Y-%m-%d").date()
    return (expiry - today).days

def check_upcoming_festival(days_ahead: int = None) -> Optional[dict]:
    """Check if there's a festival within the specified days"""
    if days_ahead is None:
        days_ahead = ForecastConfig.DEFAULT_FORECAST_DAYS
    
    today = get_current_date()
    current_year = today.year
    
    # Check festivals for current and next year
    all_festivals = get_malaysian_festivals(current_year) + get_malaysian_festivals(current_year + 1)
    
    for festival in all_festivals:
        festival_date = datetime.strptime(festival["date"], "%Y-%m-%d").date()
        days_until = (festival_date - today).days
        if 0 <= days_until <= days_ahead:
            return {**festival, "days_until": days_until}
    return None

def is_payday_period() -> bool:
    """Check if current date is in payday period"""
    day = get_current_datetime().day
    return any(start <= day <= end for start, end in PAYDAY_PERIODS)

def generate_forecast(product: dict, days: int = None) -> dict:
    """Generate demand forecast using Prophet ML model with fallback."""
    if days is None:
        days = ForecastConfig.DEFAULT_FORECAST_DAYS
    
    product_id = product["id"]
    product_name = product["name"]
    
    # Try Prophet first
    if PROPHET_AVAILABLE:
        try:
            forecast = prophet_forecast(product_id, days)
            if forecast:
                return {
                    "product_id": product_id,
                    "product_name": product_name,
                    "dates": forecast["dates"],
                    "predicted_demand": forecast["predicted_demand"],
                    "confidence_lower": forecast["confidence_lower"],
                    "confidence_upper": forecast["confidence_upper"],
                    "trend": forecast["trend"],
                    "festive_impact": forecast["festive_impact"]
                }
        except Exception as e:
            print(f"Prophet forecast failed for {product_id}: {e}")
    
    # Fallback to heuristic model
    return generate_fallback_forecast(product, days)


def generate_fallback_forecast(product: dict, days: int = None) -> dict:
    """Fallback heuristic forecast when Prophet is unavailable."""
    if days is None:
        days = ForecastConfig.DEFAULT_FORECAST_DAYS
    
    base_demand = product["current_stock"] * ForecastConfig.FALLBACK_BASE_DEMAND_FACTOR
    
    upcoming_festival = check_upcoming_festival(days)
    festive_multiplier = 1.0
    festive_impact = None
    
    if upcoming_festival and product["category"] in upcoming_festival["affected_categories"]:
        festive_multiplier = upcoming_festival["demand_multiplier"]
        festive_impact = f"{upcoming_festival['name']} ({upcoming_festival['days_until']} days)"
    
    payday_multiplier = ForecastConfig.FALLBACK_PAYDAY_MULTIPLIER if is_payday_period() else 1.0
    
    dates = []
    predictions = []
    conf_lower = []
    conf_upper = []
    
    today = get_current_datetime()
    for i in range(days):
        date = today + timedelta(days=i)
        dates.append(date.strftime("%Y-%m-%d"))
        
        weekend_factor = ForecastConfig.FALLBACK_WEEKEND_MULTIPLIER if date.weekday() >= 5 else 1.0
        
        if upcoming_festival:
            days_to_festival = upcoming_festival["days_until"] - i
            if days_to_festival > 0:
                ramp_factor = 1 + (festive_multiplier - 1) * (1 - days_to_festival / days)
            else:
                ramp_factor = festive_multiplier
        else:
            ramp_factor = 1.0
        
        pred = base_demand * weekend_factor * payday_multiplier * ramp_factor
        noise = random.uniform(-0.1, 0.1) * pred
        pred += noise
        
        predictions.append(round(pred, 1))
        conf_interval = ForecastConfig.FALLBACK_CONFIDENCE_INTERVAL
        conf_lower.append(round(pred * (1 - conf_interval), 1))
        conf_upper.append(round(pred * (1 + conf_interval), 1))
    
    half = days // 2
    avg_first_half = sum(predictions[:half]) / half if half > 0 else 0
    avg_second_half = sum(predictions[half:]) / (days - half) if (days - half) > 0 else 0
    
    if avg_second_half > avg_first_half * ForecastConfig.TREND_INCREASE_THRESHOLD:
        trend = "increasing"
    elif avg_second_half < avg_first_half * ForecastConfig.TREND_DECREASE_THRESHOLD:
        trend = "decreasing"
    else:
        trend = "stable"
    
    return {
        "product_id": product["id"],
        "product_name": product["name"],
        "dates": dates,
        "predicted_demand": predictions,
        "confidence_lower": conf_lower,
        "confidence_upper": conf_upper,
        "trend": trend,
        "festive_impact": festive_impact
    }

def generate_preparation_alerts() -> List[dict]:
    """Generate preparation alerts based on forecasting"""
    alerts = []
    upcoming_festival = check_upcoming_festival()
    
    for product in SAMPLE_INVENTORY:
        forecast = generate_forecast(product)
        total_predicted = sum(forecast["predicted_demand"])
        
        # Check for demand spike (using config threshold)
        if forecast["trend"] == "increasing" and total_predicted > product["current_stock"]:
            severity = "high" if total_predicted > product["current_stock"] * InventoryConfig.DEMAND_SPIKE_FACTOR else "medium"
            shortage = total_predicted - product["current_stock"]
            
            alerts.append({
                "id": f"PA-{product['id']}-{get_current_datetime().strftime('%Y%m%d')}",
                "product_id": product["id"],
                "product_name": product["name"],
                "alert_type": "demand_spike" if not upcoming_festival else "festive_surge",
                "severity": severity,
                "message": f"Predicted demand ({total_predicted:.0f} {product['unit']}) exceeds current stock ({product['current_stock']} {product['unit']})",
                "recommended_action": f"Order additional {shortage:.0f} {product['unit']} from {product['supplier']}",
                "predicted_demand_increase": ((total_predicted / product["current_stock"]) - 1) * 100 if product["current_stock"] > 0 else 100,
                "days_until_event": upcoming_festival["days_until"] if upcoming_festival else ForecastConfig.DEFAULT_FORECAST_DAYS // 2,
                "created_at": get_current_datetime().isoformat()
            })
        
        # Check for stock-out risk (using config threshold)
        if product["current_stock"] <= product["reorder_point"]:
            alerts.append({
                "id": f"PA-REORDER-{product['id']}",
                "product_id": product["id"],
                "product_name": product["name"],
                "alert_type": "stock_out_risk",
                "severity": "high" if product["current_stock"] < product["reorder_point"] * InventoryConfig.LOW_STOCK_CRITICAL_FACTOR else "medium",
                "message": f"Stock ({product['current_stock']} {product['unit']}) at or below reorder point ({product['reorder_point']} {product['unit']})",
                "recommended_action": f"Immediate reorder required from {product['supplier']}",
                "predicted_demand_increase": 0,
                "days_until_event": PricingConfig.IMMEDIATE_REORDER_DAYS,
                "created_at": get_current_datetime().isoformat()
            })
    
    return alerts

def generate_sustainability_alerts() -> List[dict]:
    """Generate sustainability alerts for expiry risk and overstock"""
    alerts = []
    
    for product in SAMPLE_INVENTORY:
        # Skip products with no stock
        if product["current_stock"] <= 0:
            continue
            
        days_until_expiry = get_days_until_expiry(product["expiry_date"])
        
        # Expiry risk alert (using config thresholds)
        if days_until_expiry <= InventoryConfig.EXPIRY_ALERT_DAYS:
            waste_risk_kg = product["current_stock"] if product["unit"] == "kg" else product["current_stock"] * ESGConfig.NON_KG_UNIT_WEIGHT
            potential_loss = product["current_stock"] * product["cost_per_unit"]
            
            if days_until_expiry <= InventoryConfig.EXPIRY_CRITICAL_DAYS:
                severity = "high"
                action = f"URGENT: Apply {PricingConfig.CRITICAL_MARKDOWN_PERCENT}% markdown or donate to food bank immediately"
            elif days_until_expiry <= InventoryConfig.EXPIRY_WARNING_DAYS:
                severity = "medium"
                action = f"Apply {PricingConfig.WARNING_DISCOUNT_PERCENT}% discount to accelerate sales"
            else:
                severity = "low"
                action = f"Consider promotional pricing or bundle deals"
            
            alerts.append({
                "id": f"SA-{product['id']}-{get_current_datetime().strftime('%Y%m%d')}",
                "product_id": product["id"],
                "product_name": product["name"],
                "alert_type": "expiry_risk",
                "severity": severity,
                "message": f"Product expires in {days_until_expiry} day(s) - {product['current_stock']} {product['unit']} at risk",
                "recommended_action": action,
                "days_until_expiry": days_until_expiry,
                "potential_waste_kg": round(waste_risk_kg, 2),
                "potential_loss_rm": round(potential_loss, 2),
                "created_at": get_current_datetime().isoformat()
            })
        
        # Overstock detection (using config thresholds)
        overstock_threshold = product["reorder_point"] * InventoryConfig.OVERSTOCK_FACTOR
        if product["current_stock"] > overstock_threshold and days_until_expiry <= InventoryConfig.OVERSTOCK_EXPIRY_WINDOW_DAYS:
            excess_stock = product["current_stock"] - (product["reorder_point"] * 2)
            waste_risk_kg = excess_stock * (ESGConfig.NON_KG_UNIT_WEIGHT if product["unit"] != "kg" else 1)
            alerts.append({
                "id": f"SA-OVER-{product['id']}",
                "product_id": product["id"],
                "product_name": product["name"],
                "alert_type": "overstock",
                "severity": "medium",
                "message": f"Overstock detected: {product['current_stock']} {product['unit']} (reorder point: {product['reorder_point']})",
                "recommended_action": "Reduce incoming orders and implement promotional pricing",
                "days_until_expiry": days_until_expiry,
                "potential_waste_kg": round(waste_risk_kg, 2),
                "potential_loss_rm": round(waste_risk_kg * product["cost_per_unit"], 2),
                "created_at": get_current_datetime().isoformat()
            })
    
    return alerts

def calculate_esg_metrics() -> dict:
    """Calculate ESG metrics for the dashboard"""
    # Use tracked metrics from user actions
    waste_saved_kg = WASTE_TRACKER["total_waste_saved_kg"]
    items_rescued = WASTE_TRACKER["total_items_rescued"]
    cost_savings = WASTE_TRACKER["total_cost_saved_rm"]
    
    # Calculate methane offset using IPCC standard factor from config
    methane_offset = waste_saved_kg * ESGConfig.METHANE_CONVERSION_FACTOR
    
    # Waste reduction percentage (compared to baseline from config)
    waste_reduction_pct = (waste_saved_kg / ESGConfig.BASELINE_MONTHLY_WASTE_KG) * 100
    
    # Compliance score calculation using config values
    compliance_score = min(
        ESGConfig.BASE_COMPLIANCE_SCORE + (items_rescued * ESGConfig.COMPLIANCE_IMPROVEMENT_PER_ITEM),
        ESGConfig.MAX_COMPLIANCE_SCORE
    )
    
    return {
        "waste_saved_kg": round(waste_saved_kg, 1),
        "methane_offset_kg_co2e": round(methane_offset, 2),
        "cost_savings_rm": round(cost_savings, 2),
        "items_rescued": items_rescued,
        "waste_reduction_percentage": round(waste_reduction_pct, 1),
        "compliance_score": round(compliance_score, 1),
        "monthly_trend": ESG_MONTHLY_TREND
    }

def get_ai_insight(product_id: str, quantity: int) -> dict:
    """Generate AI insight for adding stock"""
    product_def = next((p for p in PRODUCT_DEFINITIONS if p["id"] == product_id), None)
    if not product_def:
        return {"recommendation": "Product not found", "risk_level": "medium"}
    
    current_item = next((p for p in SAMPLE_INVENTORY if p["id"] == product_id), None)
    current_stock = current_item["current_stock"] if current_item else 0
    
    # Check upcoming festival
    upcoming_festival = check_upcoming_festival()
    festival_warning = None
    demand_multiplier = 1.0
    
    if upcoming_festival and product_def["category"] in upcoming_festival["affected_categories"]:
        festival_warning = f"{upcoming_festival['name']} in {upcoming_festival['days_until']} days"
        demand_multiplier = upcoming_festival["demand_multiplier"]
    
    # Calculate expected daily demand (base is reorder_point / 7 days worth)
    base_daily_demand = product_def["reorder_point"] / 7
    adjusted_demand = base_daily_demand * demand_multiplier
    
    # Payday boost
    if is_payday_period():
        adjusted_demand *= ForecastConfig.FALLBACK_PAYDAY_MULTIPLIER
    
    # Calculate forecast period demand
    forecast_days = ForecastConfig.DEFAULT_FORECAST_DAYS
    forecast_demand = adjusted_demand * forecast_days
    
    # Suggested quantity based on forecast minus current stock
    suggested = max(0, round(forecast_demand - current_stock))
    
    # Determine risk level and recommendation
    total_after = current_stock + quantity
    shelf_life = product_def["shelf_life_days"]
    coverage_days = total_after / adjusted_demand if adjusted_demand > 0 else 999
    
    shelf_life_with_buffer = shelf_life + InventoryConfig.SHELF_LIFE_BUFFER_DAYS
    if coverage_days > shelf_life_with_buffer:
        risk_level = "high"
        recommendation = f"WARNING: Stock may expire before selling. You're ordering {quantity} {product_def['unit']} but only need ~{suggested} {product_def['unit']} for the next {shelf_life} days."
    elif coverage_days < InventoryConfig.MIN_COVERAGE_DAYS:
        risk_level = "medium"
        recommendation = f"Consider ordering more. Current order of {quantity} {product_def['unit']} covers only {coverage_days:.0f} days."
    else:
        risk_level = "low"
        if festival_warning:
            recommendation = f"Good order quantity! {festival_warning} - demand expected to increase {(demand_multiplier-1)*100:.0f}%."
        else:
            recommendation = f"Good order quantity. This covers approximately {coverage_days:.0f} days of expected demand."
    
    return {
        "recommendation": recommendation,
        "demand_forecast": round(forecast_demand, 1),
        "festival_warning": festival_warning,
        "suggested_quantity": suggested,
        "risk_level": risk_level,
        "current_stock": current_stock,
        "coverage_days": round(coverage_days, 1),
        "daily_demand": round(adjusted_demand, 1)
    }

# ============== API ENDPOINTS ==============

@app.get("/")
def root():
    return {
        "message": "FreshPredict API - AI-driven inventory decision-support for Malaysian SME grocers",
        "version": "1.0.0",
        "endpoints": ["/inventory", "/forecast", "/alerts/preparation", "/alerts/sustainability", "/esg", "/dashboard"]
    }

@app.get("/inventory", response_model=List[InventoryItem])
def get_inventory(category: Optional[str] = None):
    """Get all inventory items, optionally filtered by category"""
    items = SAMPLE_INVENTORY
    if category:
        items = [item for item in items if item["category"] == category]
    return items

@app.get("/inventory/{item_id}")
def get_inventory_item(item_id: str):
    """Get a specific inventory item"""
    for item in SAMPLE_INVENTORY:
        if item["id"] == item_id:
            days_to_expiry = get_days_until_expiry(item["expiry_date"])
            return {**item, "days_until_expiry": days_to_expiry}
    raise HTTPException(status_code=404, detail="Item not found")

@app.post("/inventory/add")
def add_stock(request: AddStockRequest):
    """Add stock to inventory"""
    global SAMPLE_INVENTORY
    
    # Find the product definition
    product_def = next((p for p in PRODUCT_DEFINITIONS if p["id"] == request.product_id), None)
    if not product_def:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Find existing inventory item
    existing_item = next((p for p in SAMPLE_INVENTORY if p["id"] == request.product_id), None)
    
    if existing_item:
        # Update existing stock
        existing_item["current_stock"] += request.quantity
        # Update expiry if new batch has later expiry (FIFO would be more complex)
        if request.expiry_date > existing_item["expiry_date"]:
            existing_item["expiry_date"] = request.expiry_date
        if request.supplier:
            existing_item["supplier"] = request.supplier
        return {"message": f"Added {request.quantity} {product_def['unit']} to {product_def['name']}", "item": existing_item}
    else:
        # Create new inventory entry
        new_item = {
            "id": product_def["id"],
            "name": product_def["name"],
            "category": product_def["category"],
            "current_stock": request.quantity,
            "unit": product_def["unit"],
            "cost_per_unit": product_def["cost_per_unit"],
            "expiry_date": request.expiry_date,
            "reorder_point": product_def["reorder_point"],
            "supplier": request.supplier or product_def["default_supplier"],
        }
        SAMPLE_INVENTORY.append(new_item)
        return {"message": f"Created new inventory for {product_def['name']}", "item": new_item}

@app.get("/inventory/insight/{product_id}")
def get_stock_insight(product_id: str, quantity: int = 0):
    """Get AI insight for adding stock"""
    insight = get_ai_insight(product_id, quantity)
    return insight

@app.get("/products")
def get_products():
    """Get list of available products (for dropdown)"""
    return [{
        "id": p["id"],
        "name": p["name"],
        "category": p["category"],
        "unit": p["unit"],
        "cost_per_unit": p["cost_per_unit"],
        "shelf_life_days": p["shelf_life_days"],
        "default_supplier": p["default_supplier"],
        "suggested_expiry": (get_current_date() + timedelta(days=p["shelf_life_days"])).strftime("%Y-%m-%d")
    } for p in PRODUCT_DEFINITIONS]

@app.get("/suppliers/{category}")
def get_suppliers(category: str):
    """Get suppliers for a category"""
    if category in SUPPLIERS:
        return SUPPLIERS[category]
    return []

@app.get("/forecast/{product_id}", response_model=ForecastResult)
def get_forecast(product_id: str, days: int = None):
    """Get demand forecast for a specific product"""
    if days is None:
        days = ForecastConfig.DEFAULT_FORECAST_DAYS
    
    for product in SAMPLE_INVENTORY:
        if product["id"] == product_id:
            return generate_forecast(product, days)
    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/forecast", response_model=List[ForecastResult])
def get_all_forecasts(days: int = None):
    """Get demand forecasts for all products"""
    if days is None:
        days = ForecastConfig.DEFAULT_FORECAST_DAYS
    
    return [generate_forecast(product, days) for product in SAMPLE_INVENTORY]

@app.get("/alerts/preparation", response_model=List[PreparationAlert])
def get_preparation_alerts(severity: Optional[str] = None):
    """Get preparation alerts (demand spikes, stock-out risks)"""
    alerts = generate_preparation_alerts()
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    return sorted(alerts, key=lambda x: {"high": 0, "medium": 1, "low": 2}[x["severity"]])

@app.get("/alerts/sustainability", response_model=List[SustainabilityAlert])
def get_sustainability_alerts(severity: Optional[str] = None):
    """Get sustainability alerts (expiry risk, overstock)"""
    alerts = generate_sustainability_alerts()
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    return sorted(alerts, key=lambda x: x["days_until_expiry"])

@app.post("/alerts/mark-sold")
def mark_alert_as_sold(request: MarkSoldRequest):
    """Mark an expiry risk item as sold - updates ESG metrics and inventory"""
    global SAMPLE_INVENTORY
    
    # Find the product in inventory
    product = next((p for p in SAMPLE_INVENTORY if p["id"] == request.product_id), None)
    if not product:
        return {"success": False, "message": "Product not found"}
    
    # Calculate units to subtract from stock
    if product["unit"] == "kg":
        units_sold = request.quantity_kg
    else:
        # Reverse the weight conversion
        units_sold = request.quantity_kg / ESGConfig.NON_KG_UNIT_WEIGHT
    
    # Update inventory stock
    product["current_stock"] = max(0, product["current_stock"] - units_sold)
    
    # Record the sale
    WASTE_TRACKER["items_sold"].append({
        "product_id": request.product_id,
        "quantity_kg": request.quantity_kg,
        "cost_rm": request.cost_rm,
        "timestamp": get_current_datetime().isoformat(),
        "alert_id": request.alert_id
    })
    
    # Update totals
    WASTE_TRACKER["total_waste_saved_kg"] += request.quantity_kg
    WASTE_TRACKER["total_items_rescued"] += 1
    WASTE_TRACKER["total_cost_saved_rm"] += request.cost_rm
    
    # Calculate new methane offset using config factor
    new_methane_offset = WASTE_TRACKER["total_waste_saved_kg"] * ESGConfig.METHANE_CONVERSION_FACTOR
    
    return {
        "success": True,
        "message": f"Marked {request.quantity_kg} kg as sold - waste prevented!",
        "updated_metrics": {
            "waste_saved_kg": round(WASTE_TRACKER["total_waste_saved_kg"], 1),
            "methane_offset_kg_co2e": round(new_methane_offset, 2),
            "items_rescued": WASTE_TRACKER["total_items_rescued"],
            "cost_saved_rm": round(WASTE_TRACKER["total_cost_saved_rm"], 2)
        },
        "remaining_stock": round(product["current_stock"], 1)
    }

@app.post("/alerts/mark-donated")
def mark_alert_as_donated(request: MarkDonatedRequest):
    """Mark an expiry risk item as donated - updates ESG metrics and inventory"""
    global SAMPLE_INVENTORY
    
    # Find the product in inventory
    product = next((p for p in SAMPLE_INVENTORY if p["id"] == request.product_id), None)
    if not product:
        return {"success": False, "message": "Product not found"}
    
    # Calculate units to subtract from stock
    if product["unit"] == "kg":
        units_donated = request.quantity_kg
    else:
        # Reverse the weight conversion
        units_donated = request.quantity_kg / ESGConfig.NON_KG_UNIT_WEIGHT
    
    # Update inventory stock
    product["current_stock"] = max(0, product["current_stock"] - units_donated)
    
    # Record the donation
    WASTE_TRACKER["items_donated"].append({
        "product_id": request.product_id,
        "quantity_kg": request.quantity_kg,
        "cost_rm": request.cost_rm,
        "timestamp": get_current_datetime().isoformat(),
        "alert_id": request.alert_id,
        "recipient": request.recipient or "Local Food Bank"
    })
    
    # Update totals (donations count toward waste saved)
    WASTE_TRACKER["total_waste_saved_kg"] += request.quantity_kg
    WASTE_TRACKER["total_items_rescued"] += 1
    WASTE_TRACKER["total_donated_kg"] += request.quantity_kg
    WASTE_TRACKER["total_donated_items"] += 1
    # Donations get tax benefit - record the value but don't add to cost_saved
    # since it wasn't sold (could add tax credit calculation here)
    
    # Calculate new methane offset using config factor
    new_methane_offset = WASTE_TRACKER["total_waste_saved_kg"] * ESGConfig.METHANE_CONVERSION_FACTOR
    
    return {
        "success": True,
        "message": f"Donated {request.quantity_kg} kg to {request.recipient or 'Local Food Bank'} - thank you!",
        "updated_metrics": {
            "waste_saved_kg": round(WASTE_TRACKER["total_waste_saved_kg"], 1),
            "methane_offset_kg_co2e": round(new_methane_offset, 2),
            "items_rescued": WASTE_TRACKER["total_items_rescued"],
            "items_donated": WASTE_TRACKER["total_donated_items"],
            "donated_kg": round(WASTE_TRACKER["total_donated_kg"], 1)
        },
        "remaining_stock": round(product["current_stock"], 1)
    }

@app.get("/esg", response_model=ESGMetrics)
def get_esg_metrics():
    """Get ESG metrics for sustainability reporting"""
    return calculate_esg_metrics()

@app.get("/dashboard", response_model=DashboardSummary)
def get_dashboard_summary():
    """Get dashboard summary with all key metrics"""
    low_stock = sum(1 for item in SAMPLE_INVENTORY if item["current_stock"] <= item["reorder_point"])
    expiry_risk = sum(1 for item in SAMPLE_INVENTORY if get_days_until_expiry(item["expiry_date"]) <= InventoryConfig.EXPIRY_ALERT_DAYS)
    total_value = sum(item["current_stock"] * item["cost_per_unit"] for item in SAMPLE_INVENTORY)
    
    return {
        "total_products": len(SAMPLE_INVENTORY),
        "low_stock_count": low_stock,
        "expiry_risk_count": expiry_risk,
        "preparation_alerts_count": len(generate_preparation_alerts()),
        "sustainability_alerts_count": len(generate_sustainability_alerts()),
        "total_inventory_value_rm": round(total_value, 2),
        "esg_metrics": calculate_esg_metrics()
    }

@app.get("/festivals")
def get_upcoming_festivals():
    """Get upcoming Malaysian festivals with demand impact"""
    today = get_current_date()
    current_year = today.year
    
    # Get festivals for current and next year
    all_festivals = get_malaysian_festivals(current_year) + get_malaysian_festivals(current_year + 1)
    
    upcoming = []
    for festival in all_festivals:
        festival_date = datetime.strptime(festival["date"], "%Y-%m-%d").date()
        days_until = (festival_date - today).days
        if days_until >= 0:
            upcoming.append({**festival, "days_until": days_until})
    
    return sorted(upcoming, key=lambda x: x["days_until"])


@app.get("/paydays")
def get_upcoming_paydays():
    """Get upcoming payday periods with demand impact"""
    today = get_current_datetime()
    current_day = today.day
    current_month = today.month
    current_year = today.year
    
    paydays = []
    
    # Check current and next 2 months for payday periods
    for month_offset in range(3):
        if month_offset == 0:
            check_month = current_month
            check_year = current_year
        else:
            check_month = current_month + month_offset
            check_year = current_year
            if check_month > 12:
                check_month -= 12
                check_year += 1
        
        # Get last day of the month
        if check_month == 12:
            last_day = 31
        else:
            next_month = datetime(check_year, check_month + 1, 1)
            last_day = (next_month - timedelta(days=1)).day
        
        for start_day, end_day in PAYDAY_PERIODS:
            # Adjust end_day if it exceeds month length
            actual_end = min(end_day, last_day)
            
            # Create date for start of payday period
            try:
                period_start = datetime(check_year, check_month, start_day).date()
                period_end = datetime(check_year, check_month, actual_end).date()
            except ValueError:
                continue
            
            days_until_start = (period_start - today.date()).days
            days_until_end = (period_end - today.date()).days
            
            # Include if period is upcoming or currently active
            if days_until_end >= 0:
                # Check if we're currently in this payday period
                is_active = days_until_start <= 0 and days_until_end >= 0
                
                paydays.append({
                    "name": "Payday Period" if start_day >= 25 else "Post-Payday Spending",
                    "start_date": period_start.isoformat(),
                    "end_date": period_end.isoformat(),
                    "days_until": max(0, days_until_start),
                    "is_active": is_active,
                    "demand_multiplier": ForecastConfig.FALLBACK_PAYDAY_MULTIPLIER,
                    "affected_categories": ["all"]
                })
    
    # Sort by days_until and remove duplicates based on start_date
    seen_dates = set()
    unique_paydays = []
    for p in sorted(paydays, key=lambda x: x["days_until"]):
        if p["start_date"] not in seen_dates:
            seen_dates.add(p["start_date"])
            unique_paydays.append(p)
    
    return unique_paydays[:6]  # Return next 6 payday periods

# Legacy endpoint for backwards compatibility
@app.get("/predict/{product_name}")
def get_prediction(product_name: str):
    """Legacy prediction endpoint"""
    for product in SAMPLE_INVENTORY:
        if product_name.lower() in product["name"].lower():
            forecast = generate_forecast(product)
            return {
                "product": product["name"],
                "predicted_demand": sum(forecast["predicted_demand"]),
                "waste_risk": "High" if get_days_until_expiry(product["expiry_date"]) <= 3 else "Low",
                "trend": forecast["trend"]
            }
    return {
        "product": product_name,
        "predicted_demand": 55,
        "waste_risk": "Unknown"
    }


# ============== MODEL STATUS ==============

@app.get("/model/status")
def get_model_status():
    """Get AI model status and information"""
    if PROPHET_AVAILABLE:
        try:
            products = get_available_products()
            return {
                "status": "active",
                "model": "Prophet",
                "version": "1.1.5",
                "products_trained": len(products),
                "features": [
                    "Weekly seasonality",
                    "Malaysian holidays (CNY, Raya, Deepavali)",
                    "Payday cycle effects",
                    "Weekend demand boost"
                ],
                "description": "Facebook Prophet time-series forecasting model trained on historical sales data"
            }
        except Exception as e:
            return {
                "status": "error",
                "model": "Prophet",
                "error": str(e)
            }
    else:
        return {
            "status": "fallback",
            "model": "Heuristic",
            "description": "Using rule-based forecasting (Prophet not installed)"
        }


@app.on_event("startup")
async def startup_event():
    """Initialize Prophet models on startup for faster inference"""
    if PROPHET_AVAILABLE:
        print("Initializing Prophet models...")
        try:
            initialize_models()
            print("Prophet models initialized successfully")
        except Exception as e:
            print(f"Warning: Could not initialize Prophet models: {e}")


# ============== DEMO MODE ENDPOINTS ==============

class DemoDateRequest(BaseModel):
    date: str  # Format: YYYY-MM-DD

class DemoScenario(BaseModel):
    scenario: str  # "pre_hari_raya", "pre_cny", "expiry_crisis", "normal", "payday"

@app.get("/demo/status")
def get_demo_status():
    """Get current demo mode status"""
    return {
        "enabled": DEMO_MODE["enabled"],
        "simulated_date": DEMO_MODE["simulated_date"].strftime("%Y-%m-%d") if DEMO_MODE["simulated_date"] else None,
        "actual_date": datetime.now().strftime("%Y-%m-%d"),
        "available_scenarios": [
            {"id": "pre_hari_raya", "name": "7 Days Before Hari Raya", "date": "2026-03-13", "description": "Show festive demand surge alerts"},
            {"id": "pre_cny", "name": "7 Days Before CNY", "date": "2026-02-10", "description": "Show Chinese New Year preparation"},
            {"id": "expiry_crisis", "name": "Items Expiring Soon", "date": None, "description": "Regenerate data with items expiring in 1-2 days"},
            {"id": "payday", "name": "Payday Period", "date": "2026-03-27", "description": "Show payday demand boost"},
            {"id": "normal", "name": "Normal Day", "date": None, "description": "Reset to current date"}
        ]
    }

@app.post("/demo/set-date")
def set_demo_date(request: DemoDateRequest):
    """Set a simulated date for demo purposes"""
    global DEMO_MODE, SAMPLE_INVENTORY
    
    try:
        simulated = datetime.strptime(request.date, "%Y-%m-%d")
        DEMO_MODE["enabled"] = True
        DEMO_MODE["simulated_date"] = simulated
        
        # Regenerate inventory with new date context
        SAMPLE_INVENTORY = generate_dynamic_inventory()
        
        # Check for upcoming festivals
        upcoming = check_upcoming_festival()
        festival_info = f" ({upcoming['name']} in {upcoming['days_until']} days)" if upcoming else ""
        
        return {
            "success": True,
            "message": f"Demo mode enabled. Simulating date: {request.date}{festival_info}",
            "simulated_date": request.date,
            "upcoming_festival": upcoming
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format. Use YYYY-MM-DD. Error: {str(e)}")

@app.post("/demo/scenario")
def set_demo_scenario(request: DemoScenario):
    """Set a predefined demo scenario"""
    global DEMO_MODE, SAMPLE_INVENTORY, WASTE_TRACKER
    
    scenarios = {
        "pre_hari_raya": {"date": "2026-03-13", "description": "7 days before Hari Raya Aidilfitri"},
        "pre_cny": {"date": "2026-02-10", "description": "7 days before Chinese New Year"},
        "payday": {"date": "2026-03-27", "description": "Payday period (end of month)"},
        "deepavali": {"date": "2026-11-01", "description": "7 days before Deepavali"},
        "normal": {"date": None, "description": "Reset to actual date"},
    }
    
    if request.scenario not in scenarios and request.scenario != "expiry_crisis":
        raise HTTPException(
            status_code=400, 
            detail=f"Unknown scenario. Available: {', '.join(list(scenarios.keys()) + ['expiry_crisis'])}"
        )
    
    if request.scenario == "normal":
        # Reset to actual date
        DEMO_MODE["enabled"] = False
        DEMO_MODE["simulated_date"] = None
        SAMPLE_INVENTORY = generate_dynamic_inventory()
        return {
            "success": True,
            "message": "Demo mode disabled. Using actual date.",
            "simulated_date": None
        }
    
    if request.scenario == "expiry_crisis":
        # Keep current date but regenerate inventory with items about to expire
        DEMO_MODE["enabled"] = False
        DEMO_MODE["simulated_date"] = None
        
        # Generate special inventory with critical expiry dates
        today = get_current_date()
        inventory = []
        for i, scenario in enumerate(DEMO_STOCK_SCENARIOS):
            product_def = next((p for p in PRODUCT_DEFINITIONS if p["id"] == scenario["id"]), None)
            if product_def:
                # Make 60% of items expire in 1-3 days
                if i % 5 < 3:
                    expiry_offset = random.randint(1, 3)
                else:
                    expiry_offset = scenario["expiry_offset"]
                    
                expiry_date = today + timedelta(days=expiry_offset)
                inventory.append({
                    "id": product_def["id"],
                    "name": product_def["name"],
                    "category": product_def["category"],
                    "current_stock": scenario["stock"],
                    "unit": product_def["unit"],
                    "cost_per_unit": product_def["cost_per_unit"],
                    "expiry_date": expiry_date.strftime("%Y-%m-%d"),
                    "reorder_point": product_def["reorder_point"],
                    "supplier": product_def["default_supplier"],
                })
        
        SAMPLE_INVENTORY = inventory
        return {
            "success": True,
            "message": "Expiry crisis scenario loaded. Multiple items expiring soon!",
            "simulated_date": None,
            "expiring_soon_count": sum(1 for item in SAMPLE_INVENTORY if get_days_until_expiry(item["expiry_date"]) <= 3)
        }
    
    # Set predefined date scenario
    scenario_config = scenarios[request.scenario]
    simulated = datetime.strptime(scenario_config["date"], "%Y-%m-%d")
    DEMO_MODE["enabled"] = True
    DEMO_MODE["simulated_date"] = simulated
    
    # Regenerate inventory
    SAMPLE_INVENTORY = generate_dynamic_inventory()
    
    upcoming = check_upcoming_festival()
    
    return {
        "success": True,
        "message": f"Scenario '{request.scenario}' loaded: {scenario_config['description']}",
        "simulated_date": scenario_config["date"],
        "upcoming_festival": upcoming
    }

@app.post("/demo/reset")
def reset_demo():
    """Reset demo mode and regenerate all data"""
    global DEMO_MODE, SAMPLE_INVENTORY, WASTE_TRACKER
    
    # Reset demo mode
    DEMO_MODE["enabled"] = False
    DEMO_MODE["simulated_date"] = None
    
    # Regenerate inventory
    SAMPLE_INVENTORY = generate_dynamic_inventory()
    
    # Reset waste tracker to initial values
    WASTE_TRACKER["items_sold"] = []
    WASTE_TRACKER["total_waste_saved_kg"] = ESGConfig.INITIAL_WASTE_SAVED_KG
    WASTE_TRACKER["total_items_rescued"] = ESGConfig.INITIAL_ITEMS_RESCUED
    WASTE_TRACKER["total_cost_saved_rm"] = ESGConfig.INITIAL_COST_SAVED_RM
    
    return {
        "success": True,
        "message": "Demo reset complete. All data regenerated to initial state.",
        "current_date": datetime.now().strftime("%Y-%m-%d"),
        "inventory_count": len(SAMPLE_INVENTORY),
        "esg_metrics": calculate_esg_metrics()
    }