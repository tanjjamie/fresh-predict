'use client';

import { useEffect, useState } from 'react';
import type { SustainabilityAlert } from '@/lib/api';
import { AlertCircleIcon, RecycleIcon, BrainIcon, LeafIcon, BoxIcon, CurrencyIcon } from './Icons';

interface SustainabilityAlertsProps {
  alerts?: SustainabilityAlert[];
  maxItems?: number;
  onAlertSold?: () => void;  // Callback to refresh ESG metrics
}

const severityConfig = {
  high: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-500',
    text: 'text-rose-700',
    iconColor: 'text-rose-500',
  },
  medium: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-500',
    text: 'text-orange-700',
    iconColor: 'text-orange-500',
  },
  low: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-500',
    text: 'text-emerald-700',
    iconColor: 'text-emerald-500',
  },
};

const alertTypeLabels = {
  expiry_risk: 'Expiry Risk',
  overstock: 'Overstock',
  slow_moving: 'Slow Moving',
};

export default function SustainabilityAlerts({ alerts: propAlerts, maxItems = 5, onAlertSold }: SustainabilityAlertsProps) {
  const [alerts, setAlerts] = useState<SustainabilityAlert[]>(propAlerts || []);
  const [loading, setLoading] = useState(!propAlerts);
  const [error, setError] = useState<string | null>(null);
  const [soldAlerts, setSoldAlerts] = useState<Set<string>>(new Set());
  const [markingId, setMarkingId] = useState<string | null>(null);

  const handleMarkAsSold = async (alert: SustainabilityAlert) => {
    setMarkingId(alert.id);
    try {
      const response = await fetch('http://localhost:8000/alerts/mark-sold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alert.id,
          product_id: alert.product_id,
          quantity_kg: alert.potential_waste_kg,
          cost_rm: alert.potential_loss_rm
        })
      });
      
      if (response.ok) {
        setSoldAlerts(prev => new Set([...prev, alert.id]));
        onAlertSold?.();  // Trigger ESG refresh
      }
    } catch (err) {
      console.error('Failed to mark as sold:', err);
    } finally {
      setMarkingId(null);
    }
  };

  useEffect(() => {
    if (propAlerts) {
      setAlerts(propAlerts);
      return;
    }

    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:8000/alerts/sustainability');
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
  const totalPotentialWaste = alerts.reduce((sum, a) => sum + a.potential_waste_kg, 0);
  const totalPotentialLoss = alerts.reduce((sum, a) => sum + a.potential_loss_rm, 0);

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-500 rounded-lg text-white"><RecycleIcon className="w-4 h-4" /></span>
          <h3 className="text-slate-900 font-bold tracking-tight">Sustainability Alerts</h3>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          Expiry monitoring
        </span>
      </div>

      {/* Summary stats */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-rose-50 rounded-xl">
            <p className="text-xs text-rose-600 font-medium">At Risk</p>
            <p className="text-lg font-bold text-rose-700">{totalPotentialWaste.toFixed(1)} kg</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <p className="text-xs text-amber-600 font-medium">Potential Loss</p>
            <p className="text-lg font-bold text-amber-700">RM {totalPotentialLoss.toFixed(0)}</p>
          </div>
        </div>
      )}

      {displayAlerts.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <LeafIcon className="w-10 h-10 mx-auto text-emerald-400" />
          <p className="mt-2 font-medium">No sustainability alerts</p>
          <p className="text-sm">All products have healthy shelf life</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const isSold = soldAlerts.has(alert.id);
            const isMarking = markingId === alert.id;
            
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl ${isSold ? 'bg-emerald-50 border-emerald-200' : config.bg} border ${isSold ? 'border-emerald-200' : config.border} transition-all hover:shadow-md ${isSold ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircleIcon className={`w-4 h-4 ${isSold ? 'text-emerald-500' : config.iconColor}`} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${isSold ? 'bg-emerald-500' : config.badge}`}>
                      {isSold ? 'Sold' : alertTypeLabels[alert.alert_type]}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${isSold ? 'text-emerald-600' : alert.days_until_expiry <= 2 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {isSold ? 'Waste Prevented!' : alert.days_until_expiry <= 0 ? 'EXPIRED' : `${alert.days_until_expiry} days left`}
                  </span>
                </div>

                <h4 className={`font-semibold ${isSold ? 'text-emerald-700' : config.text} text-sm mb-1`}>
                  {alert.product_name}
                </h4>
                <p className="text-xs text-slate-600 mb-2">{isSold ? 'Item sold - ESG metrics updated' : alert.message}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1"><BoxIcon className="w-3 h-3" /> {alert.potential_waste_kg} kg {isSold ? 'saved' : 'at risk'}</span>
                  <span className="flex items-center gap-1"><CurrencyIcon className="w-3 h-3" /> RM {alert.potential_loss_rm.toFixed(0)} {isSold ? 'recovered' : 'loss'}</span>
                </div>

                {!isSold && (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex-1 p-2 bg-white/50 rounded-lg">
                      <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
                        <BrainIcon className="w-3 h-3" /> {alert.recommended_action}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMarkAsSold(alert)}
                      disabled={isMarking}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      {isMarking ? 'Saving...' : 'Mark as Sold'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {alerts.length > maxItems && (
        <button className="w-full mt-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          View all {alerts.length} alerts →
        </button>
      )}
    </div>
  );
}
