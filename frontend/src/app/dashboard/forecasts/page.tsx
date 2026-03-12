"use client";

import { useState, useEffect } from "react";

interface ForecastResult {
  product_id: string;
  product_name: string;
  dates: string[];
  predicted_demand: number[];
  confidence_lower: number[];
  confidence_upper: number[];
  trend: string;
  festive_impact: string | null;
}

interface Festival {
  name: string;
  date: string;
  days_until: number;
  affected_categories: string[];
  demand_multiplier: number;
}

interface PaydayPeriod {
  name: string;
  start_date: string;
  end_date: string;
  days_until: number;
  is_active: boolean;
  demand_multiplier: number;
  affected_categories: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [paydays, setPaydays] = useState<PaydayPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [forecastRes, festivalRes, paydayRes] = await Promise.all([
        fetch(`${API_URL}/forecast`),
        fetch(`${API_URL}/festivals`),
        fetch(`${API_URL}/paydays`),
      ]);
      
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecasts(forecastData);
        if (forecastData.length > 0) {
          setSelectedProduct(forecastData[0].product_id);
        }
      }
      if (festivalRes.ok) {
        const festivalData = await festivalRes.json();
        setFestivals(festivalData);
      }
      if (paydayRes.ok) {
        const paydayData = await paydayRes.json();
        setPaydays(paydayData);
      }
    } catch (error) {
      console.error("Error fetching forecasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedForecast = forecasts.find((f) => f.product_id === selectedProduct);

  const getMaxValue = (forecast: ForecastResult) => {
    const allValues = [...forecast.predicted_demand, ...forecast.confidence_upper];
    return Math.max(...allValues) * 1.1;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") {
      return (
        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    }
    if (trend === "decreasing") {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Demand Forecasts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered demand predictions for your products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Prophet AI Active
          </span>
        </div>
      </div>

      {/* Upcoming Festivals Alert */}
      {festivals.length > 0 && festivals[0].days_until <= 30 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Upcoming: {festivals[0].name}</p>
              <p className="text-sm text-muted-foreground">
                {festivals[0].days_until} days away • Expected {Math.round((festivals[0].demand_multiplier - 1) * 100)}% demand increase for {festivals[0].affected_categories.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payday Period Alert */}
      {paydays.length > 0 && (paydays[0].is_active || paydays[0].days_until <= 7) && (
        <div className={`${paydays[0].is_active ? 'bg-blue-500/10 border-blue-500/20' : 'bg-sky-500/10 border-sky-500/20'} border rounded-xl p-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${paydays[0].is_active ? 'bg-blue-500/20' : 'bg-sky-500/20'} flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-5 h-5 ${paydays[0].is_active ? 'text-blue-500' : 'text-sky-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {paydays[0].is_active ? '💰 Active: ' : 'Upcoming: '}{paydays[0].name}
              </p>
              <p className="text-sm text-muted-foreground">
                {paydays[0].is_active 
                  ? `Ends ${new Date(paydays[0].end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}` 
                  : `Starts in ${paydays[0].days_until} days`} • Expected {Math.round((paydays[0].demand_multiplier - 1) * 100)}% demand increase across all categories
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Products</h2>
            <p className="text-xs text-muted-foreground mt-1">Select a product to view forecast</p>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {forecasts.map((forecast) => (
              <button
                key={forecast.product_id}
                onClick={() => setSelectedProduct(forecast.product_id)}
                className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                  selectedProduct === forecast.product_id ? "bg-secondary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{forecast.product_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {forecast.dates.length} day forecast
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(forecast.trend)}
                    <span className={`text-xs font-medium ${
                      forecast.trend === "increasing" ? "text-emerald-500" :
                      forecast.trend === "decreasing" ? "text-red-500" :
                      "text-muted-foreground"
                    }`}>
                      {forecast.trend}
                    </span>
                  </div>
                </div>
                {forecast.festive_impact && (
                  <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
                    {forecast.festive_impact}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{selectedForecast?.product_name || "Select a product"}</h2>
                <p className="text-xs text-muted-foreground mt-1">14-day demand prediction with confidence interval</p>
              </div>
              {selectedForecast && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedForecast.trend === "increasing" ? "bg-emerald-500/10 text-emerald-500" :
                  selectedForecast.trend === "decreasing" ? "bg-red-500/10 text-red-500" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  Trend: {selectedForecast.trend}
                </span>
              )}
            </div>
          </div>
          
          {selectedForecast ? (
            <div className="p-5">
              {/* Legend */}
              <div className="flex items-center gap-6 mb-6">
                <span className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-muted-foreground">Predicted Demand</span>
                </span>
                <span className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded bg-emerald-500/20" />
                  <span className="text-muted-foreground">Confidence Range</span>
                </span>
              </div>

              {/* Chart */}
              <div className="h-64 flex items-end gap-1.5">
                {selectedForecast.dates.map((date, i) => {
                  const maxValue = getMaxValue(selectedForecast);
                  const predicted = selectedForecast.predicted_demand[i];
                  const lower = selectedForecast.confidence_lower[i];
                  const upper = selectedForecast.confidence_upper[i];
                  
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div className="w-full flex items-end justify-center h-52 relative">
                        {/* Confidence interval */}
                        <div 
                          className="absolute w-full bg-emerald-500/10 rounded"
                          style={{ 
                            bottom: `${(lower / maxValue) * 100}%`,
                            height: `${((upper - lower) / maxValue) * 100}%` 
                          }}
                        />
                        {/* Predicted value bar */}
                        <div 
                          className="w-4 bg-emerald-500 rounded-t transition-all z-10 hover:bg-emerald-400"
                          style={{ height: `${(predicted / maxValue) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-20">
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-xs whitespace-nowrap">
                          <p className="font-medium">{new Date(date).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">Predicted: {predicted.toFixed(1)}</p>
                          <p className="text-muted-foreground">Range: {lower.toFixed(1)} - {upper.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {selectedForecast.predicted_demand.reduce((a, b) => a + b, 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Predicted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {(selectedForecast.predicted_demand.reduce((a, b) => a + b, 0) / selectedForecast.predicted_demand.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Daily Average</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.max(...selectedForecast.predicted_demand).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Peak Demand</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Select a product to view its forecast
            </div>
          )}
        </div>
      </div>

      {/* Festivals Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">Malaysian Festival Calendar</h2>
              <p className="text-xs text-muted-foreground">Upcoming events affecting demand</p>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {festivals.slice(0, 4).map((festival, i) => (
            <div key={i} className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  festival.days_until <= 14 ? "bg-red-500/10 text-red-500" :
                  festival.days_until <= 30 ? "bg-amber-500/10 text-amber-500" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {festival.days_until} days
                </span>
                <span className="text-xs text-emerald-500 font-medium">
                  +{Math.round((festival.demand_multiplier - 1) * 100)}%
                </span>
              </div>
              <p className="font-medium text-sm">{festival.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{festival.date}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {festival.affected_categories.map((cat) => (
                  <span key={cat} className="text-[10px] px-1.5 py-0.5 bg-background rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
