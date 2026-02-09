'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PreparationAlerts from '@/components/PreparationAlerts';
import SustainabilityAlerts from '@/components/SustainabilityAlerts';
import { RecycleIcon, ClipboardIcon } from '@/components/Icons';

export default function AlertsPage() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Alert Center</h1>
            <p className="text-slate-500 text-sm">
              Dual-alert system for business optimization and sustainability
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Mark All Read
            </button>
            <button className="px-4 py-2 bg-emerald-500 rounded-xl text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
              Configure Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Alert Type Explanation */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-amber-500 rounded-lg text-white text-xs font-bold">AI</span>
            <h3 className="font-semibold text-amber-800">Preparation Alerts</h3>
          </div>
          <p className="text-sm text-amber-700">
            AI-driven identification of demand spikes 14 days in advance to prevent stock-outs.
            Considers Malaysian festive calendar and payday cycles.
          </p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-emerald-500 rounded-lg text-white"><RecycleIcon className="w-4 h-4" /></span>
            <h3 className="font-semibold text-emerald-800">Sustainability Alerts</h3>
          </div>
          <p className="text-sm text-emerald-700">
            Anomaly detection that flags stock at risk of expiry, enabling proactive discounting
            to minimize food waste and meet ESG targets.
          </p>
        </div>
      </div>

      {/* All Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PreparationAlerts maxItems={10} />
        <SustainabilityAlerts maxItems={10} />
      </div>

      {/* Alert Response Guide */}
      <div className="mt-6 p-6 bg-white rounded-3xl border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><ClipboardIcon className="w-5 h-5 text-slate-600" /> Alert Response Guide</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-rose-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
              <span className="font-medium text-rose-800">High Severity</span>
            </div>
            <p className="text-xs text-rose-600">
              Immediate action required within 24 hours. Financial or waste impact imminent.
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              <span className="font-medium text-amber-800">Medium Severity</span>
            </div>
            <p className="text-xs text-amber-600">
              Action recommended within 2-3 days. Monitor closely and prepare response.
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="font-medium text-blue-800">Low Severity</span>
            </div>
            <p className="text-xs text-blue-600">
              Informational alert. Plan ahead and include in weekly review.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
