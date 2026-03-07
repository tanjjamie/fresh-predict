"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BoxIcon,
  TrendingUpIcon,
  BellIcon,
  LeafIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
} from "../components/icons";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Inventory", href: "/dashboard/inventory", icon: BoxIcon },
  { name: "Forecasts", href: "/dashboard/forecasts", icon: TrendingUpIcon },
  { name: "Alerts", href: "/dashboard/alerts", icon: BellIcon },
  { name: "ESG Report", href: "/dashboard/esg", icon: LeafIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <LeafIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900">FreshPredict</h1>
                <p className="text-xs text-slate-500">AI Inventory</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
            >
              <XIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-slate-200">
            {/* ESG Compliance Badge */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-700">2026 ESG Compliant</span>
              </div>
              <p className="text-xs text-slate-600">
                Meeting Malaysian sustainability standards
              </p>
            </div>

            {/* Settings Link */}
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between h-full px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
            >
              <MenuIcon className="w-5 h-5 text-slate-500" />
            </button>

            <div className="hidden lg:block">
              <p className="text-sm text-slate-500">
                Welcome back to your dashboard
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Last sync:</span>
                <span className="font-medium text-slate-900">
                  {new Date().toLocaleTimeString("en-MY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-emerald-700">JT</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
