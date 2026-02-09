'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ForecastChart from '@/components/ForecastChart';
import FestivalBanner from '@/components/FestivalBanner';
import { CelebrationIcon, CurrencyIcon, CalendarIcon, BrainIcon, ChartIcon, CpuIcon, TrendingUpIcon, BellIcon } from '@/components/Icons';

export default function ForecastsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [forecastDays, setForecastDays] = useState(14);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForecastDays(parseInt(e.target.value));
    setRefreshKey(prev => prev + 1); // Also refresh when changing days
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">AI Demand Forecasting</h1>
            <p className="text-slate-500 text-sm">
              Prophet AI-powered predictions with Malaysian market intelligence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={forecastDays}
              onChange={handleDaysChange}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
            >
              <option value="7">7-day forecast</option>
              <option value="14">14-day forecast</option>
              <option value="30">30-day forecast</option>
            </select>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-indigo-500 rounded-xl text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
            >
              Refresh Forecast
            </button>
          </div>
        </div>
      </div>

      {/* Festival Impact */}
      <div className="mb-6">
        <FestivalBanner />
      </div>

      {/* Forecast Model Info */}
      <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
        <div className="flex items-start gap-3">
          <span className="p-2 bg-indigo-500 rounded-lg text-white text-xs font-bold">AI</span>
          <div>
            <h3 className="font-semibold text-indigo-800">Prophet Forecasting Engine</h3>
            <p className="text-sm text-indigo-700 mt-1">
              This system uses Facebook Prophet AI models to achieve a 30-50% reduction in Mean Absolute Error (MAE) 
              compared to manual forecasting. The model incorporates Malaysian festive seasons, payday cycles, 
              and seasonal patterns specific to the local retail environment.
            </p>
          </div>
        </div>
      </div>

      {/* Main Forecast */}
      <div className="mb-6">
        <ForecastChart key={refreshKey} days={forecastDays} />
      </div>

      {/* Forecast Factors */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <CelebrationIcon className="w-6 h-6 text-purple-500" />
            <h3 className="font-semibold text-slate-800">Festive Impact</h3>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            Malaysian festive calendar integrated with demand multipliers:
          </p>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• CNY: 2.5x demand surge</li>
            <li>• Hari Raya: 3.0x demand surge</li>
            <li>• Deepavali: 2.0x demand surge</li>
          </ul>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <CurrencyIcon className="w-6 h-6 text-emerald-500" />
            <h3 className="font-semibold text-slate-800">Payday Effect</h3>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            Captures the Malaysian &quot;pay-day&quot; spending rhythm:
          </p>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• 25th - End of month: Peak period</li>
            <li>• 1st - 5th: Continued elevated demand</li>
            <li>• 30% average increase during cycle</li>
          </ul>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold text-slate-800">Weekly Patterns</h3>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            Automated weekly seasonality detection:
          </p>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• Weekend boost: 20% higher demand</li>
            <li>• Mid-week dip: Tuesday-Wednesday</li>
            <li>• Friday surge: Weekend preparation</li>
          </ul>
        </div>
      </div>

      {/* How It Works */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BrainIcon className="w-5 h-5 text-indigo-500" /> How Prophet Works</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ChartIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="font-medium text-slate-800 text-sm">Data Collection</h4>
            <p className="text-xs text-slate-500 mt-1">Historical sales, seasonality, and market signals</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CpuIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="font-medium text-slate-800 text-sm">AI Processing</h4>
            <p className="text-xs text-slate-500 mt-1">Bayesian model learns patterns and seasonality</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUpIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="font-medium text-slate-800 text-sm">Forecast Generation</h4>
            <p className="text-xs text-slate-500 mt-1">14-day predictions with confidence intervals</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BellIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="font-medium text-slate-800 text-sm">Alert Triggering</h4>
            <p className="text-xs text-slate-500 mt-1">Automated preparation alerts for action</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
