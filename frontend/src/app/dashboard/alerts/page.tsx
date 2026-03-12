"use client";

import { useState, useEffect } from "react";

interface PreparationAlert {
  id: string;
  product_id: string;
  product_name: string;
  alert_type: string;
  severity: string;
  message: string;
  recommended_action: string;
  predicted_demand_increase: number;
  days_until_event: number;
  created_at: string;
}

interface SustainabilityAlert {
  id: string;
  product_id: string;
  product_name: string;
  alert_type: string;
  severity: string;
  message: string;
  recommended_action: string;
  days_until_expiry: number;
  potential_waste_kg: number;
  potential_loss_rm: number;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AlertsPage() {
  const [prepAlerts, setPrepAlerts] = useState<PreparationAlert[]>([]);
  const [sustainAlerts, setSustainAlerts] = useState<SustainabilityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"preparation" | "sustainability">("preparation");
  const [showMarkSoldModal, setShowMarkSoldModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SustainabilityAlert | null>(null);
  const [markSoldForm, setMarkSoldForm] = useState({
    quantity_kg: 0,
    cost_rm: 0,
  });
  const [donateForm, setDonateForm] = useState({
    quantity_kg: 0,
    recipient: "Local Food Bank",
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const [prepRes, sustainRes] = await Promise.all([
        fetch(`${API_URL}/alerts/preparation`),
        fetch(`${API_URL}/alerts/sustainability`),
      ]);
      
      if (prepRes.ok) {
        const prepData = await prepRes.json();
        setPrepAlerts(prepData);
      }
      if (sustainRes.ok) {
        const sustainData = await sustainRes.json();
        setSustainAlerts(sustainData);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    
    try {
      const res = await fetch(`${API_URL}/alerts/mark-sold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: selectedAlert.id,
          product_id: selectedAlert.product_id,
          quantity_kg: markSoldForm.quantity_kg,
          cost_rm: markSoldForm.cost_rm,
        }),
      });
      
      if (res.ok) {
        await fetchAlerts();
        setShowMarkSoldModal(false);
        setSelectedAlert(null);
        setMarkSoldForm({ quantity_kg: 0, cost_rm: 0 });
      }
    } catch (error) {
      console.error("Error marking as sold:", error);
    }
  };

  const openMarkSoldModal = (alert: SustainabilityAlert) => {
    setSelectedAlert(alert);
    setMarkSoldForm({
      quantity_kg: alert.potential_waste_kg,
      cost_rm: alert.potential_loss_rm * 0.7, // Default to 70% of original price
    });
    setShowMarkSoldModal(true);
  };

  const openDonateModal = (alert: SustainabilityAlert) => {
    setSelectedAlert(alert);
    setDonateForm({
      quantity_kg: alert.potential_waste_kg,
      recipient: "Local Food Bank",
    });
    setShowDonateModal(true);
  };

  const handleMarkDonated = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    
    try {
      const res = await fetch(`${API_URL}/alerts/mark-donated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: selectedAlert.id,
          product_id: selectedAlert.product_id,
          quantity_kg: donateForm.quantity_kg,
          cost_rm: selectedAlert.potential_loss_rm,
          recipient: donateForm.recipient,
        }),
      });
      
      if (res.ok) {
        await fetchAlerts();
        setShowDonateModal(false);
        setSelectedAlert(null);
        setDonateForm({ quantity_kg: 0, recipient: "Local Food Bank" });
      }
    } catch (error) {
      console.error("Error marking as donated:", error);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "demand_spike":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case "festive_surge":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "stock_out_risk":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "expiry_risk":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "overstock":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const totalAlerts = prepAlerts.length + sustainAlerts.length;
  const highPriorityCount = [...prepAlerts, ...sustainAlerts].filter(a => a.severity === "high").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Preparation and sustainability alerts for your inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-secondary text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
            {totalAlerts} Total Alerts
          </span>
          {highPriorityCount > 0 && (
            <span className="bg-red-500/10 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-full">
              {highPriorityCount} High Priority
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("preparation")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "preparation"
              ? "border-emerald-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Preparation Alerts
          {prepAlerts.length > 0 && (
            <span className="ml-2 bg-secondary px-2 py-0.5 rounded-full text-xs">
              {prepAlerts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("sustainability")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "sustainability"
              ? "border-emerald-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Sustainability Alerts
          {sustainAlerts.length > 0 && (
            <span className="ml-2 bg-secondary px-2 py-0.5 rounded-full text-xs">
              {sustainAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Preparation Alerts */}
      {activeTab === "preparation" && (
        <div className="space-y-4">
          {prepAlerts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium">All Clear!</p>
              <p className="text-sm text-muted-foreground mt-1">No preparation alerts at this time</p>
            </div>
          ) : (
            prepAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-card border rounded-xl p-5 ${getSeverityStyles(alert.severity)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    alert.severity === "high" ? "bg-red-500/20 text-red-500" :
                    alert.severity === "medium" ? "bg-amber-500/20 text-amber-500" :
                    "bg-blue-500/20 text-blue-500"
                  }`}>
                    {getAlertTypeIcon(alert.alert_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold">{alert.product_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          alert.severity === "high" ? "bg-red-500 text-white" :
                          alert.severity === "medium" ? "bg-amber-500 text-white" :
                          "bg-blue-500 text-white"
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {alert.alert_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-emerald-500 font-medium">+{alert.predicted_demand_increase}%</span>
                        <span className="text-muted-foreground">demand increase</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-muted-foreground">{alert.days_until_event} days until event</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-background/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Recommended Action:</p>
                      <p className="text-sm font-medium">{alert.recommended_action}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sustainability Alerts */}
      {activeTab === "sustainability" && (
        <div className="space-y-4">
          {sustainAlerts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium">All Clear!</p>
              <p className="text-sm text-muted-foreground mt-1">No sustainability alerts at this time</p>
            </div>
          ) : (
            sustainAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-card border rounded-xl p-5 ${getSeverityStyles(alert.severity)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    alert.severity === "high" ? "bg-red-500/20 text-red-500" :
                    alert.severity === "medium" ? "bg-amber-500/20 text-amber-500" :
                    "bg-blue-500/20 text-blue-500"
                  }`}>
                    {getAlertTypeIcon(alert.alert_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold">{alert.product_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          alert.severity === "high" ? "bg-red-500 text-white" :
                          alert.severity === "medium" ? "bg-amber-500 text-white" :
                          "bg-blue-500 text-white"
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {alert.alert_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`font-medium ${alert.days_until_expiry <= 2 ? "text-red-500" : "text-amber-500"}`}>
                          {alert.days_until_expiry} days
                        </span>
                        <span className="text-muted-foreground">until expiry</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">{alert.potential_waste_kg} kg at risk</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-500 font-medium">RM {alert.potential_loss_rm.toFixed(2)}</span>
                        <span className="text-muted-foreground">potential loss</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 p-3 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Recommended Action:</p>
                        <p className="text-sm font-medium">{alert.recommended_action}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openMarkSoldModal(alert)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Mark Sold
                        </button>
                        <button
                          onClick={() => openDonateModal(alert)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Donate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mark as Sold Modal */}
      {showMarkSoldModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Mark as Sold</h2>
              <button
                onClick={() => setShowMarkSoldModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
              <p className="font-medium">{selectedAlert.product_name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAlert.days_until_expiry} days until expiry • {selectedAlert.potential_waste_kg} kg
              </p>
            </div>
            <form onSubmit={handleMarkSold} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity Sold (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={markSoldForm.quantity_kg}
                  onChange={(e) => setMarkSoldForm({ ...markSoldForm, quantity_kg: parseFloat(e.target.value) })}
                  required
                  min="0.1"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sale Price (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={markSoldForm.cost_rm}
                  onChange={(e) => setMarkSoldForm({ ...markSoldForm, cost_rm: parseFloat(e.target.value) })}
                  required
                  min="0"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Original value: RM {selectedAlert.potential_loss_rm.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarkSoldModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Donate to Food Bank</h2>
              <button
                onClick={() => setShowDonateModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="font-medium">{selectedAlert.product_name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAlert.days_until_expiry} days until expiry • {selectedAlert.potential_waste_kg} kg
              </p>
            </div>
            <form onSubmit={handleMarkDonated} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity to Donate (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={donateForm.quantity_kg}
                  onChange={(e) => setDonateForm({ ...donateForm, quantity_kg: parseFloat(e.target.value) })}
                  required
                  min="0.1"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Organization</label>
                <select
                  value={donateForm.recipient}
                  onChange={(e) => setDonateForm({ ...donateForm, recipient: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Local Food Bank">Local Food Bank</option>
                  <option value="Kechara Soup Kitchen">Kechara Soup Kitchen</option>
                  <option value="The Lost Food Project">The Lost Food Project</option>
                  <option value="Food Aid Foundation">Food Aid Foundation</option>
                  <option value="Other">Other Organization</option>
                </select>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  <strong>ESG Benefit:</strong> Donations count toward waste prevention and may qualify for tax deductions.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDonateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
