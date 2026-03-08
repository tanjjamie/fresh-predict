"use client";

// Mock data
const stats = [
  { label: "Total Products", value: "156", change: "+12 this week", changeType: "positive" },
  { label: "Low Stock", value: "12", change: "3 critical", changeType: "warning" },
  { label: "Expiring Soon", value: "8", change: "2 urgent", changeType: "negative" },
  { label: "Inventory Value", value: "RM 45,230", change: "+8.2%", changeType: "positive" },
];

const expiringItems = [
  { name: "Fresh Chicken Breast", category: "Poultry", days: 2, qty: "25 kg", status: "warning" },
  { name: "Whole Milk", category: "Dairy", days: 3, qty: "40 L", status: "warning" },
  { name: "Mixed Vegetables", category: "Produce", days: 1, qty: "15 kg", status: "critical" },
  { name: "Yogurt Assorted", category: "Dairy", days: 4, qty: "30 pcs", status: "normal" },
];

const forecastData = [
  { day: "Mon", actual: 65, predicted: 70 },
  { day: "Tue", actual: 80, predicted: 75 },
  { day: "Wed", actual: 72, predicted: 78 },
  { day: "Thu", actual: 90, predicted: 85 },
  { day: "Fri", actual: 110, predicted: 105 },
  { day: "Sat", actual: 130, predicted: 125 },
  { day: "Sun", actual: 95, predicted: 100 },
];

export default function DashboardPage() {
  const maxValue = 140;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time inventory insights for your store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            Sync Data
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Hari Raya Preparation Alert</p>
            <p className="text-sm text-muted-foreground">Expected +45% demand increase in 2 weeks. Stock up on poultry and cooking oil.</p>
          </div>
          <button className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors whitespace-nowrap">
            View Details
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow"
          >
            <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</p>
            <div className={`flex items-center gap-1.5 mt-2 text-sm ${
              stat.changeType === "positive" ? "text-emerald-500" :
              stat.changeType === "warning" ? "text-amber-500" :
              stat.changeType === "negative" ? "text-red-500" : "text-muted-foreground"
            }`}>
              {stat.changeType === "positive" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {stat.changeType === "negative" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                </svg>
              )}
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring Items */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold">Expiring Items</h2>
                <p className="text-xs text-muted-foreground">Items needing attention</p>
              </div>
            </div>
            <span className="bg-red-500/10 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              {expiringItems.length} items
            </span>
          </div>
          <div className="divide-y divide-border">
            {expiringItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    item.status === "critical" ? "bg-red-500" :
                    item.status === "warning" ? "bg-amber-500" : "bg-muted-foreground"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category} - {item.qty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-sm font-medium ${
                    item.days <= 1 ? "text-red-500" :
                    item.days <= 2 ? "text-amber-500" : "text-muted-foreground"
                  }`}>
                    {item.days}d
                  </span>
                  <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    item.status === "critical" 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}>
                    {item.status === "critical" ? "Action" : "View"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <button className="text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
              View all expiring items
            </button>
          </div>
        </div>

        {/* Demand Forecast */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold">Demand Forecast</h2>
                <p className="text-xs text-muted-foreground">AI-powered predictions</p>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              95% accuracy
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-6 mb-4">
              <span className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-muted-foreground">Actual Sales</span>
              </span>
              <span className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded bg-emerald-500/40 border-2 border-emerald-500" />
                <span className="text-muted-foreground">Predicted</span>
              </span>
            </div>
            {/* Chart */}
            <div className="h-52 flex items-end gap-2">
              {forecastData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div 
                      className="w-4 bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                      style={{ height: `${(data.actual / maxValue) * 100}%` }}
                    />
                    <div 
                      className="w-4 bg-emerald-500/30 rounded-t border-2 border-emerald-500"
                      style={{ height: `${(data.predicted / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ESG Score */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-semibold">ESG Score</h2>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-1 rounded-full">On Track</span>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className="stroke-secondary"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className="stroke-emerald-500"
                  strokeWidth="3"
                  strokeDasharray="87, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">87</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Waste Reduction</span>
              <span className="text-sm text-emerald-500 font-semibold">-38%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Carbon Footprint</span>
              <span className="text-sm text-emerald-500 font-semibold">-15%</span>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-semibold">Monthly Savings</h2>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-1 rounded-full">+23%</span>
          </div>
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-emerald-500">RM 3,240</p>
            <p className="text-muted-foreground text-sm mt-2">Saved from waste reduction</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Discounted Sales</span>
              <span className="text-sm font-semibold">RM 1,820</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Donations (Tax Credit)</span>
              <span className="text-sm font-semibold">RM 1,420</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="font-semibold">AI Recommendations</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left hover:bg-amber-500/15 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Apply 20% Discount</p>
                  <p className="text-xs text-muted-foreground mt-1">3 items expiring in 2 days</p>
                </div>
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left hover:bg-emerald-500/15 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Arrange Donation</p>
                  <p className="text-xs text-muted-foreground mt-1">5 items for food bank</p>
                </div>
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button className="w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left hover:bg-blue-500/15 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Reorder Stock</p>
                  <p className="text-xs text-muted-foreground mt-1">8 items below threshold</p>
                </div>
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
