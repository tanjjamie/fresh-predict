"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Key for localStorage to track if user has dismissed onboarding
const ONBOARDING_DISMISSED_KEY = "freshpredict_onboarding_dismissed";

interface DashboardData {
  total_products: number;
  low_stock_count: number;
  expiry_risk_count: number;
  preparation_alerts_count: number;
  sustainability_alerts_count: number;
  total_inventory_value_rm: number;
  esg_metrics: {
    waste_saved_kg: number;
    methane_offset_kg_co2e: number;
    cost_savings_rm: number;
    compliance_score: number;
    waste_reduction_percentage: number;
  };
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  expiry_date: string;
  cost_per_unit: number;
}

interface ForecastResult {
  product_id: string;
  product_name: string;
  dates: string[];
  predicted_demand: number[];
  trend: string;
  festive_impact: string | null;
}

interface DemoStatus {
  enabled: boolean;
  simulated_date: string | null;
  actual_date: string;
}

interface Festival {
  name: string;
  days_until: number;
  demand_multiplier: number;
  affected_categories: string[];
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null);
  const [upcomingFestival, setUpcomingFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Check if user has dismissed onboarding before
    const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
    setShowOnboarding(!dismissed);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, invRes, forecastRes, demoRes, festivalRes] = await Promise.all([
        fetch(`${API_URL}/dashboard`),
        fetch(`${API_URL}/inventory`),
        fetch(`${API_URL}/forecast`),
        fetch(`${API_URL}/demo/status`),
        fetch(`${API_URL}/festivals`)
      ]);

      if (dashRes.ok) setDashboard(await dashRes.json());
      if (invRes.ok) setInventory(await invRes.json());
      if (forecastRes.ok) setForecasts(await forecastRes.json());
      if (demoRes.ok) setDemoStatus(await demoRes.json());
      if (festivalRes.ok) {
        const festivals = await festivalRes.json();
        if (festivals.length > 0 && festivals[0].days_until <= 14) {
          setUpcomingFestival(festivals[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = demoStatus?.simulated_date 
      ? new Date(demoStatus.simulated_date) 
      : new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const expiringItems = inventory
    .map(item => ({
      ...item,
      daysUntilExpiry: getDaysUntilExpiry(item.expiry_date)
    }))
    .filter(item => item.daysUntilExpiry <= 5)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    .slice(0, 4);

  // Prepare forecast chart data
  const chartData = forecasts.length > 0 
    ? forecasts[0].dates.slice(0, 7).map((date, i) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        predicted: Math.round(forecasts.reduce((sum, f) => sum + (f.predicted_demand[i] || 0), 0))
      }))
    : [];

  const maxChartValue = Math.max(...chartData.map(d => d.predicted), 100) * 1.2;

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const stats = [
    { 
      label: "Total Products", 
      value: dashboard?.total_products?.toString() || "0", 
      change: `${inventory.length} in inventory`, 
      changeType: "positive",
      tooltip: "Number of unique product types you're tracking" 
    },
    { 
      label: "Low Stock", 
      value: dashboard?.low_stock_count?.toString() || "0", 
      change: dashboard?.low_stock_count && dashboard.low_stock_count > 0 ? "needs reorder" : "all stocked", 
      changeType: dashboard?.low_stock_count && dashboard.low_stock_count > 0 ? "warning" : "positive",
      tooltip: "Items running low - consider reordering soon" 
    },
    { 
      label: "Expiring Soon", 
      value: dashboard?.expiry_risk_count?.toString() || "0", 
      change: expiringItems.filter(i => i.daysUntilExpiry <= 2).length > 0 
        ? `${expiringItems.filter(i => i.daysUntilExpiry <= 2).length} urgent` 
        : "none urgent", 
      changeType: dashboard?.expiry_risk_count && dashboard.expiry_risk_count > 0 ? "negative" : "positive",
      tooltip: "Items expiring within 5 days - apply discounts to sell quickly" 
    },
    { 
      label: "Inventory Value", 
      value: `RM ${dashboard?.total_inventory_value_rm?.toLocaleString() || "0"}`, 
      change: `${dashboard?.sustainability_alerts_count || 0} sustainability alerts`, 
      changeType: "positive",
      tooltip: "Total value of your current stock" 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {demoStatus?.enabled 
              ? `Demo Mode: Simulating ${demoStatus.simulated_date}` 
              : "Real-time inventory insights for your store"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {demoStatus?.enabled && (
            <span className="bg-purple-500/10 text-purple-500 text-xs font-semibold px-3 py-1.5 rounded-full">
              Demo Mode
            </span>
          )}
          {!showOnboarding && (
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm"
              title="Show getting started guide"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Help</span>
            </button>
          )}
          <button 
            onClick={fetchAllData}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Onboarding / Getting Started Guide */}
      {showOnboarding && (
        <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6 relative">
          <button 
            onClick={dismissOnboarding}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss guide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Welcome to FreshPredict!</h2>
              <p className="text-sm text-muted-foreground">Your AI-powered assistant for reducing food waste</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-background/60 rounded-lg p-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">Check Expiring Items</h3>
              <p className="text-xs text-muted-foreground">See which products need discounts or quick sales to avoid waste</p>
            </div>

            <div className="bg-background/60 rounded-lg p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">View AI Forecasts</h3>
              <p className="text-xs text-muted-foreground">Know what customers will buy next week so you can order right</p>
            </div>

            <div className="bg-background/60 rounded-lg p-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">Act on Alerts</h3>
              <p className="text-xs text-muted-foreground">Get notified about festivals, low stock, and urgent actions</p>
            </div>

            <div className="bg-background/60 rounded-lg p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">Track Your Impact</h3>
              <p className="text-xs text-muted-foreground">See how much waste you&apos;ve prevented and money you&apos;ve saved</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Check the notification bell daily for urgent items that need action!
            </p>
            <button 
              onClick={dismissOnboarding}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors whitespace-nowrap"
            >
              Got it, don&apos;t show again
            </button>
          </div>
        </div>
      )}

      {/* Alert Banner - Dynamic based on upcoming festival */}
      {upcomingFestival && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{upcomingFestival.name} Preparation Alert</p>
              <p className="text-sm text-muted-foreground">
                Expected +{((upcomingFestival.demand_multiplier - 1) * 100).toFixed(0)}% demand increase in {upcomingFestival.days_until} days. 
                Stock up on {upcomingFestival.affected_categories.join(", ")}.
              </p>
            </div>
            <Link 
              href="/dashboard/alerts"
              className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors whitespace-nowrap"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow group relative"
            title={stat.tooltip}
          >
            <div className="flex items-start justify-between">
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
              <svg className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</p>
            <div className={`flex items-center gap-1.5 mt-2 text-sm ${
              stat.changeType === "positive" ? "text-emerald-500" :
              stat.changeType === "warning" ? "text-amber-500" :
              stat.changeType === "negative" ? "text-red-500" : "text-muted-foreground"
            }`}>
              {stat.changeType === "positive" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {stat.changeType === "negative" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                </svg>
              )}
              {stat.changeType === "warning" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring Items */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold">Expiring Items</h2>
                <p className="text-xs text-muted-foreground">Items needing attention</p>
              </div>
            </div>
            <span className="bg-red-500/10 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              {expiringItems.length} items
            </span>
          </div>
          <div className="divide-y divide-border">
            {expiringItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No items expiring soon!</p>
              </div>
            ) : (
              expiringItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      item.daysUntilExpiry <= 1 ? "bg-red-500" :
                      item.daysUntilExpiry <= 3 ? "bg-amber-500" : "bg-muted-foreground"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category} - {item.current_stock} {item.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-sm font-medium ${
                      item.daysUntilExpiry <= 1 ? "text-red-500" :
                      item.daysUntilExpiry <= 3 ? "text-amber-500" : "text-muted-foreground"
                    }`}>
                      {item.daysUntilExpiry}d
                    </span>
                    <Link 
                      href="/dashboard/alerts"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        item.daysUntilExpiry <= 2 
                          ? "bg-red-500 text-white hover:bg-red-600" 
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {item.daysUntilExpiry <= 2 ? "Action" : "View"}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-border">
            <Link href="/dashboard/alerts" className="text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
              View all expiring items
            </Link>
          </div>
        </div>

        {/* Demand Forecast */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold">Demand Forecast</h2>
                <p className="text-xs text-muted-foreground">AI-powered predictions (14 days)</p>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              Prophet ML
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-6 mb-4">
              <span className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-muted-foreground">Predicted Demand</span>
              </span>
              {forecasts.some(f => f.festive_impact) && (
                <span className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-muted-foreground">Festival Impact</span>
                </span>
              )}
            </div>
            {/* Chart */}
            <div className="h-52 flex items-end gap-2">
              {chartData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div 
                      className="w-6 bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                      style={{ height: `${(data.predicted / maxChartValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
            {forecasts.some(f => f.festive_impact) && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-500 font-medium">
                  {forecasts.find(f => f.festive_impact)?.festive_impact}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ESG Score */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-semibold">ESG Score</h2>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              {dashboard?.esg_metrics?.compliance_score && dashboard.esg_metrics.compliance_score >= 90 ? "Excellent" : "On Track"}
            </span>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className="stroke-secondary"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className="stroke-emerald-500"
                  strokeWidth="3"
                  strokeDasharray={`${dashboard?.esg_metrics?.compliance_score || 0}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{dashboard?.esg_metrics?.compliance_score?.toFixed(0) || 0}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Waste Saved</span>
              <span className="text-sm text-emerald-500 font-semibold">{dashboard?.esg_metrics?.waste_saved_kg?.toFixed(1) || 0} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CO₂e Offset</span>
              <span className="text-sm text-emerald-500 font-semibold">{dashboard?.esg_metrics?.methane_offset_kg_co2e?.toFixed(1) || 0} kg</span>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-semibold">Cost Savings</h2>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              From waste prevention
            </span>
          </div>
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-emerald-500">RM {dashboard?.esg_metrics?.cost_savings_rm?.toLocaleString() || 0}</p>
            <p className="text-muted-foreground text-sm mt-2">Total saved this period</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Waste Reduction</span>
              <span className="text-sm font-semibold">-{dashboard?.esg_metrics?.waste_reduction_percentage?.toFixed(0) || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Alert Actions</span>
              <span className="text-sm font-semibold">{dashboard?.preparation_alerts_count || 0} pending</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            {dashboard?.expiry_risk_count && dashboard.expiry_risk_count > 0 && (
              <Link href="/dashboard/alerts" className="block w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left hover:bg-amber-500/15 transition-colors group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Apply Discount</p>
                    <p className="text-xs text-muted-foreground mt-1">{dashboard.expiry_risk_count} items expiring soon</p>
                  </div>
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
            {dashboard?.low_stock_count && dashboard.low_stock_count > 0 && (
              <Link href="/dashboard/inventory" className="block w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left hover:bg-blue-500/15 transition-colors group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Reorder Stock</p>
                    <p className="text-xs text-muted-foreground mt-1">{dashboard.low_stock_count} items below threshold</p>
                  </div>
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
            <Link href="/dashboard/forecasts" className="block w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left hover:bg-emerald-500/15 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">View Forecasts</p>
                  <p className="text-xs text-muted-foreground mt-1">AI demand predictions</p>
                </div>
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
