'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
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
  image_url_4?: string;
  image_url_5?: string;
  description?: string;
  is_flash_sale?: boolean;
  is_sponsored?: boolean;
  is_featured?: boolean;
  is_available?: boolean;
  slug: string;
  views_count?: number;
  whatsapp?: string;
  phone?: string;
  vendor_name?: string;
}

const NIGERIAN_STATES = [
  'All 36 States', 'Lagos', 'FCT Abuja', 'Rivers', 'Oyo', 'Kano', 'Edo', 'Delta', 'Anambra', 'Ogun', 'Kaduna',
  'Abia', 'Adamawa', 'Akwa Ibom', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Ebonyi', 'Ekiti',
  'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Niger',
  'Ondo', 'Osun', 'Plateau', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const ALL_CATEGORIES = [
  'All Categories',
  'Phones & Tablets',
  'Computers & Laptops',
  'Electronics & Appliances',
  'Fashion & Apparel',
  'Sneakers & Footwear',
  'Beauty & Personal Care',
  'Home & Furniture',
  'Vehicles & Auto',
  'Property & Real Estate',
  'Food, Groceries & Drinks',
  'Services & Jobs'
];

function HomeContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  // URL Query Parameters for direct links
  const sharedProductId = searchParams.get('product');
  const sharedVendorName = searchParams.get('vendor');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All 36 States');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Make an Offer Modal State
  const [activeOfferProduct, setActiveOfferProduct] = useState<Product | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerName, setOfferName] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [supabase]);

  const isTruthy = (val: any) => 
    val === true || val === 'true' || val === 1 || val === '1' || val === 't' || val === 'yes';

  const sponsoredProducts = products.filter(p => isTruthy(p.is_sponsored) || isTruthy(p.is_featured));
  const flashSaleProducts = products.filter(p => isTruthy(p.is_flash_sale));

  // Dynamic Marketplace Filtering (Handles direct Shared Links as well!)
  const filteredMarketplace = products.filter(p => {
    if (sharedProductId) {
      return p.id === sharedProductId;
    }
    if (sharedVendorName) {
      return p.vendor_name?.toLowerCase() === sharedVendorName.toLowerCase();
    }
    const matchesState = selectedState === 'All 36 States' || p.location === selectedState;
    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesCategory && matchesSearch;
  });

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOfferProduct || !offerPrice) return;
    const phone = activeOfferProduct.whatsapp || activeOfferProduct.phone || '2348012345678';
    const message = `Hello, I'm ${offerName || 'a buyer'}. I want to make an offer of ₦${Number(offerPrice).toLocaleString()} for your item: ${activeOfferProduct.title} (Listed at ₦${Number(activeOfferProduct.price).toLocaleString()}) on goMarket NG.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    setActiveOfferProduct(null);
    setOfferPrice('');
    setOfferName('');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-bold">Loading goMarket...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-24 flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              <div>
                <h1 className="text-base font-black tracking-tight">goMarket <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">NG</span></h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">36 States Direct Commerce</p>
              </div>
            </Link>

            <div className="flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search products, phones, cars, shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 px-4 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <Link href="/register" className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center shadow-md">
              Vendor Portal 🚀
            </Link>
          </div>
        </header>

        {/* Hero Banner or Shared Vendor Storefront Banner */}
        {sharedVendorName ? (
          <section className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white py-12 px-4 text-center border-b border-slate-800">
            <div className="max-w-4xl mx-auto space-y-3">
              <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                🏪 Verified Merchant Mini-Storefront
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{sharedVendorName}</h2>
              <p className="text-slate-300 text-xs font-medium">Browse all verified items offered directly by {sharedVendorName}.</p>
              <div className="pt-2">
                <Link href="/" className="inline-block bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black border border-slate-700 hover:bg-slate-700">
                  ← Back to Full Marketplace
                </Link>
              </div>
            </div>
          </section>
        ) : sharedProductId ? (
          <section className="bg-slate-900 text-white py-8 px-4 text-center border-b border-slate-800">
            <div className="max-w-4xl mx-auto space-y-2">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                🎯 Direct Shared Listing
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Viewing Shared Item</h2>
              <Link href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black mt-2">
                View All Marketplace Items 🏠
              </Link>
            </div>
          </section>
        ) : (
          <section className="bg-slate-900 text-white py-12 px-4 text-center border-b border-slate-800">
            <div className="max-w-4xl mx-auto space-y-3">
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/30">
                Direct Merchant Marketplace Across Nigeria
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Buy & Sell Directly With Verified Vendors</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">Zero middleman fees. Direct WhatsApp & phone contact with sellers in all 36 states.</p>
            </div>

            <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Filter State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full h-11 bg-slate-800 border border-slate-700 text-white px-3 rounded-xl text-xs font-bold"
                >
                  {NIGERIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Filter Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-11 bg-slate-800 border border-slate-700 text-white px-3 rounded-xl text-xs font-bold"
                >
                  {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </section>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

          {/* Sponsored Deals Section (Shown when browsing general feed) */}
          {!sharedProductId && !sharedVendorName && sponsoredProducts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 border-slate-200">
                <span className="text-lg">🏆</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">Sponsored Deals & Featured Listings</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sponsoredProducts.map(product => {
                  const whatsappMsg = `Hello! I saw your sponsored listing "${product.title}" priced at ₦${Number(product.price).toLocaleString()} in ${product.location} on goMarket NG. Is it still available?`;
                  return (
                    <div key={product.id} className="bg-white border-2 border-amber-300 rounded-3xl p-3 shadow-xs hover:shadow-md transition space-y-3 relative flex flex-col justify-between">
                      <div className="absolute top-5 left-5 z-10 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded shadow">
                        ⭐ SPONSORED
                      </div>
                      <div className="w-full h-44 bg-slate-100 rounded-2xl overflow-hidden border">
                        <img src={product.image_url_1} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{product.location} • {product.category}</div>
                        <h4 className="font-black text-xs text-slate-900 line-clamp-1">{product.title}</h4>
                        <div className="text-sm font-black text-[#0066FF]">₦{Number(product.price).toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                        <a
                          href={`https://wa.me/${product.whatsapp || product.phone || '2348012345678'}?text=${encodeURIComponent(whatsappMsg)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black flex items-center justify-center shadow-xs"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`tel:${product.phone || product.whatsapp || '2348012345678'}`}
                          className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[9px] font-black flex items-center justify-center shadow-xs"
                        >
                          Call 📞
                        </a>
                        <button
                          onClick={() => setActiveOfferProduct(product)}
                          className="h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[9px] font-black flex items-center justify-center border border-blue-200"
                        >
                          Offer 🤝
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Flash Deals Section */}
          {!sharedProductId && !sharedVendorName && flashSaleProducts.length > 0 && (
            <section className="space-y-4 bg-gradient-to-br from-red-600 to-rose-700 p-6 sm:p-8 rounded-3xl shadow-lg border border-red-500">
              <div className="flex items-center gap-2 border-b pb-3 border-red-500/50 text-white">
                <span className="text-2xl">⚡</span>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">24-Hour Flash Deals & Explosive Discounts</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {flashSaleProducts.map(product => {
                  const whatsappMsg = `Hello! I saw your flash deal "${product.title}" priced at ₦${Number(product.price).toLocaleString()} in ${product.location} on goMarket NG. Is it still available?`;
                  return (
                    <div key={product.id} className="bg-white border-2 border-red-300 rounded-3xl p-3 shadow-md hover:shadow-xl transition space-y-3 relative flex flex-col justify-between">
                      <div className="absolute top-5 left-5 z-10 bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md animate-pulse">
                        ⚡ FLASH DEAL
                      </div>
                      <div className="w-full h-44 bg-slate-100 rounded-2xl overflow-hidden border">
                        <img src={product.image_url_1} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{product.location} • {product.category}</div>
                        <h4 className="font-black text-xs text-slate-900 line-clamp-1">{product.title}</h4>
                        <div className="text-sm font-black text-red-600">₦{Number(product.price).toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                        <a
                          href={`https://wa.me/${product.whatsapp || product.phone || '2348012345678'}?text=${encodeURIComponent(whatsappMsg)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black flex items-center justify-center shadow-xs"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`tel:${product.phone || product.whatsapp || '2348012345678'}`}
                          className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[9px] font-black flex items-center justify-center shadow-xs"
                        >
                          Call 📞
                        </a>
                        <button
                          onClick={() => setActiveOfferProduct(product)}
                          className="h-9 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-[9px] font-black flex items-center justify-center border border-red-200"
                        >
                          Offer 🤝
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Marketplace Listings Feed */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                {sharedVendorName ? `Listings by ${sharedVendorName} (${filteredMarketplace.length})` : sharedProductId ? 'Direct Product View' : `Marketplace Listings (${filteredMarketplace.length})`}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMarketplace.map(product => {
                const whatsappMsg = `Hello! I'm interested in your listing "${product.title}" priced at ₦${Number(product.price).toLocaleString()} in ${product.location} on goMarket NG. Is it still available?`;
                const imagesList = [product.image_url_1, product.image_url_2, product.image_url_3, product.image_url_4, product.image_url_5].filter(Boolean);

                return (
                  <div key={product.id} className={`bg-white rounded-3xl p-3 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between border ${sharedProductId === product.id ? 'border-4 border-blue-600 ring-4 ring-blue-100' : 'border-slate-200'}`}>
                    <div className="w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border relative">
                      <img src={product.image_url_1} alt={product.title} className="w-full h-full object-cover" />
                      {imagesList.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full backdrop-blur-xs">
                          📷 1/{imagesList.length} Photos
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">📍 {product.location} • 🏷️ {product.category}</div>
                      <h4 className="font-black text-xs text-slate-900 line-clamp-1">{product.title}</h4>
                      <div className="text-xs font-bold text-slate-500">🏪 {product.vendor_name || 'Verified Vendor'}</div>
                      <div className="text-sm font-black text-[#0066FF]">₦{Number(product.price).toLocaleString()}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                      <a
                        href={`https://wa.me/${product.whatsapp || product.phone || '2348012345678'}?text=${encodeURIComponent(whatsappMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black flex items-center justify-center shadow-xs"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${product.phone || product.whatsapp || '2348012345678'}`}
                        className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[9px] font-black flex items-center justify-center shadow-xs"
                      >
                        Call 📞
                      </a>
                      <button
                        onClick={() => setActiveOfferProduct(product)}
                        className="h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[9px] font-black flex items-center justify-center border border-blue-200"
                      >
                        Offer 🤝
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredMarketplace.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-400 text-xs font-bold">
                  No products matched this link or filter. <Link href="/" className="text-blue-600 underline">View all listings</Link>
                </div>
              )}
            </div>
          </section>

        </main>
      </div>

      {/* Comprehensive Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20 pt-16 pb-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <span className="text-2xl">🛒</span>
              <span className="font-black text-sm">goMarket NG</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Nigeria's premier direct merchant marketplace. Connecting buyers directly with verified vendors across all 36 states with zero middleman commissions.
            </p>
            <div className="pt-2">
              <Link href="/register" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2 rounded-xl text-[10px] shadow">
                Become a Vendor 🚀
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-black uppercase tracking-wider text-[11px]">About Us</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="info#about" className="hover:text-white transition">About goMarket</Link></li>
              <li><Link href="info#careers" className="hover:text-white transition">We are hiring! 💼</Link></li>
              <li><Link href="info#terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="info#privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-black uppercase tracking-wider text-[11px]">Support</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="mailto:support@gomarket.ng" className="hover:text-white transition font-bold text-blue-400">support@gomarket.ng</a></li>
              <li><Link href="info#safety" className="hover:text-white transition">Safety Tips 🛡️</Link></li>
              <li><Link href="info#contact" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-black uppercase tracking-wider text-[11px]">Our Resources</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">goMarket on Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Our Instagram</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-black uppercase tracking-wider text-[11px]">Hot Links</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/" className="hover:text-white transition">Top Deals & Flash Sales</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Post Free Listing</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-white transition text-amber-400 font-bold">Admin Command Center 🛡️</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-center text-[10px] text-slate-500 font-bold gap-4">
          <div>&copy; {new Date().getFullYear()} goMarket Nigeria. All rights reserved. Direct peer-to-peer commerce.</div>
        </div>
      </footer>

      {activeOfferProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">Make an Offer 🤝</h3>
              <button onClick={() => setActiveOfferProduct(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">✕ Close</button>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border">
              <img src={activeOfferProduct.image_url_1} alt={activeOfferProduct.title} className="w-12 h-12 object-cover rounded-xl border" />
              <div>
                <h4 className="font-black text-xs line-clamp-1">{activeOfferProduct.title}</h4>
                <div className="text-xs font-black text-[#0066FF]">Listed at ₦{Number(activeOfferProduct.price).toLocaleString()}</div>
              </div>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Your Name / Buyer Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Your Proposed Price (₦)</label>
                <input
                  type="number"
                  placeholder="Enter amount you want to pay"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-bold text-blue-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md text-xs flex items-center justify-center gap-2"
              >
                Send Offer via WhatsApp 💬
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-bold">Loading marketplace...</div>}>
      <HomeContent />
    </Suspense>
  );
}
