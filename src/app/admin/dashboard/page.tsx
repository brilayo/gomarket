'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('featured');
  const [featuredSlots, setFeaturedSlots] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('admin_featured_slots').select('*');
      if (data) setFeaturedSlots(data);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <header className="bg-slate-950 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-lg">👑</span>
          <h1 className="text-xs font-black tracking-wider uppercase font-mono">
            goMarket Enterprise Command Center
          </h1>
        </div>
        <a href="/" target="_blank" className="h-8 px-3 bg-slate-800 text-white text-[11px] font-bold rounded-lg flex items-center">
          ← Back to Marketplace
        </a>
      </header>

      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex gap-2 overflow-x-auto text-xs font-bold text-slate-600">
        <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950">⭐ Featured Slots ({featuredSlots.length}/5)</button>
        <button className="px-3 py-1.5 rounded-lg hover:bg-slate-200">📢 Ad Banners (2)</button>
        <button className="px-3 py-1.5 rounded-lg hover:bg-slate-200">📻 Ticker & Notice (1)</button>
        <button className="px-3 py-1.5 rounded-lg hover:bg-slate-200">🛡️ Fraud Detection</button>
      </div>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center">
          <h3 className="text-sm font-bold text-slate-800">Admin Command Center Restored</h3>
          <p className="text-xs text-slate-500 mt-1">Ready for full ad management and seller tools.</p>
        </div>
      </main>
    </div>
  );
}
