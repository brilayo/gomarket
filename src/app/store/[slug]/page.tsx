'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  currency: string;
  category: string;
  location: string;
  image_url_1: string;
  image_url_2?: string;
  image_url_3?: string;
  description?: string;
  is_flash_sale?: boolean;
  is_available?: boolean;
  vendor_name?: string;
  phone?: string;
  whatsapp?: string;
}

export default function VendorStorefrontPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('Vendor Store');
  const [storeLocation, setStoreLocation] = useState('Nigeria');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchStorefrontData() {
      setLoading(true);
      const cleanSlug = params.slug;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Filter items that match the store name / slug context
        const matched = data.filter((p) => {
          const formatted = (p.vendor_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return formatted === cleanSlug || p.vendor_name?.toLowerCase() === cleanSlug.replace(/-/g, ' ');
        });

        if (matched.length > 0) {
          setProducts(matched);
          setStoreName(matched[0].vendor_name || 'Verified Merchant');
          setStoreLocation(matched[0].location || 'Nigeria');
          setContactNumber(matched[0].whatsapp || matched[0].phone || '2348012345678');
        } else {
          setProducts(data.slice(0, 8)); // Fallback sample if exact slug match isn't found
        }
      }
      setLoading(false);
    }
    fetchStorefrontData();
  }, [params.slug, supabase]);

  const waNumber = contactNumber.replace(/[^0-9]/g, '') || '2348012345678';
  const mainWaLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello \${storeName}, I am contacting you from your goMarket official storefront!`)}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <div>
              <h1 className="text-sm font-black tracking-tight">goMarket <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">NG</span></h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Official Storefront Directory</p>
            </div>
          </Link>

          <Link href="/" className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black flex items-center gap-1 transition-all">
            ← Back to Marketplace
          </Link>
        </div>
      </header>

      {/* Store Banner & Bio */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl font-black border-2 border-white/20">
            🏪
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
            📍 {storeLocation} • Verified Merchant
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">{storeName}</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto">
            Welcome to our official goMarket store catalog. Browse our available inventory below and contact us directly for fast delivery.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <a
              href={mainWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <span>💬</span> Chat Store Owner
            </a>
            <a
              href={`tel:${contactNumber}`}
              className="h-11 px-6 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl text-xs flex items-center gap-2 transition-all border border-white/20"
            >
              <span>📞</span> Call Store
            </a>
          </div>
        </div>
      </section>

      {/* Inventory Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
            Store Products ({products.length})
          </h3>
          <span className="text-[10px] bg-blue-100 text-[#0066FF] font-black px-2.5 py-1 rounded-md uppercase">
            Direct Merchant Deals
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs font-bold text-slate-400">Loading store inventory...</div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-2">
            <span className="text-3xl">📦</span>
            <h4 className="text-sm font-black text-slate-900">No active products listed</h4>
            <p className="text-xs text-slate-400">This vendor currently has no public items uploaded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedProduct(item)}
              >
                <div className="space-y-2">
                  <div className="w-full h-44 bg-slate-100 rounded-2xl overflow-hidden relative">
                    {item.image_url_1 ? (
                      <img src={item.image_url_1} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                      📍 {item.location || storeLocation}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{item.category}</span>
                    <h4 className="font-black text-slate-900 text-xs line-clamp-1">{item.title}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-[#0066FF]">{item.currency || '₦'}{Number(item.price).toLocaleString()}</span>
                      {item.original_price && (
                        <span className="text-[10px] text-slate-400 line-through">₦{Number(item.original_price).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello \${storeName}, I saw your product "${item.title}" for ₦${Number(item.price).toLocaleString()} on your goMarket store page. Is it still available?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all"
                  >
                    💬 Chat
                  </a>
                  <a
                    href={`tel:${contactNumber}`}
                    className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all"
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20 pt-10 pb-8 text-center text-xs">
        <p>© {new Date().getFullYear()} {storeName} • Powered by goMarket Nigeria direct commerce platform.</p>
      </footer>

    </div>
  );
}
