'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  image_url_1: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  image_url_5?: string;
  description?: string;
  is_available?: boolean;
  vendor_name?: string;
  seller_name?: string;
  whatsapp?: string;
  phone?: string;
  views_count?: number;
}

export default function VendorStorePage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const supabase = createClient();
  const rawVendorName = decodeURIComponent(resolvedParams?.name || '').trim();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'low' | 'high'>('newest');

  // Offer Modal State
  const [activeOfferProduct, setActiveOfferProduct] = useState<Product | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerName, setOfferName] = useState('');

  // Bulk Inquiry Modal State
  const [activeBulkProduct, setActiveBulkProduct] = useState<Product | null>(null);
  const [bulkQuantity, setBulkQuantity] = useState('5');
  const [bulkNotes, setBulkNotes] = useState('');

  // Quick View Multi-Photo Modal
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string>('');

  // QR Code Modal State
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    async function fetchVendorStore() {
      if (!rawVendorName) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const target = rawVendorName.toLowerCase();
        const matched = data.filter((p: Product) => {
          const vName = (p.vendor_name || p.seller_name || '').toLowerCase().trim();
          return vName === target || vName.includes(target) || target.includes(vName);
        });
        setProducts(matched);
      }
      setLoading(false);
    }

    fetchVendorStore();
  }, [supabase, rawVendorName]);

  // Handle Standard Offer
  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOfferProduct || !offerPrice) return;
    const phone = activeOfferProduct.whatsapp || activeOfferProduct.phone || '2348012345678';
    const message = `Hello, I'm ${offerName || 'a buyer'}. I want to make an offer of ₦${Number(offerPrice).toLocaleString()} for your item: "${activeOfferProduct.title}" (Listed at ₦${Number(activeOfferProduct.price).toLocaleString()}) on goMarket NG.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    setActiveOfferProduct(null);
    setOfferPrice('');
    setOfferName('');
  };

  // Handle Bulk / Reseller Inquiry
  const handleSendBulkInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBulkProduct) return;
    const phone = activeBulkProduct.whatsapp || activeBulkProduct.phone || '2348012345678';
    const message = `Hello ${rawVendorName}, I am interested in purchasing ${bulkQuantity} units / bulk order for: "${activeBulkProduct.title}" listed on goMarket NG. ${bulkNotes ? `Notes: \${bulkNotes}` : ''}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    setActiveBulkProduct(null);
    setBulkQuantity('5');
    setBulkNotes('');
  };

  // Handle Restock Request
  const handleRequestRestock = (product: Product) => {
    const phone = product.whatsapp || product.phone || '2348012345678';
    const message = `Hello ${rawVendorName}, I noticed that "${product.title}" is currently marked as Sold Out on goMarket NG. Please notify me when you restock!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Download Contact vCard
  const downloadVCard = () => {
    const firstProduct = products[0];
    const phoneNum = firstProduct?.phone || firstProduct?.whatsapp || '+2348012345678';
    const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:${rawVendorName} (goMarket Vendor)
ORG:goMarket NG Verified Merchant
TEL;TYPE=CELL:${phoneNum}
NOTE:Verified seller on goMarket NG Marketplace
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rawVendorName.replace(/\s+/g, '_')}_Contact.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openQuickPreview = (p: Product) => {
    setPreviewProduct(p);
    setActivePreviewImage(p.image_url_1);
  };

  // Filter & Sort Logic
  const filteredProducts = products
    .filter(p => {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'low') return a.price - b.price;
      if (sortBy === 'high') return b.price - a.price;
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs font-bold tracking-wider">Loading Verified Storefront...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col justify-between">
      <div>
        {/* Header Navigation */}
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              <div>
                <h1 className="text-base font-black tracking-tight">goMarket <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">NG</span></h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Verified Merchant Store</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadVCard}
                className="h-10 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-1"
              >
                📇 Save Contact
              </button>
              <Link href="/" className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center border border-slate-700 transition">
                ← Marketplace
              </Link>
            </div>
          </div>
        </header>

        {/* Storefront Notice Bar */}
        <div className="bg-blue-600 text-white text-[11px] font-bold py-2.5 px-4 text-center border-b border-blue-700 flex items-center justify-center gap-2">
          <span>📢 <strong>Merchant Notice:</strong> Walk-in physical inspection & same-day waybill delivery available across Nigeria!</span>
        </div>

        {/* Premium Store Hero Banner */}
        <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white py-14 px-4 border-b border-slate-800 shadow-xl relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
            
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Verified Storefront • Live Inventory Active
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">{rawVendorName}</h2>
            
            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl mx-auto leading-relaxed">
              Explore listings directly from <strong className="text-white">{rawVendorName}</strong>. Zero middleman fees, direct peer-to-peer verification, and instant WhatsApp response.
            </p>

            {/* Merchant Identity Stats & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-slate-300 pt-3">
              <span className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-xs">📦 {products.length} Active Listings</span>
              <span className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-xs">⚡ Avg Reply: &lt; 5 Mins</span>
              <span className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-xs">⭐ 4.9/5 Customer Trust</span>
              <button
                onClick={() => setShowQRModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl font-black transition shadow-xs flex items-center gap-1"
              >
                🔲 Store QR Code
              </button>
            </div>
          </div>
        </section>

        {/* Store Control & Search Bar */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full sm:w-2/3">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder={`Search inside ${rawVendorName}'s store (e.g. iPhone, Laptop, Lagos)...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="h-11 bg-slate-50 border border-slate-200 rounded-2xl px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="newest">Newest First 🆕</option>
                <option value="low">Price: Low to High 📉</option>
                <option value="high">Price: High to Low 📈</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-b pb-3 border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Merchant Inventory ({filteredProducts.length})
            </h3>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map(product => {
              const whatsappMsg = `Hello! I'm interested in your listing "${product.title}" priced at ₦${Number(product.price).toLocaleString()} in ${product.location} on goMarket NG. Is it still available?`;
              const isAvailable = product.is_available !== false;
              const phoneNum = product.whatsapp || product.phone || '2348012345678';
              const productImages = [product.image_url_1, product.image_url_2, product.image_url_3, product.image_url_4, product.image_url_5].filter(Boolean);

              return (
                <div key={product.id} className="bg-white border border-slate-200 rounded-3xl p-3.5 shadow-xs hover:shadow-md transition duration-200 space-y-3 flex flex-col justify-between group">
                  <div className="w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border relative">
                    <img
                      src={product.image_url_1}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center flex-col gap-2 p-2">
                        <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full">SOLD OUT ❌</span>
                        <button
                          onClick={() => handleRequestRestock(product)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow transition"
                        >
                          Notify Me When Restocked 🔔
                        </button>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase">
                      📍 {product.location}
                    </div>

                    <button
                      onClick={() => openQuickPreview(product)}
                      className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow"
                    >
                      📸 {productImages.length} {productImages.length > 1 ? 'Photos' : 'Photo'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">🏷️ {product.category}</div>
                    <Link href={`/product/${product.id}`} className="font-black text-xs text-slate-900 line-clamp-2 hover:text-blue-600 hover:underline leading-snug">
                      {product.title}
                    </Link>
                    <div className="text-base font-black text-[#0066FF]">₦{Number(product.price).toLocaleString()}</div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-1.5">
                      <a
                        href={`https://wa.me/${phoneNum}?text=${encodeURIComponent(whatsappMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black flex items-center justify-center shadow-xs transition"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${phoneNum}`}
                        className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[9px] font-black flex items-center justify-center shadow-xs transition"
                      >
                        Call 📞
                      </a>
                      <button
                        onClick={() => setActiveOfferProduct(product)}
                        className="h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[9px] font-black flex items-center justify-center border border-blue-200 transition"
                      >
                        Offer 🤝
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveBulkProduct(product)}
                      className="w-full h-8 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-[9px] font-black flex items-center justify-center border border-purple-200 transition"
                    >
                      Reseller / Bulk Inquiry 📦
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400 text-xs font-bold space-y-3">
                <p>No listings match your search criteria.</p>
                <button onClick={() => setSearchQuery('')} className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow">
                  Reset Filter 🔄
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Homepage Footer */}
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
              <Link href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2 rounded-xl text-[10px] shadow">
                Become a Vendor 🚀
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-black uppercase tracking-wider text-[11px]">About Us</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="#" className="hover:text-white transition">About goMarket</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">We are hiring! 💼</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-black uppercase tracking-wider text-[11px]">Support</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="mailto:support@gomarket.ng" className="hover:text-white transition font-bold text-blue-400">support@gomarket.ng</a></li>
              <li><Link href="#" className="hover:text-white transition">Safety Tips 🛡️</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact Us</Link></li>
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

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase">Scan Storefront QR 🔲</h3>
              <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">✕ Close</button>
            </div>
            <div className="bg-slate-100 p-6 rounded-2xl inline-block border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                alt="Storefront QR Code"
                className="w-44 h-44 mx-auto rounded-xl"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-bold">Scan with any smartphone camera to view <strong>{rawVendorName}</strong>'s storefront on goMarket NG.</p>
          </div>
        </div>
      )}

      {/* Bulk Inquiry Modal */}
      {activeBulkProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-purple-900 uppercase">Bulk / Wholesale Inquiry 📦</h3>
              <button onClick={() => setActiveBulkProduct(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">✕ Close</button>
            </div>

            <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-2xl border border-purple-100">
              <img src={activeBulkProduct.image_url_1} alt={activeBulkProduct.title} className="w-12 h-12 object-cover rounded-xl border" />
              <div>
                <h4 className="font-black text-xs line-clamp-1">{activeBulkProduct.title}</h4>
                <div className="text-xs font-black text-purple-700">₦{Number(activeBulkProduct.price).toLocaleString()} / unit</div>
              </div>
            </div>

            <form onSubmit={handleSendBulkInquiry} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Target Quantity Needed</label>
                <input
                  type="number"
                  min="2"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl text-purple-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Specific Requirements (Optional)</label>
                <textarea
                  placeholder="e.g., Requesting wholesale pricing for 10 units with Lagos Island delivery..."
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border p-3 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-md"
              >
                Send Bulk Inquiry via WhatsApp 💬
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Multi-Photo Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Store Photo Inspection: {previewProduct.title}</h3>
              <button onClick={() => setPreviewProduct(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">✕ Close</button>
            </div>

            <div className="space-y-4">
              <div className="w-full h-80 bg-slate-100 rounded-2xl overflow-hidden border">
                <img src={activePreviewImage || previewProduct.image_url_1} alt={previewProduct.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {[previewProduct.image_url_1, previewProduct.image_url_2, previewProduct.image_url_3, previewProduct.image_url_4, previewProduct.image_url_5]
                  .filter(Boolean)
                  .map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePreviewImage(img!)}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition ${activePreviewImage === img ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-70'}`}
                    >
                      <img src={img!} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <div className="text-sm font-black text-[#0066FF]">₦{Number(previewProduct.price).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-bold">📍 {previewProduct.location} State</div>
                </div>
                <Link
                  href={`/product/${previewProduct.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow"
                >
                  View Product Page ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
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
                <div className="text-xs font-black text-[#0066FF]">₦{Number(activeOfferProduct.price).toLocaleString()}</div>
              </div>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Proposed Price (₦)</label>
                <input
                  type="number"
                  placeholder="Offer amount"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl text-blue-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md"
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
