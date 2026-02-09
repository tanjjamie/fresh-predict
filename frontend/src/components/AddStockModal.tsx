'use client';

import { useState, useEffect } from 'react';
import { BoxIcon, BrainIcon, WarningIcon } from './Icons';

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
  shelf_life_days: number;
  default_supplier: string;
  suggested_expiry: string;
}

interface AIInsight {
  recommendation: string;
  demand_forecast: number;
  festival_warning: string | null;
  suggested_quantity: number;
  risk_level: 'low' | 'medium' | 'high';
  current_stock: number;
  coverage_days: number;
  daily_demand: number;
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockModal({ isOpen, onClose, onSuccess }: AddStockModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  
  // AI Insight
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Fetch suppliers when product changes
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        setExpiryDate(product.suggested_expiry);
        setSupplier(product.default_supplier);
        fetchSuppliers(product.category);
      }
    }
  }, [selectedProduct, products]);

  // Fetch AI insight when quantity changes
  useEffect(() => {
    const doFetchInsight = async () => {
      setLoadingInsight(true);
      try {
        const response = await fetch(
          `http://localhost:8000/inventory/insight/${selectedProduct}?quantity=${quantity}`
        );
        if (response.ok) {
          const data = await response.json();
          setInsight(data);
        }
      } catch (error) {
        console.error('Failed to fetch insight:', error);
      } finally {
        setLoadingInsight(false);
      }
    };

    if (selectedProduct && quantity > 0) {
      const timeoutId = setTimeout(() => {
        doFetchInsight();
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      setInsight(null);
    }
  }, [selectedProduct, quantity]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchSuppliers = async (category: string) => {
    try {
      const response = await fetch(`http://localhost:8000/suppliers/${category}`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct,
          quantity: quantity,
          expiry_date: expiryDate,
          supplier: supplier,
        }),
      });

      if (response.ok) {
        onSuccess();
        handleClose();
      } else {
        alert('Failed to add stock');
      }
    } catch (error) {
      console.error('Failed to add stock:', error);
      alert('Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProduct('');
    setQuantity(0);
    setExpiryDate('');
    setSupplier('');
    setInsight(null);
    onClose();
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
          <div className="flex items-center gap-3">
            <BoxIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Add New Stock</h2>
              <p className="text-slate-300 text-xs">Record incoming inventory from supplier</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              required
            >
              <option value="">Select a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.category})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity {selectedProductData && `(${selectedProductData.unit})`}
            </label>
            <input
              type="number"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              placeholder="Enter quantity"
              min="1"
              required
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {selectedProductData && (
              <p className="text-xs text-slate-500 mt-1">
                Typical shelf life: {selectedProductData.shelf_life_days} days
              </p>
            )}
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              required
            >
              <option value="">Select supplier...</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* AI Insight Box */}
          {(insight || loadingInsight) && (
            <div
              className={`p-4 rounded-xl border ${
                insight?.risk_level === 'high'
                  ? 'bg-rose-50 border-rose-200'
                  : insight?.risk_level === 'medium'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight?.risk_level === 'high'
                    ? 'bg-rose-500'
                    : insight?.risk_level === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                } text-white`}>
                  <BrainIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${
                    insight?.risk_level === 'high'
                      ? 'text-rose-800'
                      : insight?.risk_level === 'medium'
                      ? 'text-amber-800'
                      : 'text-emerald-800'
                  }`}>
                    AI Insight
                  </h4>
                  {loadingInsight ? (
                    <p className="text-sm text-slate-500 animate-pulse">Analyzing...</p>
                  ) : insight ? (
                    <>
                      <p className={`text-sm mt-1 ${
                        insight.risk_level === 'high'
                          ? 'text-rose-700'
                          : insight.risk_level === 'medium'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}>
                        {insight.recommendation}
                      </p>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <p className="text-slate-500">Current Stock</p>
                          <p className="font-bold text-slate-700">{insight.current_stock}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <p className="text-slate-500">14-Day Demand</p>
                          <p className="font-bold text-slate-700">{insight.demand_forecast}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <p className="text-slate-500">Suggested</p>
                          <p className="font-bold text-slate-700">{insight.suggested_quantity}</p>
                        </div>
                      </div>
                      {insight.festival_warning && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-2 py-1">
                          <WarningIcon className="w-3 h-3" />
                          {insight.festival_warning}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedProduct || !quantity || !expiryDate}
              className="flex-1 px-4 py-2.5 bg-emerald-500 rounded-xl text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
