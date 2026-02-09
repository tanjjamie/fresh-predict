'use client';

import { useEffect, useState } from 'react';
import type { PreparationAlert } from '@/lib/api';
import { AlertIcon, WarningIcon, InfoIcon, BrainIcon, LeafIcon } from './Icons';

interface PreparationAlertsProps {
  alerts?: PreparationAlert[];
  maxItems?: number;
}

const severityConfig = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-500',
    text: 'text-red-700',
    iconColor: 'text-red-500',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-500',
    text: 'text-amber-700',
    iconColor: 'text-amber-500',
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-500',
    text: 'text-blue-700',
    iconColor: 'text-blue-500',
  },
};

const alertTypeLabels = {
  demand_spike: 'Demand Spike',
  stock_out_risk: 'Stock-Out Risk',
  festive_surge: 'Festive Surge',
};

export default function PreparationAlerts({ alerts: propAlerts, maxItems = 5 }: PreparationAlertsProps) {
  const [alerts, setAlerts] = useState<PreparationAlert[]>(propAlerts || []);
  const [loading, setLoading] = useState(!propAlerts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propAlerts) {
      setAlerts(propAlerts);
      return;
    }

    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:8000/alerts/preparation');
        if (!response.ok) throw new Error('Failed to fetch alerts');
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [propAlerts]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-slate-200 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-3xl border border-red-200">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  const displayAlerts = alerts.slice(0, maxItems);

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-500 rounded-lg text-white text-xs font-bold">AI</span>
          <h3 className="text-slate-900 font-bold tracking-tight">Preparation Alerts</h3>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          14-day forecast
        </span>
      </div>

      {displayAlerts.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <LeafIcon className="w-10 h-10 mx-auto text-emerald-400" />
          <p className="mt-2 font-medium">No preparation alerts</p>
          <p className="text-sm">Your inventory is well-stocked</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const IconComponent = alert.severity === 'high' ? AlertIcon : alert.severity === 'medium' ? WarningIcon : InfoIcon;
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl ${config.bg} border ${config.border} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${config.badge}`}>
                      {alertTypeLabels[alert.alert_type]}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {alert.days_until_event} days
                  </span>
                </div>

                <h4 className={`font-semibold ${config.text} text-sm mb-1`}>
                  {alert.product_name}
                </h4>
                <p className="text-xs text-slate-600 mb-2">{alert.message}</p>

                {alert.predicted_demand_increase > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-500">Demand increase:</span>
                    <span className={`text-xs font-bold ${config.text}`}>
                      +{alert.predicted_demand_increase.toFixed(0)}%
                    </span>
                  </div>
                )}

                <div className="mt-3 p-2 bg-white/50 rounded-lg">
                  <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <BrainIcon className="w-3 h-3" /> {alert.recommended_action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {alerts.length > maxItems && (
        <button className="w-full mt-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">
          View all {alerts.length} alerts →
        </button>
      )}
    </div>
  );
}
