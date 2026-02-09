'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ESGScorecard from '@/components/ESGScorecard';
import { TrophyIcon, GlobeIcon, TargetIcon, ThermometerIcon, ClipboardIcon } from '@/components/Icons';

export default function ESGPage() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">ESG Report</h1>
            <p className="text-slate-500 text-sm">
              2026 Malaysian Sustainability Reporting Compliance Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Download PDF
            </button>
            <button className="px-4 py-2 bg-emerald-500 rounded-xl text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
              Submit Report
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8" />
            <div>
              <h3 className="font-bold">2026 ESG Compliance Status</h3>
              <p className="text-emerald-100 text-sm">
                Meeting Malaysian Mandatory Sustainability Reporting Requirements
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">85%</p>
            <p className="text-emerald-100 text-sm">Compliance Score</p>
          </div>
        </div>
      </div>

      {/* Full ESG Scorecard */}
      <div className="mb-6">
        <ESGScorecard />
      </div>

      {/* SDG Alignment */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><GlobeIcon className="w-5 h-5 text-teal-600" /> UN SDG Alignment</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon className="w-6 h-6 text-amber-600" />
              <span className="font-semibold text-amber-800">SDG 12.3 Target</span>
            </div>
            <p className="text-sm text-amber-700 mb-2">
              50% reduction in global per capita food waste by 2030
            </p>
            <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '83%' }}></div>
            </div>
            <p className="text-xs text-amber-600 mt-1">Your progress: 83% waste reduction achieved</p>
          </div>
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerIcon className="w-6 h-6 text-teal-600" />
              <span className="font-semibold text-teal-800">Methane Mitigation</span>
            </div>
            <p className="text-sm text-teal-700 mb-2">
              National Low Carbon Cities Framework compliance
            </p>
            <div className="w-full h-2 bg-teal-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '137.7%' }}></div>
            </div>
            <p className="text-xs text-teal-600 mt-1">137.7 kg CO₂e prevented this month</p>
          </div>
        </div>
      </div>

      {/* Regulatory Context */}
      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardIcon className="w-5 h-5 text-slate-600" /> 2026 Regulatory Context</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">✓</span>
              <div>
                <h4 className="font-semibold text-slate-800">Circular Economy Blueprint (2025-2035)</h4>
                <p className="text-sm text-slate-600">
                  Aligned with Malaysia&apos;s strategic pivot from linear &quot;take-make-dispose&quot; model to regenerative circular economy.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">✓</span>
              <div>
                <h4 className="font-semibold text-slate-800">2026 Mandatory ESG Reporting</h4>
                <p className="text-sm text-slate-600">
                  Transparent data on carbon footprint and waste mitigation strategies as required by new Malaysian regulations.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-bold">✓</span>
              <div>
                <h4 className="font-semibold text-slate-800">IPCC Standards Compliance</h4>
                <p className="text-sm text-slate-600">
                  Methane offset calculations based on 2026 IPCC methodology (0.918 kg CO₂e per kg food waste avoided).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
