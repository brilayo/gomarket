'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  currency: string;
  category: string;
  location: string;
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  image_url_4: string;
  image_url_5: string;
  video_url: string;
  slug: string;
  is_sold_out?: boolean;
  is_flash_sale?: boolean;
  views_count?: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

export default function ProductLandingPage() {
  const supabase = createClient();
  const params = useParams();
  const productSlug = (params.slug as string) || '';

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [vendorPhone, setVendorPhone] = useState('2348000000000');
  
  // Rating & Review State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [activeImage, setActiveImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'support' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchProductAndStore() {
      if (!productSlug) return;

      const { data: allProds, error } = await supabase
        .from('products')
        .select('*');

      if (error || !allProds) {
        setLoading(false);
        return;
      }

      const foundProduct = allProds.find((p) => p.slug === productSlug);

      if (foundProduct) {
        setProduct(foundProduct);
        setActiveImage(foundProduct.image_url_1 || '');

        // Increment view count securely via atomic RPC function
        await supabase.rpc('increment_product_views', { row_id: foundProduct.id });

        // Fetch other items from vendor
        const vendorItems = allProds.filter(
          (p) => p.vendor_id === foundProduct.vendor_id && p.id !== foundProduct.id && !p.is_sold_out
        );
        setStoreProducts(vendorItems);

        // Fetch vendor reviews
        const { data: revData } = await supabase
          .from('reviews')
          .select('*')
          .eq('vendor_id', foundProduct.vendor_id)
          .order('created_at', { ascending: false });

        if (revData && revData.length > 0) {
          setReviews(revData);
          const totalScore = revData.reduce((acc, r) => acc + r.rating, 0);
          setAvgRating(Number((totalScore / revData.length).toFixed(1)));
        }

        // Fetch phone number
        const { data: profileData } = await supabase
          .from('profiles')
          .select('whatsapp_phone, phone')
          .eq('id', foundProduct.vendor_id)
          .single();

        if (profileData) {
          if (profileData.whatsapp_phone) setVendorPhone(profileData.whatsapp_phone);
          else if (profileData.phone) setVendorPhone(profileData.phone);
        }
      }

      setLoading(false);
    }

    fetchProductAndStore();
  }, [productSlug, supabase]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);

    const newRev = {
      product_id: product.id,
      vendor_id: product.vendor_id,
      rating: userRating,
      comment: userComment,
      reviewer_name: reviewerName.trim() || 'Verified Buyer',
    };

    const { error } = await supabase.from('reviews').insert([newRev]);

    if (!error) {
      setReviewSuccess(true);
      setReviews((prev) => [newRev as Review, ...prev]);
      const updatedList = [newRev, ...reviews];
      const newAvg = updatedList.reduce((acc, r) => acc + r.rating, 0) / updatedList.length;
      setAvgRating(Number(newAvg.toFixed(1)));
      setTimeout(() => {
        setShowRatingModal(false);
        setReviewSuccess(false);
        setUserComment('');
      }, 1500);
    }

    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-[#0066FF] text-xs font-bold">
        Loading Product Details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6 space-y-4">
        <span className="text-4xl">🔍</span>
        <h1 className="text-lg font-black text-slate-900">Product Not Found</h1>
        <p className="text-xs text-slate-500">This item may have been sold out or removed by the vendor.</p>
        <Link
          href="/"
          className="h-10 px-5 bg-[#0066FF] text-white font-extrabold text-xs rounded-xl flex items-center justify-center shadow-md"
        >
          Return to Marketplace Home 🏠
        </Link>
      </div>
    );
  }

  const allImages = [
    product.image_url_1,
    product.image_url_2,
    product.image_url_3,
    product.image_url_4,
    product.image_url_5,
  ].filter(Boolean);

  const productLink = typeof window !== 'undefined' ? window.location.href : '';
  const cleanPhone = vendorPhone.replace(/[^0-9+]/g, '');
  const whatsappCheckoutMessage = encodeURIComponent(
    `Hello! I am interested in buying this item from your goMarket store:\n\n✨ *${product.title}*\n💰 Price: ${product.currency}${Number(product.price).toLocaleString()}\n📍 Location: ${product.location}\n\n🔗 Product Link: ${productLink}\n\nIs this item still available?`
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <div>
        {/* Header with Dynamic Rating */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛒</span>
              <span className="text-lg font-black tracking-tight text-[#0066FF]">goMarket</span>
              <button
                onClick={() => setShowRatingModal(true)}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-extrabold px-3 py-1 rounded-full ml-2 flex items-center gap-1 transition-colors cursor-pointer"
              >
                ⭐ {avgRating} / 5.0 ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}) • Rate Vendor
              </button>
            </div>

            <Link
              href={`/store/${product.vendor_id}`}
              className="h-9 px-4 bg-slate-900 hover:bg-[#0066FF] text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              🏪 Visit Storefront
            </Link>
          </div>
        </header>

        {/* Main Product Section */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Gallery */}
            <div className="md:col-span-7 space-y-4">
              <div
                onClick={() => setLightboxOpen(true)}
                className="aspect-square bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative cursor-zoom-in group"
              >
                {activeImage ? (
                  <img src={activeImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
                {product.is_flash_sale && (
                  <span className="absolute top-4 left-4 bg-amber-400 text-slate-950 text-xs font-black uppercase px-3 py-1.5 rounded-xl shadow-md pointer-events-none">
                    ⚡ 24-Hour Flash Sale
                  </span>
                )}
                <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-xl pointer-events-none flex items-center gap-1.5">
                  🔍 Click to zoom
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImage === img ? 'border-[#0066FF] shadow-md scale-105' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product & Merchant Info */}
            <div className="md:col-span-5 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 sticky top-24">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0066FF] bg-blue-50 px-3 py-1 rounded-lg">
                    {product.category}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    👁️ {product.views_count || 1} views
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{product.title}</h1>
              </div>

              {/* Price */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Verified Price</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#0066FF]">
                    {product.currency}{Number(product.price).toLocaleString()}
                  </span>
                  {product.original_price && (
                    <span className="text-sm font-extrabold text-slate-400 line-through">
                      {product.currency}{Number(product.original_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Vendor Rating & Contact Card */}
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>⭐</span> {avgRating} / 5.0 Rating
                  </span>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="text-[10px] font-black text-[#0066FF] bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    + Rate Vendor
                  </button>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                  <span className="text-xs font-bold text-slate-700">📞 {vendorPhone}</span>
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-black text-[#0066FF] hover:underline"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Item Description</p>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {/* WhatsApp Checkout */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <a
                  href={`https://wa.me/${cleanPhone}?text=${whatsappCheckoutMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  💬 Checkout on WhatsApp with Vendor 🚀
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(productLink);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? '✓ Link Copied to Clipboard!' : '📋 Copy Direct Product Link'}
                </button>
              </div>
            </div>
          </div>

          {/* More Items From This Vendor Section */}
          {storeProducts.length > 0 && (
            <div className="space-y-6 pt-12 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">More Items From This Store</h2>
                  <p className="text-xs text-slate-500">Explore other active listings uploaded by this merchant.</p>
                </div>
                <Link
                  href={`/store/${product.vendor_id}`}
                  className="text-xs font-black text-[#0066FF] hover:underline"
                >
                  View All ({storeProducts.length}) →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {storeProducts.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/item/${item.slug}`}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group"
                  >
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      {item.image_url_1 ? (
                        <img src={item.image_url_1} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                      {item.is_flash_sale && (
                        <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                          ⚡ Flash
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#0066FF] bg-blue-50 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <h3 className="text-xs font-black text-slate-900 group-hover:text-[#0066FF] transition-colors line-clamp-1">{item.title}</h3>
                      </div>
                      <span className="text-xs font-black text-[#0066FF]">{item.currency}{Number(item.price).toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews List */}
          <div className="space-y-6 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">Customer Reviews ({reviews.length})</h2>
                <p className="text-xs text-slate-500">Verified feedback from buyers who ordered from this vendor.</p>
              </div>
              <button
                onClick={() => setShowRatingModal(true)}
                className="h-9 px-4 bg-[#0066FF] text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Write a Review ✨
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
                <span className="text-3xl">⭐</span>
                <p className="text-xs font-bold text-slate-700">No customer reviews yet.</p>
                <p className="text-[11px] text-slate-400">Be the first to leave feedback for this vendor after your purchase!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{rev.reviewer_name}</span>
                      <span className="text-xs font-bold text-amber-500">{'⭐'.repeat(rev.rating)}</span>
                    </div>
                    {rev.comment && <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Interactive Vendor Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-200 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-3xl">⭐</span>
              <h3 className="text-base font-black text-slate-900">Rate Your Experience</h3>
              <p className="text-xs text-slate-500">How was your ordering process with this vendor?</p>
            </div>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-700">
                ✓ Thank you! Your rating has been submitted successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star Picker */}
                <div className="flex justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`text-2xl transition-transform ${userRating >= star ? 'scale-125 text-amber-400' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Your Name (e.g. Joy A.)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:border-[#0066FF]"
                />

                <textarea
                  placeholder="Optional comment about delivery speed or item quality..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#0066FF] resize-none"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full h-11 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center"
                >
                  {submittingReview ? 'Submitting Rating...' : 'Submit Rating & Review ⭐'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center"
            >
              ✕ Close
            </button>
            <img src={activeImage} alt="Expanded View" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} goMarket Nigeria. All rights reserved.</p>
          <div className="flex items-center gap-4 font-bold">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-[#0066FF] transition-colors cursor-pointer">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setActiveModal('terms')} className="hover:text-[#0066FF] transition-colors cursor-pointer">Terms of Service</button>
            <span>•</span>
            <button onClick={() => setActiveModal('support')} className="hover:text-[#0066FF] transition-colors cursor-pointer">Support</button>
          </div>
        </div>
      </footer>

      {/* Interactive Legal & Support Modals with Comprehensive Write-Ups */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* Comprehensive Privacy Policy Modal Write-Up */}
            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center text-lg font-black">🔒</span>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-900">Privacy Policy</h3>
                    <p className="text-[11px] font-bold text-slate-400">goMarket Data Protection Guidelines</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[55vh] overflow-y-auto pr-2">
                  <p>
                    At <strong className="text-[#0066FF]">goMarket</strong>, we value your privacy and are dedicated to maintaining transparency regarding the minimal data processed when you browse items or place orders.
                  </p>
                  <p>
                    <strong>1. Direct WhatsApp Interactions:</strong> When you tap the <em>&quot;Checkout on WhatsApp&quot;</em> button, goMarket generates a formatted message and redirects you directly to the merchant&apos;s WhatsApp business chat. No payment card details or private banking credentials are ever collected or stored on goMarket servers.
                  </p>
                  <p>
                    <strong>2. Analytics & Item Analytics:</strong> We track anonymous page visit counts and category selections purely to compute aggregate view metrics for merchants, allowing them to optimize their inventory and flash sale offerings.
                  </p>
                  <p>
                    <strong>3. Buyer Feedback & Reviews:</strong> Ratings and optional comments submitted via our customer review feature are publicly displayed on product pages to build verified community trust.
                  </p>
                  <p>
                    <strong>4. Data Security:</strong> All platform interactions are encrypted using standard SSL protocols. We do not sell, rent, or share personal user data with third-party advertising brokers.
                  </p>
                </div>
              </div>
            )}

            {/* Comprehensive Terms of Service Modal Write-Up */}
            {activeModal === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center text-lg font-black">📜</span>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-900">Terms of Service</h3>
                    <p className="text-[11px] font-bold text-slate-400">Buyer & Merchant Operating Rules</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[55vh] overflow-y-auto pr-2">
                  <p>
                    Welcome to <strong className="text-[#0066FF]">goMarket</strong>. By accessing our public catalogs, product landing pages, or store links, you agree to adhere to these operating terms:
                  </p>
                  <p>
                    <strong>1. Platform Infrastructure:</strong> goMarket provides digital storefront architecture, automated promo tools, and WhatsApp order routing for independent vendors across Nigeria. goMarket does not directly own or physically inspect inventory listed by independent merchants.
                  </p>
                  <p>
                    <strong>2. Order Settlement & Delivery:</strong> Product prices, flash sale availability, payment arrangements, dispatch, and physical delivery terms are negotiated directly between the buyer and the vendor within WhatsApp.
                  </p>
                  <p>
                    <strong>3. Merchant Verification & Ethics:</strong> Vendors must ensure all product photos, prices, and descriptions represent original and authentic inventory. Listing illegal or prohibited items is strictly banned and results in permanent store suspension.
                  </p>
                </div>
              </div>
            )}

            {/* Comprehensive Support Modal Write-Up */}
            {activeModal === 'support' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center text-lg font-black">💬</span>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-900">Customer Support</h3>
                    <p className="text-[11px] font-bold text-slate-400">Instant Vendor & Platform Help</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[55vh] overflow-y-auto pr-2">
                  <p>
                    Have questions about an item or need technical platform help? Here is how to get immediate support:
                  </p>
                  <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-2xl space-y-1.5">
                    <p className="font-extrabold text-slate-900 text-xs">🛍️ Item & Order Inquiries:</p>
                    <p className="text-[11px] text-slate-600">
                      Tap the green <strong>&quot;Checkout on WhatsApp with Vendor&quot;</strong> button or click the direct phone contact link to chat live with the store owner regarding stock availability, dispatch time, or payment options.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5">
                    <p className="font-extrabold text-slate-900 text-xs">🌐 goMarket Technical Desk:</p>
                    <p className="text-[11px] text-slate-600">
                      For vendor onboarding assistance, platform issues, or feedback, contact our central support team at <strong className="text-[#0066FF]">support@gomarket.ng</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full h-11 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
