"use client";

import {
  BoxIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  LeafIcon,
  ClockIcon,
  TagIcon,
  HeartIcon,
  RefreshIcon,
} from "../components/icons";

// Mock data - in production this would come from your API
const dashboardStats = {
  totalProducts: 156,
  lowStockCount: 12,
  expiryRiskCount: 8,
  totalValue: 45230,
};

const expiringItems = [
  { id: 1, name: "Fresh Chicken Breast", daysLeft: 2, quantity: 25, unit: "kg", action: "discount" },
  { id: 2, name: "Whole Milk", daysLeft: 3, quantity: 40, unit: "L", action: "donate" },
  { id: 3, name: "Mixed Vegetables", daysLeft: 1, quantity: 15, unit: "kg", action: "urgent" },
  { id: 4, name: "Yogurt Assorted", daysLeft: 4, quantity: 30, unit: "pcs", action: "monitor" },
];

const forecastData = [
  { day: "Mon", demand: 65, predicted: 70 },
  { day: "Tue", demand: 80, predicted: 75 },
  { day: "Wed", demand: 72, predicted: 78 },
  { day: "Thu", demand: 90, predicted: 85 },
  { day: "Fri", demand: 110, predicted: 105 },
  { day: "Sat", demand: 130, predicted: 125 },
  { day: "Sun", demand: 95, predicted: 100 },
];

const esgMetrics = {
  wasteReduction: 38,
  sustainabilityScore: 87,
  carbonFootprint: -15,
  compliance: "On Track",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered inventory overview for your store
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <RefreshIcon className="w-4 h-4" />
          Sync Data
        </button>
      </div>

      {/* Festival Alert Banner */}
      <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-warning/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🌙</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Hari Raya Preparation</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Expected +45% demand increase in 2 weeks. Stock up on poultry, cooking oil, and rendang ingredients.
            </p>
          </div>
          <button className="text-sm font-medium text-warning hover:underline">
            View Recommendations
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={dashboardStats.totalProducts}
          icon={BoxIcon}
          variant="default"
        />
        <StatCard
          label="Low Stock"
          value={dashboardStats.lowStockCount}
          icon={AlertTriangleIcon}
          variant="warning"
          subtext="Needs attention"
        />
        <StatCard
          label="Expiry Risk"
          value={dashboardStats.expiryRiskCount}
          icon={ClockIcon}
          variant="danger"
          subtext="Action required"
        />
        <StatCard
          label="Inventory Value"
          value={`RM ${dashboardStats.totalValue.toLocaleString()}`}
          icon={TagIcon}
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring Items */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Expiring Soon</h3>
                <p className="text-sm text-muted-foreground">Items needing attention</p>
              </div>
            </div>
            <span className="text-xs font-medium px-3 py-1 bg-destructive/10 text-destructive rounded-full">
              {expiringItems.length} items
            </span>
          </div>

          <div className="space-y-3">
            {expiringItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.daysLeft <= 1
                        ? "bg-destructive"
                        : item.daysLeft <= 2
                        ? "bg-warning"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} - {item.daysLeft}d left
                    </p>
                  </div>
                </div>
                <ActionButton action={item.action} />
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-xl hover:bg-muted">
            View All Expiring Items
          </button>
        </div>

        {/* AI Forecast */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <TrendingUpIcon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Demand Forecast</h3>
                <p className="text-sm text-muted-foreground">7-day AI prediction</p>
              </div>
            </div>
            <span className="text-xs font-medium px-3 py-1 bg-accent/10 text-accent rounded-full">
              Prophet AI
            </span>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-48 flex items-end gap-2 mb-4">
            {forecastData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/20 rounded-t"
                    style={{ height: `${(data.predicted / 130) * 150}px` }}
                  >
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${(data.demand / data.predicted) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{data.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded" />
              Actual
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary/20 rounded" />
              Predicted
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid - ESG and Sustainability */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ESG Score Card */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <LeafIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">ESG Score</h3>
              <p className="text-sm text-muted-foreground">Sustainability rating</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-primary/20">
              <div className="text-center">
                <span className="text-3xl font-bold text-primary">{esgMetrics.sustainabilityScore}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Compliance Status</span>
              <span className="text-sm font-medium text-primary">{esgMetrics.compliance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Carbon Footprint</span>
              <span className="text-sm font-medium text-primary">{esgMetrics.carbonFootprint}%</span>
            </div>
          </div>
        </div>

        {/* Waste Reduction */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <RefreshIcon className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Waste Reduction</h3>
              <p className="text-sm text-muted-foreground">This month vs last</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="text-5xl font-bold text-success">{esgMetrics.wasteReduction}%</span>
            <p className="text-sm text-muted-foreground mt-2">Less food waste</p>
          </div>

          <div className="p-4 bg-success/5 rounded-xl border border-success/10">
            <p className="text-sm text-foreground">
              <span className="font-semibold">RM 3,240</span> saved from waste reduction
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <HeartIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">AI recommendations</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full p-4 bg-warning/5 border border-warning/10 rounded-xl text-left hover:bg-warning/10 transition-colors">
              <p className="font-medium text-foreground text-sm">Apply 20% Discount</p>
              <p className="text-xs text-muted-foreground mt-1">3 items expiring in 2 days</p>
            </button>
            <button className="w-full p-4 bg-primary/5 border border-primary/10 rounded-xl text-left hover:bg-primary/10 transition-colors">
              <p className="font-medium text-foreground text-sm">Arrange Donation</p>
              <p className="text-xs text-muted-foreground mt-1">5 items suitable for food bank</p>
            </button>
            <button className="w-full p-4 bg-accent/5 border border-accent/10 rounded-xl text-left hover:bg-accent/10 transition-colors">
              <p className="font-medium text-foreground text-sm">Reorder Stock</p>
              <p className="text-xs text-muted-foreground mt-1">8 items below reorder point</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon: Icon,
  variant,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "warning" | "danger" | "success";
  subtext?: string;
}) {
  const variants = {
    default: {
      bg: "bg-card",
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
      subtextColor: "text-muted-foreground",
    },
    warning: {
      bg: "bg-warning/5",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      subtextColor: "text-warning",
    },
    danger: {
      bg: "bg-destructive/5",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      subtextColor: "text-destructive",
    },
    success: {
      bg: "bg-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      subtextColor: "text-primary",
    },
  };

  const style = variants[variant];

  return (
    <div className={`p-5 ${style.bg} rounded-2xl border border-border`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${style.iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
        </div>
        {subtext && (
          <span className={`text-xs font-medium ${style.subtextColor}`}>{subtext}</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}

function ActionButton({ action }: { action: string }) {
  const actions = {
    urgent: { label: "Urgent Sale", bg: "bg-destructive", text: "text-destructive-foreground" },
    discount: { label: "Apply Discount", bg: "bg-warning", text: "text-warning-foreground" },
    donate: { label: "Donate", bg: "bg-primary", text: "text-primary-foreground" },
    monitor: { label: "Monitor", bg: "bg-muted", text: "text-muted-foreground" },
  };

  const style = actions[action as keyof typeof actions] || actions.monitor;

  return (
    <button
      className={`px-3 py-1.5 ${style.bg} ${style.text} rounded-lg text-xs font-medium hover:opacity-90 transition-opacity`}
    >
      {style.label}
    </button>
  );
}
