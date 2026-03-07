"use client";

// Mock data
const stats = [
  { label: "Total Products", value: "156", change: "+12", changeType: "positive" },
  { label: "Low Stock", value: "12", change: "3 critical", changeType: "warning" },
  { label: "Expiring Soon", value: "8", change: "2 urgent", changeType: "negative" },
  { label: "Inventory Value", value: "RM 45,230", change: "+8.2%", changeType: "positive" },
];

const expiringItems = [
  { name: "Fresh Chicken Breast", days: 2, qty: "25 kg", status: "warning" },
  { name: "Whole Milk", days: 3, qty: "40 L", status: "warning" },
  { name: "Mixed Vegetables", days: 1, qty: "15 kg", status: "critical" },
  { name: "Yogurt Assorted", days: 4, qty: "30 pcs", status: "normal" },
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
  const maxValue = 130;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Real-time inventory insights for your store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="bg-green-500 hover:bg-green-400 text-black font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            Sync Data
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Hari Raya Preparation Alert</p>
            <p className="text-sm text-zinc-400">Expected +45% demand increase in 2 weeks. Stock up on poultry and cooking oil.</p>
          </div>
          <button className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
            View Details →
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors"
          >
            <p className="text-zinc-500 text-sm">{stat.label}</p>
            <p className="text-2xl font-semibold mt-2 tracking-tight">{stat.value}</p>
            <p className={`text-sm mt-2 ${
              stat.changeType === "positive" ? "text-green-500" :
              stat.changeType === "warning" ? "text-amber-500" :
              stat.changeType === "negative" ? "text-red-500" : "text-zinc-500"
            }`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring Items */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <h2 className="font-medium">Expiring Items</h2>
              <span className="bg-red-500/10 text-red-500 text-xs font-medium px-2 py-0.5 rounded-full">
                {expiringItems.length} items
              </span>
            </div>
            <button className="text-zinc-400 hover:text-white text-sm transition-colors">
              View all →
            </button>
          </div>
          <div className="divide-y divide-zinc-800">
            {expiringItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === "critical" ? "bg-red-500" :
                    item.status === "warning" ? "bg-amber-500" : "bg-zinc-500"
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.qty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${
                    item.days <= 1 ? "text-red-500" :
                    item.days <= 2 ? "text-amber-500" : "text-zinc-400"
                  }`}>
                    {item.days}d left
                  </span>
                  <button className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    item.status === "critical" 
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}>
                    {item.status === "critical" ? "Urgent" : "Action"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Forecast */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <h2 className="font-medium">Demand Forecast</h2>
              <span className="bg-green-500/10 text-green-500 text-xs font-medium px-2 py-0.5 rounded-full">
                95% accuracy
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-zinc-400">Actual</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-zinc-400">Predicted</span>
              </span>
            </div>
          </div>
          <div className="p-5">
            {/* Chart */}
            <div className="h-48 flex items-end gap-3">
              {forecastData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-40">
                    <div 
                      className="w-3 bg-blue-500 rounded-sm transition-all hover:bg-blue-400"
                      style={{ height: `${(data.actual / maxValue) * 100}%` }}
                    />
                    <div 
                      className="w-3 bg-green-500/30 rounded-sm border border-green-500/50"
                      style={{ height: `${(data.predicted / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ESG Score */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium">ESG Score</h2>
            <span className="text-green-500 text-xs font-medium">On Track</span>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeDasharray="87, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">87</span>
                <span className="text-xs text-zinc-500">/100</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Waste Reduction</span>
              <span className="text-green-500 font-medium">-38%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Carbon Footprint</span>
              <span className="text-green-500 font-medium">-15%</span>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium">Monthly Savings</h2>
            <span className="text-green-500 text-xs font-medium">+23%</span>
          </div>
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-green-500">RM 3,240</p>
            <p className="text-zinc-500 text-sm mt-2">Saved from waste reduction</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Discounted Sales</span>
              <span className="font-medium">RM 1,820</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Donations (Tax Credit)</span>
              <span className="font-medium">RM 1,420</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h2 className="font-medium mb-4">AI Recommendations</h2>
          <div className="space-y-3">
            <button className="w-full p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-left hover:bg-amber-500/20 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Apply 20% Discount</p>
                  <p className="text-xs text-zinc-500 mt-0.5">3 items expiring in 2 days</p>
                </div>
                <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </button>
            <button className="w-full p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-left hover:bg-green-500/20 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Arrange Donation</p>
                  <p className="text-xs text-zinc-500 mt-0.5">5 items for food bank</p>
                </div>
                <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </button>
            <button className="w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-left hover:bg-blue-500/20 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Reorder Stock</p>
                  <p className="text-xs text-zinc-500 mt-0.5">8 items below threshold</p>
                </div>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
