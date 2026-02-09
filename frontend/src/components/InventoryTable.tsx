'use client';

import { useEffect, useState } from 'react';
import type { InventoryItem } from '@/lib/api';
import { BoxIcon } from './Icons';

interface InventoryTableProps {
  items?: InventoryItem[];
  compact?: boolean;
}

const categoryColors = {
  poultry: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Poultry' },
  produce: { bg: 'bg-green-100', text: 'text-green-700', label: 'Produce' },
  dairy: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dairy' },
};

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getExpiryStatus(days: number): { color: string; label: string } {
  if (days <= 2) return { color: 'text-rose-600 bg-rose-50', label: 'Critical' };
  if (days <= 5) return { color: 'text-amber-600 bg-amber-50', label: 'Warning' };
  if (days <= 10) return { color: 'text-yellow-600 bg-yellow-50', label: 'Monitor' };
  return { color: 'text-emerald-600 bg-emerald-50', label: 'Good' };
}

function getStockStatus(current: number, reorder: number): { color: string; label: string } {
  const ratio = current / reorder;
  if (ratio <= 0.5) return { color: 'text-rose-600', label: 'Critical' };
  if (ratio <= 1) return { color: 'text-amber-600', label: 'Low' };
  if (ratio <= 2) return { color: 'text-emerald-600', label: 'Good' };
  return { color: 'text-blue-600', label: 'High' };
}

export default function InventoryTable({ items: propItems, compact = false }: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItem[]>(propItems || []);
  const [loading, setLoading] = useState(!propItems);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'stock' | 'name'>('expiry');

  useEffect(() => {
    if (propItems) {
      setItems(propItems);
      return;
    }

    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:8000/inventory');
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error('Inventory fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [propItems]);

  // Filter and sort items
  let displayItems = [...items];
  if (filter !== 'all') {
    displayItems = displayItems.filter((item) => item.category === filter);
  }

  displayItems.sort((a, b) => {
    if (sortBy === 'expiry') {
      return getDaysUntilExpiry(a.expiry_date) - getDaysUntilExpiry(b.expiry_date);
    }
    if (sortBy === 'stock') {
      return a.current_stock / a.reorder_point - b.current_stock / b.reorder_point;
    }
    return a.name.localeCompare(b.name);
  });

  if (compact) {
    displayItems = displayItems.slice(0, 5);
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-slate-200 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-slate-800 rounded-lg text-white"><BoxIcon className="w-4 h-4" /></span>
          <h3 className="text-slate-900 font-bold tracking-tight">Inventory Status</h3>
        </div>

        {!compact && (
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="poultry">Poultry</option>
              <option value="produce">Produce</option>
              <option value="dairy">Dairy</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'expiry' | 'stock' | 'name')}
              className="text-xs px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="expiry">Sort by Expiry</option>
              <option value="stock">Sort by Stock</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-100">
              <th className="text-left py-2 font-medium">Product</th>
              <th className="text-left py-2 font-medium">Category</th>
              <th className="text-right py-2 font-medium">Stock</th>
              <th className="text-right py-2 font-medium">Expiry</th>
              {!compact && <th className="text-right py-2 font-medium">Value (RM)</th>}
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item) => {
              const daysToExpiry = getDaysUntilExpiry(item.expiry_date);
              const expiryStatus = getExpiryStatus(daysToExpiry);
              const stockStatus = getStockStatus(item.current_stock, item.reorder_point);
              const category = categoryColors[item.category];

              return (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.id}</p>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${category.bg} ${category.text}`}>
                      {category.label}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <p className={`font-semibold text-sm ${stockStatus.color}`}>
                      {item.current_stock} {item.unit}
                    </p>
                    <p className="text-xs text-slate-400">Reorder: {item.reorder_point}</p>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${expiryStatus.color}`}>
                      {daysToExpiry <= 0 ? 'Expired' : `${daysToExpiry}d`}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{item.expiry_date}</p>
                  </td>
                  {!compact && (
                    <td className="py-3 text-right">
                      <p className="font-medium text-slate-700 text-sm">
                        {(item.current_stock * item.cost_per_unit).toFixed(2)}
                      </p>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {displayItems.length} of {items.length} items
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
              Critical: {items.filter((i) => getDaysUntilExpiry(i.expiry_date) <= 2).length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Warning: {items.filter((i) => {
                const days = getDaysUntilExpiry(i.expiry_date);
                return days > 2 && days <= 5;
              }).length}
            </span>
          </div>
        </div>
      )}

      {compact && items.length > 5 && (
        <button className="w-full mt-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 transition-colors">
          View all {items.length} items →
        </button>
      )}
    </div>
  );
}
