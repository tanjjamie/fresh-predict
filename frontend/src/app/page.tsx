'use client';

import DashboardLayout from '@/components/DashboardLayout';
import DashboardStats from '@/components/DashboardStats';
import FestivalBanner from '@/components/FestivalBanner';
import PreparationAlerts from '@/components/PreparationAlerts';
import SustainabilityAlerts from '@/components/SustainabilityAlerts';
import ESGScorecard from '@/components/ESGScorecard';
import InventoryTable from '@/components/InventoryTable';
import ForecastChart from '@/components/ForecastChart';

export default function Home() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm">
              AI-powered inventory management for Malaysian SME grocers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Last updated:</span>
            <span className="text-xs font-medium text-slate-700">
              {new Date().toLocaleString('en-MY', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Festival Alert Banner */}
      <div className="mb-6">
        <FestivalBanner />
      </div>

      {/* Key Stats */}
      <div className="mb-6">
        <DashboardStats />
      </div>

      {/* Dual Alert System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PreparationAlerts maxItems={4} />
        <SustainabilityAlerts maxItems={4} />
      </div>

      {/* Forecast & ESG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ForecastChart />
        <ESGScorecard />
      </div>

      {/* Inventory Overview */}
      <div className="mb-6">
        <InventoryTable compact />
      </div>
    </DashboardLayout>
  );
}