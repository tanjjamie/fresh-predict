'use client';

import { useEffect, useState } from 'react';
import type { DashboardSummary } from '@/lib/api';
import { BoxIcon, WarningIcon, AlertCircleIcon, CurrencyIcon } from './Icons';

interface DashboardStatsProps {
  summary?: DashboardSummary;
}

export default function DashboardStats({ summary: propSummary }: DashboardStatsProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(propSummary || null);
  const [loading, setLoading] = useState(!propSummary);

  useEffect(() => {
    if (propSummary) {
      setSummary(propSummary);
      return;
    }

    const fetchSummary = async () => {
      try {
        const response = await fetch('http://localhost:8000/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard summary');
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [propSummary]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const stats = [
    {
      label: 'Total Products',
      value: summary.total_products,
      icon: BoxIcon,
      color: 'from-slate-500 to-slate-600',
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600',
      change: null,
    },
    {
      label: 'Low Stock Items',
      value: summary.low_stock_count,
      icon: WarningIcon,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      change: summary.low_stock_count > 0 ? 'Needs attention' : 'All good',
    },
    {
      label: 'Expiry Risk',
      value: summary.expiry_risk_count,
      icon: AlertCircleIcon,
      color: 'from-rose-500 to-red-500',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
      change: summary.expiry_risk_count > 0 ? 'Action required' : 'All clear',
    },
    {
      label: 'Inventory Value',
      value: `RM ${summary.total_inventory_value_rm.toLocaleString()}`,
      icon: CurrencyIcon,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 ${stat.bgColor} rounded-2xl border border-slate-100 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            {stat.change && (
              <span className={`text-xs font-medium ${stat.change.includes('good') || stat.change.includes('clear') ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stat.change}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
