# FreshPredict Demo Guide

This guide helps you showcase FreshPredict's AI-powered inventory management features effectively.

## Quick Start

```bash
# Terminal 1 - Start Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

- **Backend API**: http://localhost:8000
- **Frontend Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

---

## Demo Mode API

FreshPredict includes a **Demo Mode** that lets you simulate different dates and scenarios to showcase key features.

### Check Demo Status
```bash
curl http://localhost:8000/demo/status
```

### Available Scenarios

| Scenario | API Call | What It Shows |
|----------|----------|---------------|
| **Pre-Hari Raya** | `POST /demo/scenario` `{"scenario": "pre_hari_raya"}` | Festive demand surge 7 days before Hari Raya |
| **Pre-CNY** | `POST /demo/scenario` `{"scenario": "pre_cny"}` | Chinese New Year preparation alerts |
| **Payday Period** | `POST /demo/scenario` `{"scenario": "payday"}` | End-of-month demand boost |
| **Expiry Crisis** | `POST /demo/scenario` `{"scenario": "expiry_crisis"}` | Multiple items expiring in 1-3 days |
| **Reset** | `POST /demo/scenario` `{"scenario": "normal"}` | Return to actual date |

### Set Custom Date
```bash
curl -X POST http://localhost:8000/demo/set-date \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-03-13"}'
```

### Reset Everything
```bash
curl -X POST http://localhost:8000/demo/reset
```

---

## Demo Scenarios Walkthrough

### 🎉 Scenario 1: Festive Preparation (Hari Raya)

**Story**: "It's 7 days before Hari Raya. The AI system detects upcoming demand surge for poultry and dairy."

**Steps**:
1. Set scenario:
   ```bash
   curl -X POST http://localhost:8000/demo/scenario \
     -H "Content-Type: application/json" \
     -d '{"scenario": "pre_hari_raya"}'
   ```

2. View preparation alerts:
   ```bash
   curl http://localhost:8000/alerts/preparation
   ```

3. Check forecast for chicken:
   ```bash
   curl http://localhost:8000/forecast/chicken-whole
   ```

**Key Points to Highlight**:
- AI predicts **3x demand multiplier** for Hari Raya
- Preparation alerts appear 14 days in advance
- Recommended reorder quantities calculated automatically

---

### ⚠️ Scenario 2: Expiry Risk Management

**Story**: "Several items are about to expire. The system alerts the grocer to take action and prevent waste."

**Steps**:
1. Set scenario:
   ```bash
   curl -X POST http://localhost:8000/demo/scenario \
     -H "Content-Type: application/json" \
     -d '{"scenario": "expiry_crisis"}'
   ```

2. View sustainability alerts:
   ```bash
   curl http://localhost:8000/alerts/sustainability
   ```

3. Demonstrate marking item as sold (waste prevented):
   ```bash
   curl -X POST http://localhost:8000/alerts/mark-sold \
     -H "Content-Type: application/json" \
     -d '{
       "alert_id": "SA-chicken-whole-20260312",
       "product_id": "chicken-whole",
       "quantity_kg": 5.0,
       "cost_rm": 75.00
     }'
   ```

4. Check updated ESG metrics:
   ```bash
   curl http://localhost:8000/esg
   ```

**Key Points to Highlight**:
- Real-time expiry tracking with severity levels
- Recommended actions (markdown pricing, donations)
- ESG metrics update when waste is prevented
- Methane offset calculations (IPCC 2026 standards)

---

### 📊 Scenario 3: AI Forecasting Demo

**Story**: "Show how Prophet ML model predicts demand patterns based on historical data."

**Steps**:
1. Check model status:
   ```bash
   curl http://localhost:8000/model/status
   ```

2. Get forecast for a product:
   ```bash
   curl "http://localhost:8000/forecast/chicken-whole?days=14"
   ```

3. Get all forecasts:
   ```bash
   curl http://localhost:8000/forecast
   ```

**Key Points to Highlight**:
- Prophet ML model trained on historical sales data
- Malaysian holiday effects (CNY, Hari Raya, Deepavali)
- Weekend demand patterns
- Payday cycle effects
- Confidence intervals for predictions

---

### 💰 Scenario 4: Payday Demand Boost

**Story**: "It's payday period (25th-5th). The system predicts 30% higher demand."

**Steps**:
1. Set scenario:
   ```bash
   curl -X POST http://localhost:8000/demo/scenario \
     -H "Content-Type: application/json" \
     -d '{"scenario": "payday"}'
   ```

2. View upcoming paydays:
   ```bash
   curl http://localhost:8000/paydays
   ```

3. Check inventory insight for reordering:
   ```bash
   curl "http://localhost:8000/inventory/insight/chicken-whole?quantity=50"
   ```

**Key Points to Highlight**:
- Malaysian payday patterns (25th-31st, 1st-5th)
- AI-adjusted demand forecasts
- Smart reorder recommendations

---

### 🌱 Scenario 5: ESG Compliance Dashboard

**Story**: "Show the sustainability metrics for 2026 ESG reporting compliance."

**Steps**:
1. Get ESG metrics:
   ```bash
   curl http://localhost:8000/esg
   ```

2. Get dashboard summary:
   ```bash
   curl http://localhost:8000/dashboard
   ```

**Key Points to Highlight**:
- Waste saved (kg)
- Methane offset (kg CO₂e) - IPCC standards
- Compliance score
- Monthly trends
- Cost savings from waste prevention

---

## Frontend Demo Flow

1. **Dashboard** (`/dashboard`)
   - Overview of inventory status
   - ESG metrics summary
   - Alert counts

2. **Forecasts** (`/dashboard/forecasts`)
   - AI demand predictions
   - Trend visualization
   - Festival impact indicators

3. **Alerts** (`/dashboard/alerts`)
   - Preparation alerts (demand spikes)
   - Sustainability alerts (expiry risks)
   - Action buttons

4. **ESG** (`/dashboard/esg`)
   - Methane offset tracking
   - Compliance score
   - Monthly waste reduction trends

5. **Inventory** (`/dashboard/inventory`)
   - Stock levels
   - Add stock with AI recommendations
   - Supplier information

---

## Demo Tips

1. **Start with the problem**: "Malaysian SME grocers face 20-30% food waste..."

2. **Show the solution**: Use demo scenarios to demonstrate each feature

3. **Highlight AI**: Emphasize Prophet ML forecasting vs simple rules

4. **ESG compliance**: 2026 regulations make this mandatory

5. **Reset between demos**: 
   ```bash
   curl -X POST http://localhost:8000/demo/reset
   ```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check `venv` is activated, run `pip install -r requirements.txt` |
| Prophet not working | Fallback forecasting activates automatically |
| Frontend 404 | Ensure backend is running on port 8000 |
| Data looks stale | Run `POST /demo/reset` to regenerate |
