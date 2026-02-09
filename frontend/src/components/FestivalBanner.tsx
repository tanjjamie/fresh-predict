'use client';

import { useEffect, useState } from 'react';
import type { Festival } from '@/lib/api';
import { GiftIcon, MoonIcon, LampIcon, StarIcon, BrainIcon } from './Icons';

export default function FestivalBanner() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch('http://localhost:8000/festivals');
        if (!response.ok) throw new Error('Failed to fetch festivals');
        const data = await response.json();
        setFestivals(data.slice(0, 2)); // Show next 2 festivals
      } catch (err) {
        console.error('Festival fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, []);

  if (loading || festivals.length === 0) return null;

  const nextFestival = festivals[0];
  const isUrgent = nextFestival.days_until <= 14;

  return (
    <div
      className={`p-4 rounded-2xl border ${
        isUrgent
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
          : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            {nextFestival.name.includes('Chinese') && <GiftIcon className="w-8 h-8 text-red-500" />}
            {nextFestival.name.includes('Raya') && <MoonIcon className="w-8 h-8 text-emerald-600" />}
            {nextFestival.name.includes('Deepavali') && <LampIcon className="w-8 h-8 text-amber-500" />}
            {nextFestival.name.includes('Christmas') && <StarIcon className="w-8 h-8 text-green-600" />}
          </span>
          <div>
            <h3 className="font-bold text-slate-800">{nextFestival.name}</h3>
            <p className="text-sm text-slate-600">
              {nextFestival.days_until === 0
                ? 'Today!'
                : nextFestival.days_until === 1
                ? 'Tomorrow'
                : `In ${nextFestival.days_until} days`}{' '}
              • {new Date(nextFestival.date).toLocaleDateString('en-MY', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2">
            {isUrgent && (
              <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
                Prepare Now
              </span>
            )}
            <div>
              <p className="text-xs text-slate-500">Expected demand</p>
              <p className="text-lg font-bold text-slate-800">
                {nextFestival.demand_multiplier}x normal
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Impact: {nextFestival.impact_categories.join(', ')}
          </p>
        </div>
      </div>

      {isUrgent && (
        <div className="mt-3 pt-3 border-t border-amber-200/50">
          <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
            <BrainIcon className="w-3 h-3" /> AI Recommendation: Stock up on {nextFestival.impact_categories.join(', ')} items for {nextFestival.name}. 
            Expected {((nextFestival.demand_multiplier - 1) * 100).toFixed(0)}% increase in demand.
          </p>
        </div>
      )}
    </div>
  );
}
