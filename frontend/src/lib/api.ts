// API service for FreshPredict backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============== TYPES ==============

export interface InventoryItem {
  id: string;
  name: string;
  category: 'poultry' | 'produce' | 'dairy';
  current_stock: number;
  unit: string;
  cost_per_unit: number;
  expiry_date: string;
  reorder_point: number;
  supplier: string;
  days_until_expiry?: number;
}

export interface ForecastResult {
  product_id: string;
  product_name: string;
  dates: string[];
  predicted_demand: number[];
  confidence_lower: number[];
  confidence_upper: number[];
  trend: 'increasing' | 'decreasing' | 'stable';
  festive_impact: string | null;
}

export interface PreparationAlert {
  id: string;
  product_id: string;
  product_name: string;
  alert_type: 'demand_spike' | 'stock_out_risk' | 'festive_surge';
  severity: 'high' | 'medium' | 'low';
  message: string;
  recommended_action: string;
  predicted_demand_increase: number;
  days_until_event: number;
  created_at: string;
}

export interface SustainabilityAlert {
  id: string;
  product_id: string;
  product_name: string;
  alert_type: 'expiry_risk' | 'overstock' | 'slow_moving';
  severity: 'high' | 'medium' | 'low';
  message: string;
  recommended_action: string;
  days_until_expiry: number;
  potential_waste_kg: number;
  potential_loss_rm: number;
  created_at: string;
}

export interface MonthlyTrend {
  month: string;
  waste_kg: number;
  saved_kg: number;
}

export interface ESGMetrics {
  waste_saved_kg: number;
  methane_offset_kg_co2e: number;
  cost_savings_rm: number;
  items_rescued: number;
  waste_reduction_percentage: number;
  compliance_score: number;
  monthly_trend: MonthlyTrend[];
}

export interface DashboardSummary {
  total_products: number;
  low_stock_count: number;
  expiry_risk_count: number;
  preparation_alerts_count: number;
  sustainability_alerts_count: number;
  total_inventory_value_rm: number;
  esg_metrics: ESGMetrics;
}

export interface Festival {
  name: string;
  date: string;
  impact_categories: string[];
  demand_multiplier: number;
  days_until: number;
}

// ============== API FUNCTIONS ==============

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Dashboard
  getDashboardSummary: () => fetchAPI<DashboardSummary>('/dashboard'),

  // Inventory
  getInventory: (category?: string) => 
    fetchAPI<InventoryItem[]>(category ? `/inventory?category=${category}` : '/inventory'),
  getInventoryItem: (id: string) => fetchAPI<InventoryItem>(`/inventory/${id}`),

  // Forecasting
  getForecast: (productId: string, days: number = 14) => 
    fetchAPI<ForecastResult>(`/forecast/${productId}?days=${days}`),
  getAllForecasts: (days: number = 14) => 
    fetchAPI<ForecastResult[]>(`/forecast?days=${days}`),

  // Alerts
  getPreparationAlerts: (severity?: string) => 
    fetchAPI<PreparationAlert[]>(severity ? `/alerts/preparation?severity=${severity}` : '/alerts/preparation'),
  getSustainabilityAlerts: (severity?: string) => 
    fetchAPI<SustainabilityAlert[]>(severity ? `/alerts/sustainability?severity=${severity}` : '/alerts/sustainability'),

  // ESG
  getESGMetrics: () => fetchAPI<ESGMetrics>('/esg'),

  // Festivals
  getUpcomingFestivals: () => fetchAPI<Festival[]>('/festivals'),
};

export default api;
