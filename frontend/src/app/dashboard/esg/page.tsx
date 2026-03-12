"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ESGMetrics {
  waste_saved_kg: number;
  methane_offset_kg_co2e: number;
  cost_savings_rm: number;
  items_rescued: number;
  waste_reduction_percentage: number;
  compliance_score: number;
  monthly_trend: {
    month: string;
    waste_kg: number;
    saved_kg: number;
  }[];
}

interface SustainabilityAlert {
  id: string;
  product_id: string;
  product_name: string;
  alert_type: string;
  severity: string;
  message: string;
  days_until_expiry: number;
  potential_waste_kg: number;
  potential_loss_rm: number;
}

export default function ESGPage() {
  const [metrics, setMetrics] = useState<ESGMetrics | null>(null);
  const [alerts, setAlerts] = useState<SustainabilityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, alertsRes] = await Promise.all([
        fetch(`${API_URL}/esg`),
        fetch(`${API_URL}/alerts/sustainability`)
      ]);
      
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
    } catch (error) {
      console.error("Error fetching ESG data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (alert: SustainabilityAlert) => {
    setActionLoading(alert.id + "-sold");
    try {
      const res = await fetch(`${API_URL}/alerts/mark-sold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: alert.id,
          product_id: alert.product_id,
          quantity_kg: alert.potential_waste_kg,
          cost_rm: alert.potential_loss_rm
        })
      });
      
      if (res.ok) {
        // Refresh data to show updated metrics
        await fetchData();
      }
    } catch (error) {
      console.error("Error marking item as sold:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkDonated = async (alert: SustainabilityAlert) => {
    setActionLoading(alert.id + "-donated");
    try {
      const res = await fetch(`${API_URL}/alerts/mark-donated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: alert.id,
          product_id: alert.product_id,
          quantity_kg: alert.potential_waste_kg,
          cost_rm: alert.potential_loss_rm,
          recipient: "Local Food Bank"
        })
      });
      
      if (res.ok) {
        // Refresh data to show updated metrics
        await fetchData();
      }
    } catch (error) {
      console.error("Error marking item as donated:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const generatePDFReport = () => {
    if (!metrics) return;
    
    setGeneratingPDF(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const today = new Date().toLocaleDateString('en-MY', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Calculate environmental equivalents
      const treesEquivalent = Math.round(metrics.methane_offset_kg_co2e / 21);
      const carKmEquivalent = Math.round(metrics.methane_offset_kg_co2e / 0.12);
      const mealsEquivalent = Math.round(metrics.waste_saved_kg / 0.5);
      
      // Header
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("ESG Sustainability Report", pageWidth / 2, 18, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("FreshPredict - Food Waste Prevention Platform", pageWidth / 2, 28, { align: "center" });
      doc.text(`Generated: ${today}`, pageWidth / 2, 35, { align: "center" });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Compliance Score Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("2026 Compliance Score", 20, 55);
      
      doc.setFontSize(48);
      doc.setTextColor(16, 185, 129);
      doc.text(`${metrics.compliance_score.toFixed(0)}`, 20, 80);
      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      doc.text("/ 100", 55, 80);
      
      const scoreStatus = metrics.compliance_score >= 90 ? "Excellent" : 
                          metrics.compliance_score >= 70 ? "Good" : "Needs Improvement";
      doc.setFontSize(12);
      doc.text(`Status: ${scoreStatus}`, 20, 90);
      
      // Key Metrics Box
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.roundedRect(100, 50, 95, 50, 3, 3, 'F');
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("KEY METRICS", 147, 58, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Waste Saved: ${metrics.waste_saved_kg.toFixed(1)} kg`, 105, 68);
      doc.text(`CO2e Offset: ${metrics.methane_offset_kg_co2e.toFixed(1)} kg`, 105, 76);
      doc.text(`Cost Savings: RM ${metrics.cost_savings_rm.toLocaleString()}`, 105, 84);
      doc.text(`Items Rescued: ${metrics.items_rescued}`, 105, 92);
      
      // Environmental Impact Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Environmental Impact", 20, 115);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      
      doc.text(`Equivalent to planting ${treesEquivalent} trees (yearly CO2 absorption)`, 25, 128);
      doc.text(`Equivalent to ${carKmEquivalent.toLocaleString()} km of car emissions avoided`, 25, 138);
      doc.text(`Equivalent to ${mealsEquivalent} meals saved from landfill`, 25, 148);
      
      // Methodology Section
      doc.setFillColor(243, 244, 246); // gray-100
      doc.roundedRect(15, 160, pageWidth - 30, 45, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Calculation Methodology", 20, 172);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("Carbon emissions calculated using IPCC 2026 Guidelines for National Greenhouse Gas Inventories.", 20, 182);
      doc.text(`Methane conversion factor: 0.918 kg CO2e per kg of food waste prevented.`, 20, 190);
      doc.text("Environmental equivalents based on EPA and IPCC standard conversion factors.", 20, 198);
      
      // Current Actions Section
      if (alerts.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Pending Sustainability Actions", 20, 220);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        
        const pendingAlerts = alerts.slice(0, 5);
        pendingAlerts.forEach((alert, index) => {
          const yPos = 232 + (index * 8);
          doc.text(`• ${alert.product_name}: ${alert.potential_waste_kg} kg at risk (${alert.days_until_expiry} days)`, 25, yPos);
        });
        
        if (alerts.length > 5) {
          doc.text(`... and ${alerts.length - 5} more items requiring attention`, 25, 232 + (5 * 8));
        }
      }
      
      // Footer
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 280, pageWidth, 17, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("FreshPredict - AI-Powered Food Waste Prevention for Malaysian Grocers", pageWidth / 2, 288, { align: "center" });
      doc.text("Compliant with 2026 ESG Reporting Standards", pageWidth / 2, 294, { align: "center" });
      
      // Save the PDF
      doc.save(`FreshPredict_ESG_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Unable to load ESG metrics</p>
      </div>
    );
  }

  // Calculate environmental equivalents
  const treesEquivalent = Math.round(metrics.methane_offset_kg_co2e / 21); // ~21kg CO2 per tree per year
  const carKmEquivalent = Math.round(metrics.methane_offset_kg_co2e / 0.12); // ~0.12kg CO2 per km
  const mealsEquivalent = Math.round(metrics.waste_saved_kg / 0.5); // ~0.5kg per meal

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ESG Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your environmental impact and sustainability compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generatePDFReport}
            disabled={generatingPDF}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              generatingPDF
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {generatingPDF ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </>
            )}
          </button>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
            metrics.compliance_score >= 90 
              ? "bg-emerald-500/10 text-emerald-500" 
              : metrics.compliance_score >= 70 
                ? "bg-amber-500/10 text-amber-500"
                : "bg-red-500/10 text-red-500"
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {metrics.compliance_score >= 90 ? "Excellent" : metrics.compliance_score >= 70 ? "Good" : "Needs Work"}
          </span>
        </div>
      </div>

      {/* Main Stats - What You've Achieved */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Your Impact So Far
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-background/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-emerald-500">{metrics.waste_saved_kg.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground mt-1">kg waste saved</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{metrics.methane_offset_kg_co2e.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground mt-1">kg CO₂e offset</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-amber-500">RM {metrics.cost_savings_rm.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">money saved</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-500">{metrics.items_rescued}</p>
            <p className="text-sm text-muted-foreground mt-1">items rescued</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compliance Score */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              2026 Compliance Score
            </h2>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-44 h-44">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className="stroke-secondary"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  className={
                    metrics.compliance_score >= 90 ? "stroke-emerald-500" :
                    metrics.compliance_score >= 70 ? "stroke-amber-500" : "stroke-red-500"
                  }
                  strokeWidth="3"
                  strokeDasharray={`${metrics.compliance_score}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{metrics.compliance_score.toFixed(0)}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Food Waste Tracking</span>
              </div>
              <span className="text-sm text-emerald-500 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Expiry Management</span>
              </div>
              <span className="text-sm text-emerald-500 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Carbon Reporting</span>
              </div>
              <span className="text-sm text-emerald-500 font-medium">IPCC 2026</span>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What This Means
          </h2>
          
          <p className="text-sm text-muted-foreground mb-6">
            Your waste prevention efforts have made a real environmental impact:
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-500">{treesEquivalent} trees</p>
                <p className="text-sm text-muted-foreground">worth of carbon absorbed in a year</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{carKmEquivalent.toLocaleString()} km</p>
                <p className="text-sm text-muted-foreground">of car driving emissions avoided</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{mealsEquivalent} meals</p>
                <p className="text-sm text-muted-foreground">worth of food saved from landfill</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items - Prevent More Waste */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Take Action - Prevent Waste Now
            </h2>
            {alerts.length > 0 && (
              <span className="bg-amber-500/10 text-amber-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                {alerts.length} items need attention
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Mark items as sold or donated to prevent waste and improve your ESG score
          </p>
        </div>
        
        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-emerald-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-emerald-500">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">No items at risk of going to waste</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.severity === "high" ? "bg-red-500" :
                      alert.severity === "medium" ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="font-medium">{alert.product_name}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Potential waste: {alert.potential_waste_kg} kg</span>
                        <span>Value: RM {alert.potential_loss_rm.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleMarkSold(alert)}
                      disabled={actionLoading !== null}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        actionLoading === alert.id + "-sold"
                          ? "bg-secondary text-muted-foreground cursor-not-allowed"
                          : actionLoading !== null
                            ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                      }`}
                    >
                      {actionLoading === alert.id + "-sold" ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        "Mark Sold"
                      )}
                    </button>
                    <button
                      onClick={() => handleMarkDonated(alert)}
                      disabled={actionLoading !== null}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        actionLoading === alert.id + "-donated"
                          ? "bg-secondary text-muted-foreground cursor-not-allowed"
                          : actionLoading !== null
                            ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {actionLoading === alert.id + "-donated" ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        "Donate"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {alerts.length > 5 && (
          <div className="p-4 border-t border-border">
            <Link 
              href="/dashboard/alerts" 
              className="text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
            >
              View all {alerts.length} sustainability alerts
            </Link>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Tips to Improve Your Score
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="font-medium text-sm mb-2">Apply Discounts Early</p>
            <p className="text-xs text-muted-foreground">
              Mark items for discount 3-4 days before expiry to maximize sales
            </p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="font-medium text-sm mb-2">Track Everything</p>
            <p className="text-xs text-muted-foreground">
              Use the &quot;Mark Sold&quot; button to record all rescued items for compliance
            </p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="font-medium text-sm mb-2">Partner with Food Banks</p>
            <p className="text-xs text-muted-foreground">
              Donate items you can&apos;t sell for tax credits and better ESG scores
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
