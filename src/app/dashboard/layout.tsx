"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Inventory", href: "/dashboard/inventory" },
  { name: "Forecasts", href: "/dashboard/forecasts" },
  { name: "Alerts", href: "/dashboard/alerts" },
  { name: "ESG", href: "/dashboard/esg" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="flex items-center h-14 px-4 max-w-screen-2xl mx-auto">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 mr-8">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.55-3.53C8.86 17.19 10.7 17 12 17c6 0 10-5 10-10 0-1.5-.5-3-1.5-4.5C18.5 5 17 8 17 8z"/>
              </svg>
            </div>
            <span className="font-semibold tracking-tight">FreshPredict</span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-1.5 text-sm transition-colors rounded-md ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white -mb-[17px]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-4">
            <button className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-zinc-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="relative text-zinc-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-zinc-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-black" />
            </button>
            <div className="h-5 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 ring-2 ring-zinc-700 flex items-center justify-center text-xs font-medium">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto p-6">{children}</main>
    </div>
  );
}
