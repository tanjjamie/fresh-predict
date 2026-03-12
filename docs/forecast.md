# How FreshPredict Forecasting Works

## Overview

FreshPredict uses **Facebook Prophet**, a time-series forecasting algorithm designed to handle data with strong seasonal patterns and holidays. This document explains how the model works and what affects its predictions.

---

## What is Prophet?

Prophet is an open-source forecasting tool developed by Facebook (Meta). It's particularly good at:

- **Seasonal Data**: Sales that go up/down at predictable times (weekends, holidays, paydays)
- **Holiday Effects**: Automatic handling of special dates like Hari Raya and Chinese New Year
- **Robust to Missing Data**: Handles gaps in your sales history
- **Fast Training**: Retrains quickly when new data is added

---

## How FreshPredict Uses Prophet

### Training Data

The model learns from your historical sales data:

```
Required: At least 30 days of sales history per product
          (More data = more accurate predictions)

Uses:     - Date of each sale
          - Quantity sold each day
          - Product category
```

### Seasonal Patterns Detected

Prophet automatically finds these patterns in your data:

| Pattern | Description |
|---------|-------------|
| **Weekly** | Higher sales on weekends vs weekdays |
| **Yearly** | Seasonal trends (festive seasons, school holidays) |
| **Payday Effects** | Sales spike on 25th-5th of each month |

### Malaysian Holidays Built-In

FreshPredict includes Malaysian festivals that affect demand:

| Festival | Demand Impact | Categories Most Affected |
|----------|---------------|--------------------------|
| Chinese New Year | 2.5× normal | Poultry, Produce, Dairy |
| Hari Raya Aidilfitri | 3.0× normal | Poultry, Dairy |
| Deepavali | 2.0× normal | Produce, Dairy |
| Thaipusam | 1.3× normal | Produce |

**Preparation Period**: The model considers 7 days before each festival as a high-demand period.

---

## Understanding the Forecast Output

### What You See on the Dashboard

```
┌─────────────────────────────────────────────────────┐
│ Predicted Demand: 45 units                          │
│ Confidence Range: 38 - 52 units                     │
│ Trend: ↑ Increasing                                 │
│ Festival Alert: Hari Raya (12 days away)           │
└─────────────────────────────────────────────────────┘
```

### Interpreting the Numbers

| Value | Meaning |
|-------|---------|
| **Predicted Demand** | Best estimate of units you'll sell |
| **Confidence Range** | 80% chance actual sales fall in this range |
| **Trend** | Whether demand is going up, down, or staying flat |
| **Festival Alert** | Upcoming events that will affect demand |

---

## Accuracy & Limitations

### When the Model Works Best

✅ **High Accuracy Expected:**
- Products with consistent sales (daily sellers)
- Items with 60+ days of sales history
- Regular seasonal patterns
- Normal market conditions

### When Accuracy May Be Lower

⚠️ **Lower Accuracy Situations:**
- New products (< 30 days of data)
- Unpredictable events (sudden promotions, supply issues)
- Products with irregular sales (once-a-week items)
- Major market disruptions (economic changes, new competitors)

### Typical Accuracy Ranges

| Data Quality | Expected Accuracy |
|--------------|-------------------|
| Excellent (90+ days, daily sales) | ±10-15% of predicted |
| Good (60-90 days, regular sales) | ±15-20% of predicted |
| Minimal (30-60 days) | ±25-30% of predicted |

---

## How Predictions Improve Your Operations

### Ordering Decisions

```
If Predicted Demand > Current Stock:
   → "Order more - you may run out"
   → Suggested reorder quantity shown

If Current Stock > Predicted Demand:
   → "Well stocked - no rush to reorder"
   → Or warning if stock exceeds shelf life
```

### Markdown/Discount Triggers

| Days Until Expiry | Demand Forecast         | Action Suggested |
|-------------------|------------------------|------------------|
| ≤ 2 days | Higher than stock | Push quick sales |
| ≤ 2 days | Lower than stock | **50% markdown** |
| 3-4 days | Lower than stock | **30% discount** |
| 5+ days | Any | Normal pricing |

### Festival Preparation Alerts

When a festival is approaching:
1. Model detects the date
2. Applies the demand multiplier (2-3×)
3. **14 days before**: Sends preparation alert
4. **7 days before**: Marks as "High Demand Period"

---

## Technical Configuration

These settings can be adjusted by your administrator:

| Setting | Default | Description |
|---------|---------|-------------|
| `MIN_TRAINING_SAMPLES` | 30 | Minimum days of data needed |
| `DEFAULT_FORECAST_DAYS` | 14 | How far ahead to predict |
| `CHANGEPOINT_PRIOR_SCALE` | 0.05 | How quickly model adapts to changes |
| `SEASONALITY_MODE` | multiplicative | How seasonal effects are applied |
| `TREND_INCREASE_THRESHOLD` | 1.10 | 10% change = "increasing" trend |
| `TREND_DECREASE_THRESHOLD` | 0.90 | 10% drop = "decreasing" trend |

---

## ESG Carbon Calculations

When waste is prevented, we calculate environmental impact using:

```
CO₂e Offset = Waste Saved (kg) × 0.918 (kg CO₂e/kg)

Source: IPCC 2026 Guidelines for National Greenhouse Gas Inventories
        (Methane conversion factor for decomposing food waste)
```

### Environmental Equivalents

| Metric | Conversion |
|--------|------------|
| Trees equivalent | CO₂e ÷ 21 kg (yearly absorption per tree) |
| Car km avoided | CO₂e ÷ 0.12 kg (average emissions per km) |
| Meals saved | Waste kg ÷ 0.5 kg (average meal weight) |

---

## FAQ

**Q: Why is my prediction different from yesterday's?**
A: Prophet retrains with new sales data daily. Recent sales patterns affect the forecast.

**Q: The prediction seems too high/low. What should I do?**
A: Trust the confidence range (38-52 units in the example). Stock towards the middle and monitor actual sales.

**Q: Can I add custom holidays?**
A: Yes, contact your administrator. Custom holidays can be added to `config.py`.

**Q: How do I make predictions more accurate?**
A: 
1. Record all sales (don't miss any)
2. Keep at least 90 days of history
3. Mark wastage separately from sales
4. Use the system daily

---

## Summary

FreshPredict combines:
- **Prophet ML** for demand forecasting
- **Malaysian holiday calendar** for festival preparation
- **Payday tracking** for spending pattern awareness
- **IPCC standards** for ESG compliance

The model gets smarter over time as it learns from your actual sales data.
