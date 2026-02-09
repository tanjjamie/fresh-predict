'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChartIcon, BoxIcon, TrendingUpIcon, BellIcon, LeafIcon } from './Icons';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: ChartIcon },
  { name: 'Inventory', href: '/inventory', icon: BoxIcon },
  { name: 'Forecasts', href: '/forecasts', icon: TrendingUpIcon },
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
  { name: 'ESG Report', href: '/esg', icon: LeafIcon },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-slate-200 w-64`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">F</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">FreshPredict</h1>
              <p className="text-xs text-slate-500">AI Inventory System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* ESG Compliance Badge */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-700">2026 ESG Compliant</span>
              </div>
              <p className="text-xs text-emerald-600">
                Meeting Malaysian sustainability reporting standards
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main content */}
      <main className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
