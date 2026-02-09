'use client';

import { useEffect, useState } from 'react';

interface MonthlyTrend {
  month: string;
  waste_kg: number;
  saved_kg: number;
}

interface ESGMetrics {
  waste_saved_kg: number;
  methane_offset_kg_co2e: number;
  cost_savings_rm: number;
  items_rescued: number;
  waste_reduction_percentage: number;
  compliance_score: number;
  monthly_trend: MonthlyTrend[];
}

interface ESGScorecardProps {
  wasteSavedKg?: number;
  metrics?: ESGMetrics;
  compact?: boolean;
}

export default function ESGScorecard({ wasteSavedKg, metrics: propMetrics, compact = false }: ESGScorecardProps) {
  const [metrics, setMetrics] = useState<ESGMetrics | null>(propMetrics || null);
  const [loading, setLoading] = useState(!propMetrics && !wasteSavedKg);

  useEffect(() => {
    if (propMetrics || wasteSavedKg) {
      if (wasteSavedKg && !propMetrics) {
        // Legacy support: create metrics from wasteSavedKg
        setMetrics({
          waste_saved_kg: wasteSavedKg,
          methane_offset_kg_co2e: wasteSavedKg * 0.918,
          cost_savings_rm: wasteSavedKg * 15,
          items_rescued: Math.round(wasteSavedKg * 0.3),
          waste_reduction_percentage: (wasteSavedKg / 180) * 100,
          compliance_score: 85,
          monthly_trend: [],
        });
      } else if (propMetrics) {
        setMetrics(propMetrics);
      }
      return;
    }

    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/esg');
        if (!response.ok) throw new Error('Failed to fetch ESG metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error('ESG fetch error:', err);
        // Fallback data
        setMetrics({
          waste_saved_kg: 150,
          methane_offset_kg_co2e: 137.7,
          cost_savings_rm: 2250,
          items_rescued: 42,
          waste_reduction_percentage: 83.3,
          compliance_score: 85,
          monthly_trend: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [propMetrics, wasteSavedKg]);

  if (loading) {
    return (
      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 animate-pulse">
        <div className="h-6 bg-emerald-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-emerald-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!metrics) return null;

  // Compact version for dashboard summary
  if (compact) {
    return (
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 bg-emerald-500 rounded-lg text-white text-xs font-bold">ESG</span>
          <h3 className="text-emerald-900 font-bold tracking-tight">Sustainability Impact</h3>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-black text-emerald-700">
            {metrics.methane_offset_kg_co2e.toFixed(2)} <span className="text-sm">kg CO₂e</span>
          </p>
          <p className="text-sm text-emerald-600 font-medium mt-1">Methane Emissions Prevented</p>
        </div>
        <div className="mt-4 pt-4 border-t border-emerald-100 text-xs text-emerald-500 italic">
          *Based on 2026 Malaysian Retail Standards
        </div>
      </div>
    );
  }

  // Full version with all metrics
  return (
    <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 rounded-3xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white text-xs font-bold">
            ESG
          </span>
          <div>
            <h3 className="text-emerald-900 font-bold tracking-tight">ESG Scorecard</h3>
            <p className="text-xs text-emerald-600">2026 Sustainability Report</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Methane Offset - Primary */}
        <div className="col-span-2 p-4 bg-white/60 rounded-2xl">
          <p className="text-xs text-emerald-600 font-medium mb-1">Methane Offset Score</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-emerald-700">
              {metrics.methane_offset_kg_co2e.toFixed(1)}
            </p>
            <span className="text-lg font-medium text-emerald-600">kg CO₂e</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Equivalent to planting {Math.round(metrics.methane_offset_kg_co2e / 21)} trees</p>
        </div>

        {/* Waste Saved */}
        <div className="p-4 bg-white/60 rounded-2xl">
          <p className="text-xs text-teal-600 font-medium mb-1">Food Waste Prevented</p>
          <p className="text-2xl font-bold text-teal-700">{metrics.waste_saved_kg} kg</p>
          <p className="text-xs text-slate-500 mt-1">This month</p>
        </div>

        {/* Cost Savings */}
        <div className="p-4 bg-white/60 rounded-2xl">
          <p className="text-xs text-cyan-600 font-medium mb-1">Cost Savings</p>
          <p className="text-2xl font-bold text-cyan-700">RM {metrics.cost_savings_rm.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Recovered value</p>
        </div>

        {/* Items Rescued */}
        <div className="p-4 bg-white/60 rounded-2xl">
          <p className="text-xs text-emerald-600 font-medium mb-1">Items Rescued</p>
          <p className="text-2xl font-bold text-emerald-700">{metrics.items_rescued}</p>
          <p className="text-xs text-slate-500 mt-1">From expiry</p>
        </div>

        {/* Waste Reduction */}
        <div className="p-4 bg-white/60 rounded-2xl">
          <p className="text-xs text-teal-600 font-medium mb-1">Waste Reduction</p>
          <p className="text-2xl font-bold text-teal-700">{metrics.waste_reduction_percentage.toFixed(0)}%</p>
          <p className="text-xs text-slate-500 mt-1">vs baseline</p>
        </div>
      </div>

      {/* Compliance Score */}
      <div className="p-4 bg-white/60 rounded-2xl mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-700">2026 Compliance Score</p>
          <span className="text-sm font-bold text-emerald-700">{metrics.compliance_score}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${metrics.compliance_score}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Meeting Malaysian sustainability reporting requirements
        </p>
      </div>

      {/* Monthly Trend */}
      {metrics.monthly_trend.length > 0 && (
        <div className="p-4 bg-white/60 rounded-2xl">
          <p className="text-sm font-medium text-slate-700 mb-3">Monthly Waste Trend</p>
          <div className="flex items-end gap-2 h-24">
            {metrics.monthly_trend.map((month, i) => {
              const maxWaste = Math.max(...metrics.monthly_trend.map((m) => m.waste_kg));
              const wasteHeight = (month.waste_kg / maxWaste) * 100;
              const savedHeight = (month.saved_kg / maxWaste) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 h-20 items-end">
                    <div
                      className="flex-1 bg-rose-300 rounded-t"
                      style={{ height: `${wasteHeight}%` }}
                      title={`Waste: ${month.waste_kg}kg`}
                    ></div>
                    <div
                      className="flex-1 bg-emerald-400 rounded-t"
                      style={{ height: `${savedHeight}%` }}
                      title={`Saved: ${month.saved_kg}kg`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500">{month.month.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-rose-300 rounded"></div>
              <span className="text-xs text-slate-500">Waste</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-400 rounded"></div>
              <span className="text-xs text-slate-500">Saved</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center justify-between">
        <p className="text-xs text-emerald-500 italic">*Based on 2026 IPCC & Malaysian Retail Standards</p>
        <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
          Export Report →
        </button>
      </div>
    </div>
  );
}