"""
Synthetic Sales Data Generator for Malaysian Grocery
Includes: Seasonal patterns, weekly cycles, payday effects, and festival surges
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json

# Set random seed for reproducibility
np.random.seed(42)

# ============== CONFIGURATION ==============

# Malaysian Festivals 2026
FESTIVALS_2026 = {
    "Chinese New Year": {
        "date": datetime(2026, 2, 17),
        "prep_days": 14,  # Days before festival with elevated demand
        "peak_days": 3,   # Peak demand days
        "categories": ["poultry", "produce", "dairy"],
        "multiplier": 2.5
    },
    "Hari Raya Aidilfitri": {
        "date": datetime(2026, 3, 31),
        "prep_days": 21,
        "peak_days": 5,
        "categories": ["poultry", "dairy"],
        "multiplier": 3.0
    },
    "Deepavali": {
        "date": datetime(2026, 10, 20),
        "prep_days": 10,
        "peak_days": 3,
        "categories": ["produce", "dairy"],
        "multiplier": 2.0
    },
    "Christmas": {
        "date": datetime(2026, 12, 25),
        "prep_days": 14,
        "peak_days": 3,
        "categories": ["poultry", "dairy"],
        "multiplier": 1.8
    }
}

# Malaysian Monsoon Seasons (affects produce)
MONSOON_PERIODS = [
    # Northeast monsoon (Nov-Mar) - heavy rain on east coast
    {"start_month": 11, "end_month": 3, "region": "east", "produce_impact": 0.85},
    # Southwest monsoon (May-Sep) - moderate impact
    {"start_month": 5, "end_month": 9, "region": "west", "produce_impact": 0.92}
]

# Products with base daily demand and variability
PRODUCTS = [
    # Poultry
    {"id": "PLT001", "name": "Whole Chicken", "category": "poultry", "base_demand": 45, "variability": 0.15, "unit": "kg", "price": 12.50},
    {"id": "PLT002", "name": "Chicken Breast", "category": "poultry", "base_demand": 30, "variability": 0.18, "unit": "kg", "price": 18.00},
    {"id": "PLT003", "name": "Chicken Wings", "category": "poultry", "base_demand": 25, "variability": 0.20, "unit": "kg", "price": 15.50},
    {"id": "PLT004", "name": "Chicken Drumstick", "category": "poultry", "base_demand": 35, "variability": 0.15, "unit": "kg", "price": 14.00},
    {"id": "PLT005", "name": "Duck", "category": "poultry", "base_demand": 8, "variability": 0.25, "unit": "kg", "price": 28.00},
    
    # Produce
    {"id": "PRD001", "name": "Kangkung", "category": "produce", "base_demand": 20, "variability": 0.25, "unit": "kg", "price": 4.50},
    {"id": "PRD002", "name": "Pak Choy", "category": "produce", "base_demand": 18, "variability": 0.22, "unit": "kg", "price": 5.00},
    {"id": "PRD003", "name": "Tomatoes", "category": "produce", "base_demand": 25, "variability": 0.20, "unit": "kg", "price": 6.50},
    {"id": "PRD004", "name": "Carrots", "category": "produce", "base_demand": 15, "variability": 0.18, "unit": "kg", "price": 5.50},
    {"id": "PRD005", "name": "Spring Onions", "category": "produce", "base_demand": 12, "variability": 0.20, "unit": "kg", "price": 8.00},
    {"id": "PRD006", "name": "Chili Padi", "category": "produce", "base_demand": 8, "variability": 0.30, "unit": "kg", "price": 25.00},
    {"id": "PRD007", "name": "Ginger", "category": "produce", "base_demand": 10, "variability": 0.15, "unit": "kg", "price": 12.00},
    {"id": "PRD008", "name": "Garlic", "category": "produce", "base_demand": 12, "variability": 0.12, "unit": "kg", "price": 15.00},
    
    # Dairy
    {"id": "DRY001", "name": "Fresh Milk 1L", "category": "dairy", "base_demand": 40, "variability": 0.12, "unit": "units", "price": 7.50},
    {"id": "DRY002", "name": "Eggs (30 pack)", "category": "dairy", "base_demand": 55, "variability": 0.10, "unit": "packs", "price": 15.00},
    {"id": "DRY003", "name": "Butter 250g", "category": "dairy", "base_demand": 15, "variability": 0.15, "unit": "units", "price": 12.00},
    {"id": "DRY004", "name": "Yogurt", "category": "dairy", "base_demand": 20, "variability": 0.18, "unit": "units", "price": 5.50},
    {"id": "DRY005", "name": "Cheese Slices", "category": "dairy", "base_demand": 12, "variability": 0.20, "unit": "packs", "price": 9.00},
]


def get_weekly_multiplier(day_of_week: int) -> float:
    """
    Weekly demand pattern (0=Monday, 6=Sunday)
    Weekends have higher demand, mid-week lower
    """
    weekly_pattern = {
        0: 0.90,  # Monday - lower after weekend
        1: 0.85,  # Tuesday - lowest
        2: 0.88,  # Wednesday
        3: 0.95,  # Thursday - starts picking up
        4: 1.15,  # Friday - weekend prep
        5: 1.25,  # Saturday - peak
        6: 1.10,  # Sunday - still elevated
    }
    return weekly_pattern[day_of_week]


def get_payday_multiplier(day: int) -> float:
    """
    Malaysian payday effect: 25th to 5th of next month
    Government servants: 25th
    Private sector: varies but often end of month
    """
    if 25 <= day <= 31:
        # Ramp up from 25th
        return 1.0 + (day - 24) * 0.05  # 1.05 to 1.35
    elif 1 <= day <= 5:
        # Gradually decrease from 1st
        return 1.30 - (day - 1) * 0.05  # 1.30 to 1.10
    else:
        return 1.0


def get_festival_multiplier(date: datetime, category: str) -> tuple[float, str]:
    """
    Check if date falls within festival period and return multiplier
    Returns (multiplier, festival_name or None)
    """
    for festival_name, festival in FESTIVALS_2026.items():
        festival_date = festival["date"]
        prep_start = festival_date - timedelta(days=festival["prep_days"])
        peak_end = festival_date + timedelta(days=festival["peak_days"])
        
        if category not in festival["categories"]:
            continue
            
        if prep_start <= date <= peak_end:
            # Calculate position in festival period
            days_to_festival = (festival_date - date).days
            
            if days_to_festival > 0:
                # Prep period - gradual increase
                progress = 1 - (days_to_festival / festival["prep_days"])
                multiplier = 1.0 + (festival["multiplier"] - 1.0) * progress
            elif days_to_festival >= -festival["peak_days"]:
                # Peak period
                multiplier = festival["multiplier"]
            else:
                multiplier = 1.0
                
            return (multiplier, festival_name)
    
    return (1.0, None)


def get_monsoon_multiplier(date: datetime, category: str) -> float:
    """
    Monsoon impact on produce availability/demand
    """
    if category != "produce":
        return 1.0
    
    month = date.month
    for monsoon in MONSOON_PERIODS:
        start = monsoon["start_month"]
        end = monsoon["end_month"]
        
        # Handle year wraparound (Nov-Mar)
        if start > end:
            if month >= start or month <= end:
                return monsoon["produce_impact"]
        else:
            if start <= month <= end:
                return monsoon["produce_impact"]
    
    return 1.0


def generate_daily_sales(product: dict, date: datetime) -> dict:
    """
    Generate sales for a single product on a single day
    """
    base = product["base_demand"]
    
    # Apply all multipliers
    weekly_mult = get_weekly_multiplier(date.weekday())
    payday_mult = get_payday_multiplier(date.day)
    festival_mult, festival_name = get_festival_multiplier(date, product["category"])
    monsoon_mult = get_monsoon_multiplier(date, product["category"])
    
    # Combined multiplier
    total_multiplier = weekly_mult * payday_mult * festival_mult * monsoon_mult
    
    # Add random variability
    variability = product["variability"]
    noise = np.random.normal(1.0, variability)
    noise = max(0.5, min(1.5, noise))  # Clamp extreme values
    
    # Calculate final demand
    demand = base * total_multiplier * noise
    demand = max(1, round(demand))  # At least 1 unit sold
    
    # Calculate revenue
    revenue = demand * product["price"]
    
    return {
        "date": date.strftime("%Y-%m-%d"),
        "product_id": product["id"],
        "product_name": product["name"],
        "category": product["category"],
        "quantity_sold": demand,
        "unit": product["unit"],
        "unit_price": product["price"],
        "revenue": round(revenue, 2),
        "day_of_week": date.strftime("%A"),
        "is_weekend": date.weekday() >= 5,
        "is_payday_period": 25 <= date.day or date.day <= 5,
        "festival": festival_name,
        "weekly_multiplier": round(weekly_mult, 3),
        "payday_multiplier": round(payday_mult, 3),
        "festival_multiplier": round(festival_mult, 3),
        "monsoon_multiplier": round(monsoon_mult, 3),
    }


def generate_sales_data(start_date: datetime, end_date: datetime) -> pd.DataFrame:
    """
    Generate complete sales dataset for date range
    """
    all_sales = []
    current_date = start_date
    
    total_days = (end_date - start_date).days
    print(f"Generating {total_days} days of sales data for {len(PRODUCTS)} products...")
    
    while current_date <= end_date:
        for product in PRODUCTS:
            sale = generate_daily_sales(product, current_date)
            all_sales.append(sale)
        current_date += timedelta(days=1)
    
    df = pd.DataFrame(all_sales)
    print(f"Generated {len(df)} sales records")
    return df


def generate_summary_stats(df: pd.DataFrame) -> dict:
    """
    Generate summary statistics for the dataset
    """
    return {
        "total_records": len(df),
        "date_range": {
            "start": df["date"].min(),
            "end": df["date"].max()
        },
        "total_revenue": round(df["revenue"].sum(), 2),
        "products": len(df["product_id"].unique()),
        "by_category": df.groupby("category")["revenue"].sum().round(2).to_dict(),
        "festival_sales": df[df["festival"].notna()].groupby("festival")["revenue"].sum().round(2).to_dict(),
        "weekend_vs_weekday": {
            "weekend_avg": round(df[df["is_weekend"]]["quantity_sold"].mean(), 2),
            "weekday_avg": round(df[~df["is_weekend"]]["quantity_sold"].mean(), 2)
        },
        "payday_impact": {
            "payday_period_avg": round(df[df["is_payday_period"]]["quantity_sold"].mean(), 2),
            "non_payday_avg": round(df[~df["is_payday_period"]]["quantity_sold"].mean(), 2)
        }
    }


if __name__ == "__main__":
    # Generate 1 year of historical data (2025) + current year up to today
    # For training, we want historical data before Feb 2026
    
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2026, 2, 8)  # Current date
    
    print("=" * 60)
    print("FreshPredict - Synthetic Sales Data Generator")
    print("Malaysian Grocery Market Simulation")
    print("=" * 60)
    
    # Generate data
    df = generate_sales_data(start_date, end_date)
    
    # Save to CSV
    csv_path = "data/sales_history.csv"
    import os
    os.makedirs("data", exist_ok=True)
    df.to_csv(csv_path, index=False)
    print(f"\nSaved to {csv_path}")
    
    # Generate and save summary
    summary = generate_summary_stats(df)
    print("\n" + "=" * 60)
    print("DATASET SUMMARY")
    print("=" * 60)
    print(f"Total Records: {summary['total_records']:,}")
    print(f"Date Range: {summary['date_range']['start']} to {summary['date_range']['end']}")
    print(f"Total Revenue: RM {summary['total_revenue']:,.2f}")
    print(f"\nRevenue by Category:")
    for cat, rev in summary['by_category'].items():
        print(f"  {cat}: RM {rev:,.2f}")
    
    print(f"\nFestival Sales Impact:")
    for fest, rev in summary['festival_sales'].items():
        print(f"  {fest}: RM {rev:,.2f}")
    
    print(f"\nWeekend vs Weekday (avg units):")
    print(f"  Weekend: {summary['weekend_vs_weekday']['weekend_avg']}")
    print(f"  Weekday: {summary['weekend_vs_weekday']['weekday_avg']}")
    
    print(f"\nPayday Period Impact (avg units):")
    print(f"  Payday period (25th-5th): {summary['payday_impact']['payday_period_avg']}")
    print(f"  Non-payday period: {summary['payday_impact']['non_payday_avg']}")
    
    # Save summary as JSON
    with open("data/sales_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print(f"\nSummary saved to data/sales_summary.json")
    
    # Preview sample data
    print("\n" + "=" * 60)
    print("SAMPLE DATA (CNY Period - Feb 2026)")
    print("=" * 60)
    cny_data = df[(df["date"] >= "2026-02-01") & (df["date"] <= "2026-02-20") & (df["product_id"] == "PLT001")]
    print(cny_data[["date", "product_name", "quantity_sold", "festival", "festival_multiplier"]].to_string(index=False))
