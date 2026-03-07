import Link from "next/link";
import {
  LeafIcon,
  TrendingUpIcon,
  BoxIcon,
  AlertTriangleIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "./components/icons";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LeafIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FreshPredict</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="h-10 px-5 bg-foreground text-background rounded-full text-sm font-medium flex items-center gap-2 hover:bg-foreground/90 transition-colors"
            >
              Get Started
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <LeafIcon className="w-4 h-4" />
              <span>2026 ESG Compliance Ready</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight text-balance mb-6">
              AI-Powered Inventory Management for Malaysian Grocers
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty mb-8">
              Reduce food waste by up to 40%, optimize stock levels with demand forecasting, and meet sustainability
              requirements. Built specifically for Malaysian SME grocers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="h-12 px-8 bg-primary text-primary-foreground rounded-full text-base font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                Start Free Trial
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="h-12 px-8 border border-border text-foreground rounded-full text-base font-medium flex items-center hover:bg-muted transition-colors"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "40%", label: "Waste Reduction" },
              { value: "25%", label: "Cost Savings" },
              { value: "95%", label: "Forecast Accuracy" },
              { value: "500+", label: "SMEs Served" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-card rounded-2xl border border-border">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Manage Inventory Smarter
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by AI forecasting with Malaysian festive calendar integration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUpIcon,
                title: "AI Demand Forecasting",
                description:
                  "Prophet-powered predictions that account for Raya, CNY, Deepavali, and local demand patterns.",
              },
              {
                icon: BoxIcon,
                title: "Smart Inventory Tracking",
                description:
                  "Real-time stock monitoring with automatic expiry alerts and reorder point recommendations.",
              },
              {
                icon: AlertTriangleIcon,
                title: "Expiry Alerts",
                description:
                  "Get notified before products expire. Prioritize sales for items nearing expiry dates.",
              },
              {
                icon: BarChart3Icon,
                title: "Waste Analytics",
                description:
                  "Track and analyze food waste patterns. Identify opportunities to reduce spoilage.",
              },
              {
                icon: LeafIcon,
                title: "ESG Compliance",
                description:
                  "Built-in sustainability scoring and reporting for 2026 Malaysian ESG requirements.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Action Recommendations",
                description:
                  "AI-driven suggestions for discounts, donations, and stock optimization strategies.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-card rounded-2xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Malaysian Grocers Choose FreshPredict
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our AI understands local demand patterns, festive seasons, and sustainability requirements unique to
                Malaysia.
              </p>
              <ul className="space-y-4">
                {[
                  "Festive calendar integration for Raya, CNY, Deepavali",
                  "Halal inventory tracking and certification support",
                  "Multi-language support: BM, English, Chinese",
                  "Integration with local suppliers and distributors",
                  "Compliant with Malaysia 2026 ESG requirements",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-muted rounded-3xl p-8 border border-border">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                      <AlertTriangleIcon className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Expiring Soon</p>
                      <p className="text-sm text-muted-foreground">Fresh Chicken - 2 days left</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-warning/10 text-warning rounded-full">Action Needed</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUpIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Demand Spike Expected</p>
                      <p className="text-sm text-muted-foreground">+45% for Raya Week</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">Forecast</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <LeafIcon className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">ESG Score Improved</p>
                      <p className="text-sm text-muted-foreground">Now at 87/100</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-success/10 text-success rounded-full">On Track</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
            Ready to Reduce Waste and Save Costs?
          </h2>
          <p className="text-lg text-background/70 mb-8">
            Join 500+ Malaysian grocers already using FreshPredict to optimize their inventory.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="h-12 px-8 bg-primary text-primary-foreground rounded-full text-base font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              Start Free 14-Day Trial
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className="h-12 px-8 border border-background/20 text-background rounded-full text-base font-medium flex items-center hover:bg-background/10 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LeafIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">FreshPredict</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 FreshPredict. Built for Malaysian SME Grocers.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
