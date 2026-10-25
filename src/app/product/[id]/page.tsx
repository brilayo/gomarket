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
  created_at?: string;
}

interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export default function SingleProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const supabase = createClient();
  const productId = resolvedParams?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerName, setOfferName] = useState('');

  // Rating & Review State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState<Review[]>([
    { name: 'Emeka O.', rating: 5, comment: 'Product in pristine condition. Direct smooth transaction in Lagos!', date: '2 days ago' },
    { name: 'Amina K.', rating: 5, comment: 'Quick response on WhatsApp and verified vendor. Highly recommended.', date: '1 week ago' }
  ]);

  useEffect(() => {
    async function fetchProductData() {
      if (!productId) return;

      // 1. Fetch current product
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!error && data) {
        setProduct(data);
        setSelectedImage(data.image_url_1);

        // Increment view count
        const updatedViews = (data.views_count || 0) + 1;
        await supabase
          .from('products')
          .update({ views_count: updatedViews })
          .eq('id', productId);

        // 2. Fetch all products to reliably match vendor inventory
        const targetVendor = (data.vendor_name || data.seller_name || '').toLowerCase().trim();
        
        const { data: allProducts } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (allProducts && targetVendor) {
          const matchedVendorItems = allProducts.filter((p: Product) => {
            if (p.id === productId) return false; // Exclude current product
            const pVendor = (p.vendor_name || p.seller_name || '').toLowerCase().trim();
            return pVendor === targetVendor || pVendor.includes(targetVendor) || targetVendor.includes(pVendor);
          });
          setVendorProducts(matchedVendorItems);
        }
      }
      setLoading(false);
    }

    fetchProductData();
  }, [supabase, productId]);

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !offerPrice) return;
    const phone = product.whatsapp || product.phone || '2348012345678';
    const message = `Hello, I'm ${offerName || 'a buyer'}. I want to make an offer of ₦${Number(offerPrice).toLocaleString()} for your item: "${product.title}" (Listed at ₦${Number(product.price).toLocaleString()}) on goMarket NG.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    setShowOfferModal(false);
    setOfferPrice('');
    setOfferName('');
  };

  const handleQuickDiscount = (percentage: number) => {
    if (!product) return;
    const discounted = Math.round(product.price * (1 - percentage / 100));
    setOfferPrice(String(discounted));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) return;

    const newRev: Review = {
      name: reviewerName,
      rating: userRating,
      comment: reviewComment,
      date: 'Just now'
    };

    setReviewsList([newRev, ...reviewsList]);
    setShowRatingModal(false);
    setReviewerName('');
    setReviewComment('');
    setUserRating(5);
    alert('Thank you for your rating! ⭐');
  };

  const reportListing = () => {
    const adminPhone = '2348012345678';
    const message = `Hello Admin, I am reporting an issue/suspicious activity regarding listing ID: ${product?.id} ("${product?.title}") on goMarket NG. Please investigate.`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const copyListingLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Product link copied to clipboard! 📋');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs font-bold tracking-wider">Loading Listing Details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-xs font-bold space-y-4">
        <p className="text-slate-300">Product not found or has been removed.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl font-black text-white shadow">
          Return to Marketplace 🏠
        </Link>
      </div>
    );
  }

  const imagesList = [product.image_url_1, product.image_url_2, product.image_url_3, product.image_url_4, product.image_url_5].filter(Boolean);
  const whatsappMsg = `Hello! I'm interested in your listing "${product.title}" priced at ₦${Number(product.price).toLocaleString()} in ${product.location} on goMarket NG. Is it still available?`;
  const isAvailable = product.is_available !== false;
  const vendorDisplayName = product.vendor_name || product.seller_name || 'Verified Vendor';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              <div>
                <h1 className="text-base font-black tracking-tight">goMarket <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">NG</span></h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Direct Product View</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={copyListingLink} className="h-10 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black border border-slate-700 transition">
                🔗 Share
              </button>
              <Link href="/" className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center border border-slate-700 transition">
                ← Marketplace
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Column: Image Gallery & Urgency / Safety */}
            <div className="space-y-4">
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="w-full h-96 sm:h-[420px] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs relative cursor-zoom-in group"
              >
                <img src={selectedImage || product.image_url_1} alt={product.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                
                {!isAvailable && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                    <span className="bg-slate-900 text-white text-sm font-black px-4 py-2 rounded-xl">SOLD OUT ❌</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  🔍 Click Fullscreen
                </div>

                {/* Dynamic Urgency / View Counter Badge */}
                <div className="absolute bottom-3 left-3 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-black px-3 py-1 rounded-lg shadow flex items-center gap-1.5">
                  <span className="animate-pulse">🔥</span>
                  <span>Popular Item! Viewed {product.views_count || 1} times today</span>
                </div>
              </div>

              {/* Thumbnail Rail */}
              {imagesList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img!)}
                      className={`w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 transition ${
                        selectedImage === img ? 'border-blue-600 ring-2 ring-blue-100 opacity-100' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img!} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive Buyer Protection & Verification Badge */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-5 space-y-3 text-xs shadow-xs">
                <div className="flex items-center justify-between text-amber-900 font-black uppercase text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">🛡️</span> Buyer Protection Checklist
                  </span>
                  <button onClick={reportListing} className="text-rose-600 hover:underline text-[10px] font-black">
                    🚩 Report Abuse / Fraud
                  </button>
                </div>
                <ul className="text-amber-800 space-y-1.5 text-[11px] font-medium leading-relaxed">
                  <li>• Inspect item physically before making any advance transfer.</li>
                  <li>• Meet in safe, public places (shopping malls, plazas, or fuel stations).</li>
                  <li>• Test electronics, gadgets, and serial numbers thoroughly before concluding the deal.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Details, Merchant Info & Actions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                
                <div className="flex items-center justify-between">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-200">
                    🏷️ {product.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">📍 {product.location} State</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{product.title}</h1>

                <div className="flex items-baseline gap-3">
                  <div className="text-3xl sm:text-4xl font-black text-[#0066FF]">₦{Number(product.price).toLocaleString()}</div>
                  <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Direct Merchant Price
                  </span>
                </div>

                {/* Rating Summary */}
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400 text-sm">⭐⭐⭐⭐⭐</div>
                    <span className="text-xs font-black text-slate-800">5.0 / 5.0 Rating</span>
                  </div>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="text-xs font-black text-blue-600 hover:underline"
                  >
                    Rate / Review ⭐
                  </button>
                </div>

                {/* Vendor Card */}
                {vendorDisplayName && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg font-black">
                        🏪
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Verified Merchant</div>
                        <div className="text-xs font-black text-slate-900">{vendorDisplayName}</div>
                      </div>
                    </div>
                    <Link
                      href={`/vendor/${encodeURIComponent(vendorDisplayName)}`}
                      className="h-8 px-3 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-[10px] font-black border border-slate-300 flex items-center transition shadow-xs"
                    >
                      View Full Store ↗
                    </Link>
                  </div>
                )}

                {/* Description */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <h3 className="text-xs font-black uppercase text-slate-700">Item Specifications & Description</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {product.description || 'No detailed description provided by the vendor.'}
                  </p>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/${product.whatsapp || product.phone || '2348012345678'}?text=${encodeURIComponent(whatsappMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    Chat on WhatsApp 💬
                  </a>
                  <a
                    href={`tel:${product.phone || product.whatsapp || '2348012345678'}`}
                    className="h-12 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    Call Vendor 📞
                  </a>
                </div>

                <button
                  onClick={() => setShowOfferModal(true)}
                  className="w-full h-11 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded-xl text-xs border border-blue-200 flex items-center justify-center gap-2 transition"
                >
                  Bargain & Make an Offer 💰
                </button>
              </div>
            </div>

          </div>

          {/* More Items From This Vendor Section */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                More Items From {vendorDisplayName} 🏪
              </h3>
              <Link
                href={`/vendor/${encodeURIComponent(vendorDisplayName)}`}
                className="text-xs font-black text-blue-600 hover:underline"
              >
                View Full Storefront ({vendorProducts.length + 1} Items) →
              </Link>
            </div>

            {vendorProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {vendorProducts.map((vProd) => (
                  <div key={vProd.id} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2 flex flex-col justify-between group">
                    <Link href={`/product/${vProd.id}`} className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden block border">
                      <img src={vProd.image_url_1} alt={vProd.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                    </Link>
                    <div>
                      <Link href={`/product/${vProd.id}`} className="font-black text-xs text-slate-900 line-clamp-1 hover:text-blue-600">
                        {vProd.title}
                      </Link>
                      <div className="text-xs font-black text-[#0066FF] mt-0.5">₦{Number(vProd.price).toLocaleString()}</div>
                    </div>
                    <Link
                      href={`/product/${vProd.id}`}
                      className="w-full h-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black flex items-center justify-center transition"
                    >
                      View Item ↗
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs font-bold text-slate-500">
                This vendor currently has no other items listed.
              </div>
            )}
          </div>

          {/* Reviews List Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Buyer Ratings & Reviews ({reviewsList.length})</h3>
              <button onClick={() => setShowRatingModal(true)} className="text-xs font-black text-blue-600 hover:underline">
                Write a Review ✍️
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewsList.map((rev, idx) => (
                <div key={idx} className="bg-slate-50 border p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-xs text-slate-900">{rev.name}</div>
                    <div className="text-amber-400 text-xs">{'⭐'.repeat(rev.rating)}</div>
                  </div>
                  <p className="text-xs text-slate-600">{rev.comment}</p>
                  <div className="text-[10px] text-slate-400 font-bold">{rev.date}</div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
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

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-6 right-6 text-white text-lg font-black bg-slate-800 h-10 w-10 rounded-full flex items-center justify-center border border-slate-700">
            ✕
          </button>
          <div className="max-w-4xl w-full h-[80vh] flex flex-col items-center justify-center space-y-4">
            <img src={selectedImage || product.image_url_1} alt={product.title} className="max-w-full max-h-[70vh] object-contain rounded-2xl" />
            <div className="flex gap-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img!)}
                  className={`w-14 h-14 rounded-xl border-2 overflow-hidden ${selectedImage === img ? 'border-blue-500' : 'border-slate-700 opacity-60'}`}
                >
                  <img src={img!} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">Submit Rating & Review ⭐</h3>
              <button onClick={() => setShowRatingModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">✕ Close</button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-2">Select Your Star Rating</label>
                <div className="flex gap-2 text-2xl cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={star <= userRating ? 'text-amber-400' : 'text-slate-300'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g., Tunde A."
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Your Review / Experience</label>
                <textarea
                  placeholder="Describe your transaction experience with this merchant..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border p-3 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md uppercase"
              >
                Submit Review ✅
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Price Bargain Matrix Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">Bargain & Make an Offer 🤝</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">✕ Close</button>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border">
              <img src={product.image_url_1} alt={product.title} className="w-12 h-12 object-cover rounded-xl border" />
              <div>
                <h4 className="font-black text-xs line-clamp-1">{product.title}</h4>
                <div className="text-xs font-black text-[#0066FF]">Listed Price: ₦{Number(product.price).toLocaleString()}</div>
              </div>
            </div>

            {/* Quick Bargain Discount Matrix */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase">Interactive Price Bargain Matrix</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDiscount(5)}
                  className="h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded-xl text-[10px] border border-blue-200 transition"
                >
                  -5% (₦{(product.price * 0.95).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDiscount(10)}
                  className="h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded-xl text-[10px] border border-blue-200 transition"
                >
                  -10% (₦{(product.price * 0.90).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDiscount(15)}
                  className="h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded-xl text-[10px] border border-blue-200 transition"
                >
                  -15% (₦{(product.price * 0.85).toLocaleString()})
                </button>
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
                  placeholder="Enter your proposed price"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl text-blue-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md uppercase"
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
