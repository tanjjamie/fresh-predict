# FreshPredict - AI Inventory Decision-Support System

An AI-driven inventory management platform for Malaysian SME grocers, designed to reduce food waste, optimize stock levels, and meet 2026 ESG compliance requirements.

## 🎯 Project Objectives

1. **Forecasting Precision** - 30-50% reduction in MAE using Prophet AI models
2. **Waste Mitigation** - 20% reduction in expired-on-shelf inventory
3. **Regulatory Compliance** - Real-time Methane Offset Score (kg CO₂e) dashboard
4. **User Adoption** - 80% user effectiveness target
5. **System Performance** - 90% uptime with <5s data processing latency

## 🚀 Features

### Dual-Alert Intelligence
- **Preparation Alerts**: AI-driven demand spike identification 14 days in advance
- **Sustainability Alerts**: Anomaly detection for stock at risk of expiry

### ESG Scorecard
- Real-time methane offset calculations (IPCC 2026 standards)
- Compliance tracking for Malaysian 2026 sustainability reporting
- Monthly waste reduction trends

### Malaysian Market Intelligence
- Festive calendar integration (CNY, Hari Raya, Deepavali)
- Payday cycle demand patterns
- Local supplier recommendations

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python API framework
- **Prophet** - Facebook's time-series forecasting library
- **Pydantic** - Data validation and settings management

### Frontend
- **Next.js 16** - React framework with App Router
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## 🌐 Running the Application

1. **Start the Backend** (Terminal 1):
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```
   API will be available at: http://localhost:8000

2. **Start the Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   Dashboard will be available at: http://localhost:3000

## 📊 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /dashboard` | Dashboard summary with all metrics |
| `GET /inventory` | List all inventory items |
| `GET /forecast/{product_id}` | Get AI demand forecast for a product |
| `GET /forecast` | Get forecasts for all products |
| `GET /alerts/preparation` | Get preparation alerts |
| `GET /alerts/sustainability` | Get sustainability alerts |
| `GET /esg` | Get ESG metrics |
| `GET /festivals` | Get upcoming Malaysian festivals |
| `GET /model/status` | Check AI model status |
| `GET /products` | List available products |
| `POST /inventory/add` | Add new stock with AI insight |

## 🏗️ Project Structure

```
fresh-predict/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── inventory/        # Inventory page
│   │   │   ├── forecasts/        # Forecasts page
│   │   │   ├── alerts/           # Alerts page
│   │   │   └── esg/              # ESG Report page
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── ESGScorecard.tsx
│   │   │   ├── FestivalBanner.tsx
│   │   │   ├── ForecastChart.tsx
│   │   │   ├── InventoryTable.tsx
│   │   │   ├── PreparationAlerts.tsx
│   │   │   └── SustainabilityAlerts.tsx
│   │   └── lib/
│   │       └── api.ts            # API service
│   └── package.json
└── README.md
```

## 🇲🇾 Malaysian Context

This project is specifically designed for the Malaysian retail market:

- **Festive Seasons**: CNY, Hari Raya Aidilfitri, Deepavali, Christmas
- **Currency**: Malaysian Ringgit (RM)
- **Regulations**: 2026 Mandatory ESG Reporting compliance
- **Focus Categories**: Poultry, Fresh Produce, Dairy (highest-risk perishables)

## 📈 ESG Compliance

FreshPredict supports compliance with:

- **Circular Economy Blueprint for Solid Waste (2025-2035)**
- **2026 Malaysian Mandatory ESG Reporting**
- **UN SDG 12.3** - 50% reduction in food waste by 2030
- **National Low Carbon Cities Framework**

## 🧮 Methane Offset Calculation

Based on 2026 IPCC standards:
```
Methane Offset (kg CO₂e) = Food Waste Prevented (kg) × 0.918
```

---

Built with ❤️ for Malaysian SME grocers | Supporting SDG 12.3 | 2026 ESG Compliant
