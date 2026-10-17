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
  status?: string;
}

export default function VendorDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const storeName = "Ella's Boutique";
  const storeSlug = "/s/ella-s-boutique-0336";

  useEffect(() => {
    fetchVendorData();
  }, []);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  function handleCopyLink(product: Product) {
    const targetPath = product.slug ? `/item/${product.slug}` : `/item/${product.id}`;
    const productUrl = `${window.location.origin}${targetPath}`;
    
    navigator.clipboard.writeText(productUrl);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getProductImage(item: Product) {
    if (item.image_url && item.image_url.trim().length > 5) {
      return item.image_url;
    }
    return `https://picsum.photos/seed/${item.id}/300/300`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-bold text-slate-500">
        Loading Seller Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex items-center justify-between shadow-xs">
        <h1 className="text-base font-black tracking-tight text-[#0066FF]">
          goMarket
        </h1>
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

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Store Profile Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase bg-blue-50 text-[#0066FF] px-2 py-0.5 rounded">
              Verified Store
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">{storeName}</h2>
            <p className="text-xs text-slate-500">
              Store URL: <span className="text-[#0066FF] font-medium">{storeSlug}</span>
            </p>
          </div>

          <button
            onClick={() => alert('Add product modal coming up!')}
            className="h-10 px-4 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            + Add New Product
          </button>
        </div>

        {/* Products Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              YOUR PRODUCTS ({products.length} ITEMS)
            </h3>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-2 shadow-xs">
              <p className="text-xs text-slate-500">No products listed in your store yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 hover:border-[#0066FF] p-2.5 rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1.5">
                    <div className="relative w-full h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                      <img
                        src={getProductImage(item)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 right-1.5 text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                        ACTIVE
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs font-black text-[#0066FF] mt-0.5">
                        ₦{(item.price_kobo / 100).toLocaleString('en-NG')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>👁️ {item.clicks || 0}</span>
                      <button
                        onClick={() => alert(`Edit ${item.title}`)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        Edit ✏️
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyLink(item)}
                      className={`w-full h-7 text-[10px] font-bold rounded-md transition-all flex items-center justify-center ${
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
          )}
        </div>
      </main>
    </div>
  );
}
