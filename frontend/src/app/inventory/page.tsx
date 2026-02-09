'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import InventoryTable from '@/components/InventoryTable';
import AddStockModal from '@/components/AddStockModal';
import { BrainIcon } from '@/components/Icons';

// Simple category icons as inline SVGs
const PoultryIcon = () => (
  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ProduceIcon = () => (
  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const DairyIcon = () => (
  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStockAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Inventory Management</h1>
            <p className="text-slate-500 text-sm">
              Track and manage your perishable inventory in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Export CSV
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 rounded-xl text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              + Add Stock
            </button>
          </div>
        </div>
      </div>

      {/* Category Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <PoultryIcon />
            <span className="text-sm font-semibold text-amber-800">Poultry</span>
          </div>
          <p className="text-xs text-amber-600">High velocity • 3-5 day shelf life</p>
        </div>
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <ProduceIcon />
            <span className="text-sm font-semibold text-green-800">Produce</span>
          </div>
          <p className="text-xs text-green-600">Variable demand • Weather sensitive</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <DairyIcon />
            <span className="text-sm font-semibold text-blue-800">Dairy</span>
          </div>
          <p className="text-xs text-blue-600">Consistent demand • Cold chain critical</p>
        </div>
      </div>

      {/* Full Inventory Table */}
      <InventoryTable key={refreshKey} />

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><BrainIcon className="w-4 h-4 text-slate-600" /> Inventory Management Tips</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Products sorted by expiry date by default - prioritize items expiring soon</li>
          <li>• Items in <span className="text-rose-600 font-medium">red</span> need immediate action to prevent waste</li>
          <li>• Use the AI forecast to plan reorders before stock-outs occur</li>
          <li>• Monitor festive period demand multipliers for accurate stock planning</li>
        </ul>
      </div>

      {/* Add Stock Modal */}
      <AddStockModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleStockAdded}
      />
    </DashboardLayout>
  );
}
