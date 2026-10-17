'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price_kobo: number;
  image_url?: string;
  clicks?: number;
  slug?: string;
}

export default function VendorDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendorData() {
      try {
        const { data } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendorData();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  function handleCopyLink(product: Product) {
    const productUrl = `${window.location.origin}/item/${product.slug || product.id}`;
    navigator.clipboard.writeText(productUrl);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-bold text-slate-500">
        Loading Store Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex items-center justify-between shadow-xs">
        <h1 className="text-base font-black tracking-tight text-[#0066FF]">goMarket</h1>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center"
          >
            View Marketplace ↗
          </a>
          <button
            onClick={handleLogout}
            className="h-9 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Ella's Boutique</h2>
            <p className="text-xs text-slate-500">
              Store URL: <span className="text-[#0066FF] font-medium">/s/ella-s-boutique-0336</span>
            </p>
          </div>
          <button
            onClick={() => alert('Add New Product modal coming soon!')}
            className="h-10 px-4 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
          >
            + Add New Product
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-700 tracking-wider">Your Products</h3>
            <span className="text-xs font-bold text-slate-500">{products.length} items</span>
          </div>

          <div className="space-y-3">
            {products.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 hover:border-[#0066FF] p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                    <img
                      src={item.image_url || `https://picsum.photos/seed/${item.id}/300/300`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    <p className="text-sm font-black text-[#0066FF]">
                      ₦{(item.price_kobo / 100).toLocaleString('en-NG')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    👁️ {item.clicks || 0} clicks
                  </span>
                  <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg">
                    AVAILABLE
                  </span>
                  <button
                    onClick={() => alert(`Edit item: ${item.title}`)}
                    className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Edit ✏️
                  </button>
                  <button
                    onClick={() => handleCopyLink(item)}
                    className={`h-9 px-3 text-xs font-bold rounded-xl transition-all ${
                      copiedId === item.id
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {copiedId === item.id ? '✓ Copied!' : 'Copy Link 🔗'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
