'use client';

import { useEffect, useState } from 'react';
import type { ForecastResult } from '@/lib/api';
import { TrendingUpIcon, CelebrationIcon } from './Icons';

// Inline trend icons
const TrendDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);
const ArrowRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

interface ForecastChartProps {
  productId?: string;
  forecast?: ForecastResult;
  days?: number;
}

export default function ForecastChart({ productId, forecast: propForecast, days = 14 }: ForecastChartProps) {
  const [forecast, setForecast] = useState<ForecastResult | null>(propForecast || null);
  const [loading, setLoading] = useState(!propForecast);
  const [selectedForecast, setSelectedForecast] = useState<string>(productId || '');
  const [allForecasts, setAllForecasts] = useState<ForecastResult[]>([]);

  useEffect(() => {
    if (propForecast) {
      setForecast(propForecast);
      return;
    }

    const fetchForecasts = async () => {
      try {
        const response = await fetch(`http://localhost:8000/forecast?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch forecasts');
        const data: ForecastResult[] = await response.json();
        setAllForecasts(data);
        if (data.length > 0) {
          const selected = productId ? data.find(f => f.product_id === productId) : data[0];
          if (selected) {
            setForecast(selected);
            setSelectedForecast(selected.product_id);
          }
        }
      } catch (err) {
        console.error('Forecast fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, [propForecast, productId, days]);

  const handleForecastChange = (productId: string) => {
    const selected = allForecasts.find(f => f.product_id === productId);
    if (selected) {
      setForecast(selected);
      setSelectedForecast(productId);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-slate-200 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">No forecast data available</p>
      </div>
    );
  }

  const maxDemand = Math.max(...forecast.confidence_upper);
  const trendColors = {
    increasing: { bg: 'bg-emerald-100', text: 'text-emerald-700', Icon: TrendingUpIcon },
    decreasing: { bg: 'bg-rose-100', text: 'text-rose-700', Icon: TrendDownIcon },
    stable: { bg: 'bg-blue-100', text: 'text-blue-700', Icon: ArrowRightIcon },
  };
  const trendConfig = trendColors[forecast.trend];

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-500 rounded-lg text-white text-xs font-bold">AI</span>
          <h3 className="text-slate-900 font-bold tracking-tight">Demand Forecast</h3>
        </div>
        
        {allForecasts.length > 1 && (
          <select
            value={selectedForecast}
            onChange={(e) => handleForecastChange(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {allForecasts.map(f => (
              <option key={f.product_id} value={f.product_id}>
                {f.product_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Product Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-slate-800">{forecast.product_name}</h4>
          <p className="text-xs text-slate-500">{days}-day Prophet AI forecast</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${trendConfig.bg} ${trendConfig.text}`}>
            <trendConfig.Icon className="w-3 h-3" /> {forecast.trend}
          </span>
          {forecast.festive_impact && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
              <CelebrationIcon className="w-3 h-3" /> {forecast.festive_impact}
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48 mb-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-slate-400">
          <span>{maxDemand.toFixed(0)}</span>
          <span>{(maxDemand / 2).toFixed(0)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full flex items-end gap-1">
          {forecast.dates.map((date, i) => {
            const demand = forecast.predicted_demand[i];
            const lower = forecast.confidence_lower[i];
            const upper = forecast.confidence_upper[i];
            const height = (demand / maxDemand) * 100;
            const lowerHeight = (lower / maxDemand) * 100;
            const upperHeight = (upper / maxDemand) * 100;

            return (
              <div key={date} className="flex-1 flex flex-col items-center group relative">
                {/* Confidence interval */}
                <div
                  className="absolute bottom-0 w-full bg-indigo-100 rounded-t"
                  style={{ height: `${upperHeight}%` }}
                ></div>
                <div
                  className="absolute bottom-0 w-full bg-white rounded-t"
                  style={{ height: `${lowerHeight}%` }}
                ></div>
                
                {/* Predicted demand bar */}
                <div
                  className="relative w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all hover:from-indigo-600 hover:to-indigo-500"
                  style={{ height: `${height}%` }}
                ></div>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs p-2 rounded-lg whitespace-nowrap z-10">
                  <p className="font-semibold">{new Date(date).toLocaleDateString('en-MY', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p>Demand: {demand.toFixed(1)}</p>
                  <p className="text-slate-300">Range: {lower.toFixed(1)} - {upper.toFixed(1)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="ml-10 flex justify-between text-xs text-slate-400">
        {forecast.dates.filter((_, i) => i % 3 === 0 || i === forecast.dates.length - 1).map(date => (
          <span key={date}>
            {new Date(date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-slate-500">Total Predicted</p>
          <p className="text-lg font-bold text-slate-800">
            {forecast.predicted_demand.reduce((a, b) => a + b, 0).toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Daily Average</p>
          <p className="text-lg font-bold text-slate-800">
            {(forecast.predicted_demand.reduce((a, b) => a + b, 0) / forecast.predicted_demand.length).toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Peak Day</p>
          <p className="text-lg font-bold text-slate-800">
            {Math.max(...forecast.predicted_demand).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-indigo-500 rounded"></span>
          Predicted Demand
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-indigo-100 rounded"></span>
          Confidence Interval
        </span>
      </div>
    </div>
  );
}
