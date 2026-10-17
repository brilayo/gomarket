'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import AnnouncementBar from '@/components/AnnouncementBar';



interface MediaFile {
  id: string;
  file_url: string;
  file_type: string;
}

interface Seller {
  id: string;
  business_name: string;
  phone_number: string;
  slug: string;
  state?: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  price_kobo: number;
  status: string;
  is_negotiable: boolean;
  short_code: string;
  views_count?: number;
  created_at: string;
  sellers?: Seller;
  media_files?: MediaFile[];
}

interface AdminFeaturedProduct {
  id: string;
  title: string;
  price_kobo: number;
  image_url: string;
  store_name: string;
  whatsapp_number: string;
  phone_number: string;
  short_code: string;
  store_slug: string;
  badge: string;
}

interface AdBanner {
  id: string;
  sponsor_name: string;
  title: string;
  tagline: string;
  cta_text: string;
  target_url: string;
  badge: string;
  bg_gradient: string;
  position: string;
}

// 🇳🇬 ALL 36 NIGERIAN STATES + FCT
const NIGERIAN_STATES = [
  'All States',
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

// 🏷️ COMPREHENSIVE CATEGORIES (WITH AUCTIONS ADDED)
const MARKETPLACE_CATEGORIES = [
  { label: 'All Items', value: 'all' },
  { label: '🔨 Auctions & Bidding', value: 'auction' },
  { label: '🚗 Cars & Vehicles', value: 'car' },
  { label: '🏍️ Bikes & Tricycles', value: 'bike' },
  { label: '🏠 Houses & Apartments', value: 'house' },
  { label: '🌍 Land & Plots', value: 'land' },
  { label: '📱 Phones & Gadgets', value: 'phone' },
  { label: '💻 Laptops & Tech', value: 'laptop' },
  { label: '🌾 Food Stuff', value: 'food stuff' },
  { label: '🍲 Prepared Food', value: 'food' },
  { label: '🏠 Home Appliances', value: 'appliance' },
  { label: '⌚ Watches & Jewelry', value: 'watch' },
  { label: '👗 Clothes & Fashion', value: 'cloth' },
  { label: '👟 Shoes & Sneakers', value: 'shoe' },
  { label: '💊 Pharmacy & Medical', value: 'pharmacy' },
  { label: '🧴 Body & Beauty Products', value: 'body' },
];

function formatPriceKobo(priceKobo: number): string {
  if (!priceKobo || isNaN(priceKobo)) return '₦0';
  return `₦${(priceKobo / 100).toLocaleString('en-NG')}`;
}

export default function UltimateGoMarketHomePage() {
  const supabase = createClient();

  const [items, setItems] = useState<Item[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Admin States
  const [adminFeaturedSlots, setAdminFeaturedSlots] = useState<AdminFeaturedProduct[]>([]);
  const [middleAd, setMiddleAd] = useState<AdBanner | null>(null);
  const [bottomAd, setBottomAd] = useState<AdBanner | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSellerSlug, setSelectedSellerSlug] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyNegotiable, setOnlyNegotiable] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Custom Dropdown State for States
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Bargain Modal State
  const [offerItem, setOfferItem] = useState<Item | null>(null);
  const [customOfferPrice, setCustomOfferPrice] = useState<string>('');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    async function loadMarketplaceData() {
      try {
        // 1. Fetch Sellers
        const { data: sellersData } = await supabase
          .from('sellers')
          .select('*')
          .order('business_name', { ascending: true });

        if (sellersData) {
          setSellers(sellersData);
        }

        // 2. Fetch Admin Featured Top 5 Slots from Supabase (with fallbacks if empty)
        const { data: adminSlots } = await supabase
          .from('admin_featured_slots')
          .select('*')
          .limit(5);

        if (adminSlots && adminSlots.length > 0) {
          setAdminFeaturedSlots(adminSlots);
        } else {
          setAdminFeaturedSlots([
            {
              id: 'admin-slot-1',
              title: 'Addidas shoe (Admin Pick)',
              price_kobo: 3400000,
              image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=500',
              store_name: "Ella's Boutique",
              whatsapp_number: '2348000000000',
              phone_number: '2348000000000',
              short_code: 'sample1',
              store_slug: 'ellas-boutique',
              badge: '👑 ADMIN PICK',
            },
            {
              id: 'admin-slot-2',
              title: 'Smart Designer Sneaker',
              price_kobo: 4500000,
              image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=500',
              store_name: 'Lagos Hub',
              whatsapp_number: '2348000000000',
              phone_number: '2348000000000',
              short_code: 'sample2',
              store_slug: 'lagos-hub',
              badge: '👑 TOP DEAL',
            },
          ]);
        }

        

        // 3. Fetch Admin Ad Banners from Supabase
        const { data: adBanners } = await supabase
          .from('admin_ad_banners')
          .select('*');

        if (adBanners && adBanners.length > 0) {
          const middle = adBanners.find((ad) => ad.position === 'middle') || adBanners[0];
          const bottom = adBanners.find((ad) => ad.position === 'bottom') || adBanners[1] || adBanners[0];
          setMiddleAd(middle);
          setBottomAd(bottom);
        }

        // 4. Fetch Marketplace Items
        const { data: itemsData } = await supabase
          .from('items')
          .select('*, sellers(*), media_files(*)')
          .order('created_at', { ascending: false });

        const loadedItems = itemsData || [];
        setItems(loadedItems);
        setFilteredItems(loadedItems);
      } catch (err) {
        console.error('Error loading marketplace data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMarketplaceData();
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [supabase]);
  

  // Filtering Logic
  useEffect(() => {
    let result = [...items];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          item.sellers?.business_name.toLowerCase().includes(q)
      );
    }

    if (selectedSellerSlug !== 'all') {
      result = result.filter((item) => item.sellers?.slug === selectedSellerSlug);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((item) => item.status === selectedStatus);
    }

    if (selectedState !== 'All States') {
      result = result.filter(
        (item) =>
          item.sellers?.state?.toLowerCase() === selectedState.toLowerCase()
      );
    }

    if (selectedCategory !== 'all') {
      const cat = selectedCategory.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(cat) ||
          (item.description && item.description.toLowerCase().includes(cat))
      );
    }

    if (onlyNegotiable) {
      result = result.filter((item) => item.is_negotiable === true);
    }

    setFilteredItems(result);
  }, [searchQuery, selectedSellerSlug, selectedStatus, selectedState, selectedCategory, onlyNegotiable, items]);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-NG';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setSearchQuery(event.results[0][0].transcript);
    };

    recognition.start();
  };

  const handleShareToWhatsApp = (title: string, price: string, url?: string) => {
    const text = `🔥 Check out "${title}" for ${price} on goMarket!\n${url || window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendCustomOffer = () => {
    if (!offerItem || !customOfferPrice) return;

    const sellerName = offerItem.sellers?.business_name || 'Seller';
    const sellerPhone = offerItem.sellers?.phone_number;
    const formattedOriginal = formatPriceKobo(offerItem.price_kobo);
    const formattedOffer = `₦${parseInt(customOfferPrice).toLocaleString('en-NG')}`;

    const msg = `Hello ${sellerName}, I saw your listing for "${offerItem.title}" (${formattedOriginal}). Would you accept ${formattedOffer} for quick payment?`;

    window.open(`https://wa.me/${sellerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    setOfferItem(null);
    setCustomOfferPrice('');
  };

  const firstHalf = filteredItems.slice(0, 5);
  const secondHalf = filteredItems.slice(5);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="text-4xl animate-bounce">🛒</div>
          <p className="text-xs font-black text-[#0066FF] uppercase tracking-widest">
            Loading goMarket...
          </p>
        </div>
      </div >
      
    );
  }
  

  const renderProductCard = (item: Item) => {
    const mainMedia =
      item.media_files && item.media_files.length > 0
        ? item.media_files[0]
        : null;
    const formattedPrice = formatPriceKobo(item.price_kobo);
    const sellerName = item.sellers?.business_name || 'Verified Vendor';
    const sellerPhone = item.sellers?.phone_number;
    const sellerSlug = item.sellers?.slug;

    const message = `Hello ${sellerName}, I am interested in purchasing "${
      item.title
    }" priced at ${formattedPrice}${
      item.is_negotiable ? ' (Negotiable)' : ''
    }. Is it available?`;
    const whatsappUrl = sellerPhone
      ? `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`
      : '#';
    const itemUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${sellerSlug}/p/${item.short_code}`;

    return (
      <div
        key={item.id}
        className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
      >
        <div>
          <a
            href={sellerSlug ? `/s/${sellerSlug}/p/${item.short_code}` : '#'}
            className="aspect-square bg-slate-50 border-b border-slate-100 relative overflow-hidden flex items-center justify-center block"
          >
            {mainMedia ? (
              mainMedia.file_type === 'video' ? (
                <video src={mainMedia.file_url} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={mainMedia.file_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )
            ) : (
              <span className="text-2xl">📦</span>
            )}

            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <span className="bg-slate-950/85 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1 shadow-xs">
                <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
                {sellerName}
              </span>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleShareToWhatsApp(item.title, formattedPrice, itemUrl);
                }}
                className="bg-black/60 hover:bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm transition-colors"
                title="Share to WhatsApp Status"
              >
                📲 Status
              </button>
              <span className="bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                👁️ {item.views_count || 0}
              </span>
            </div>
          </a>
          

          <div className="p-2.5">
            <a
              href={sellerSlug ? `/s/${sellerSlug}/p/${item.short_code}` : '#'}
              className="text-xs font-bold text-slate-900 hover:text-[#0066FF] transition-colors line-clamp-1 block"
            >
              {item.title}
            </a>

            <div className="flex items-center justify-between gap-1 mt-1 mb-1.5">
              <span className="text-sm font-black text-[#0066FF]">
                {formattedPrice}
              </span>
              {item.is_negotiable && (
                <button
                  onClick={() => {
                    setOfferItem(item);
                    setCustomOfferPrice(
                      Math.round((item.price_kobo / 100) * 0.9).toString()
                    );
                  }}
                  className="text-[9px] font-extrabold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 px-1.5 py-0.5 rounded transition-colors"
                >
                  🤝 Offer
                </button>
              )}
            </div>
          </div>
        </div>
        

        <div className="p-2.5 pt-0">
          <div className="grid grid-cols-2 gap-1.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
            >
              💬 WhatsApp
            </a>

            {sellerPhone ? (
              <a
                href={`tel:${sellerPhone}`}
                className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
              >
                📞 Call
              </a>
            ) : (
              <a
                href={sellerSlug ? `/s/${sellerSlug}/p/${item.short_code}` : '#'}
                className="h-8 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg flex items-center justify-center"
              >
                Details →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAdBanner = (ad: AdBanner | null) => {
    if (!ad) return null;
    return (
      <div
        className={`bg-gradient-to-r ${ad.bg_gradient || 'from-blue-600 to-indigo-900'} rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 my-4 relative overflow-hidden`}
      >
        <div className="space-y-0.5 text-center sm:text-left z-10">
          <span className="text-[9px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
            📢 {ad.badge || 'SPONSORED'} • {ad.sponsor_name}
          </span>
          <h3 className="text-xs sm:text-sm font-black tracking-tight">{ad.title}</h3>
          <p className="text-[11px] font-normal text-white/80 leading-snug">
            {ad.tagline}
          </p>
        </div>

        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 px-4 bg-white text-slate-900 text-xs font-black rounded-xl flex items-center justify-center shrink-0 shadow-xs hover:bg-slate-100 transition-colors z-10"
        >
          {ad.cta_text}
        </a>
      </div>
    );
  };
  

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <div>
        {/* Header with goMarket Branding (Admin button removed) */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              <span className="text-xl font-black text-[#0066FF] tracking-tight">goMarket</span>
            </a>

            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="h-9 px-4 bg-[#0066FF] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-xs transition-all hover:scale-[1.02]"
              >
                Seller Portal ↗
              </a>
            </div>
          </div>
        </header>
        

        <main className="max-w-7xl mx-auto px-3.5 pt-4 pb-12 space-y-4">
          {/* Flash Deals & Urgency Ticker */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-2 shrink-0">
              <span className="animate-pulse">⚡</span>
              <span className="tracking-wide uppercase text-[10px] font-black bg-white/20 px-2 py-0.5 rounded">Live Deal Ticker</span>
            </div>
            <p className="text-[11px] font-medium truncate text-blue-100">
              🔥 Over 140+ buyers currently chatting directly with verified vendors across Nigeria!
            </p>
          </div>
          

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs space-y-3 relative">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex items-center flex-1 w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search auctions, cars, houses, phones, food stuff..."
                  className="w-full h-10 pl-3.5 pr-20 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:bg-white focus:border-[#0066FF] focus:outline-none transition-all"
                />

                <div className="absolute right-2.5 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
                    >
                      ✕
                    </button>
                  )}

                  
                  <button
                    onClick={handleVoiceSearch}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      isListening
                        ? 'bg-rose-500 text-white animate-bounce'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Voice Search"
                  >
                    🎙️
                  </button>
                </div>
              </div>

              {/* 🌟 STABLE CUSTOM DROPDOWN MENU FOR 36 STATES */}
              <div className="relative w-full sm:w-56 shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                  className="w-full h-10 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-between shadow-xs transition-all"
                >
                  <span>📍 {selectedState} {selectedState !== 'All States' ? 'State' : ''}</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>

                {isStateDropdownOpen && (
                  <div className="absolute top-12 left-0 w-full sm:w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 space-y-1">
                    {NIGERIAN_STATES.map((state) => (
                      <button
                        key={state}
                        onClick={() => {
                          setSelectedState(state);
                          setIsStateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between ${
                          selectedState === state
                            ? 'bg-[#0066FF] text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>📍 {state} {state !== 'All States' ? 'State' : ''}</span>
                        {selectedState === state && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 🏷️ Comprehensive Categories Pill Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">Categories:</span>
              {MARKETPLACE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all shrink-0 ${
                    selectedCategory === cat.value
                      ? 'bg-[#0066FF] text-white border-[#0066FF] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
              <button
                onClick={() => setOnlyNegotiable(!onlyNegotiable)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-all text-xs flex items-center gap-1.5 ${
                  onlyNegotiable
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                🤝 Negotiable Deals Only
              </button>

              <span className="text-xs font-extrabold text-slate-400">
                {filteredItems.length} Products Found in {selectedState}
              </span>
            </div>
          </div>

          

          {/* Vendors Strip */}
          {sellers.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedSellerSlug('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                  selectedSellerSlug === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🛒 All Stores
              </button>
              {sellers.map((seller) => (
                <button
                  key={seller.id}
                  onClick={() => setSelectedSellerSlug(seller.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                    selectedSellerSlug === seller.slug
                      ? 'bg-[#0066FF] text-white border-[#0066FF]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {seller.business_name}
                </button>
              ))}
            </div>
          )}

          {/* 👑 ADMIN FEATURED TOP 5 SLOTS */}
          {adminFeaturedSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>👑</span> Admin Featured Top 5 Slots
                </h2>
                <span className="text-[10px] font-extrabold text-white bg-slate-900 px-2.5 py-0.5 rounded-md">
                  Admin Curated
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {adminFeaturedSlots.map((ad) => {
                  const formattedPrice = formatPriceKobo(ad.price_kobo);
                  const whatsappUrl = `https://wa.me/${ad.whatsapp_number}?text=${encodeURIComponent(
                    `Hello \${ad.store_name}, I am interested in your featured item "\${ad.title}" priced at \${formattedPrice} on goMarket.`
                  )}`;

                  return (
                    <div
                      key={ad.id}
                      className="bg-white rounded-xl border-2 border-amber-400/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="aspect-square bg-slate-50 border-b border-slate-100 relative overflow-hidden flex items-center justify-center block">
                          <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              {ad.badge}
                            </span>
                          </div>

                          <div className="absolute bottom-2 left-2">
                            <span className="bg-slate-950/85 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-md">
                              {ad.store_name}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5">
                          <span className="text-xs font-bold text-slate-900 line-clamp-1 block">
                            {ad.title}
                          </span>
                          <div className="flex items-center justify-between gap-1 mt-1 mb-1.5">
                            <span className="text-sm font-black text-[#0066FF]">
                              {formattedPrice}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 pt-0">
                        <div className="grid grid-cols-2 gap-1.5">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
                          >
                            💬 WhatsApp
                          </a>
                          <a
                            href={`tel:${ad.phone_number}`}
                            className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
                          >
                            📞 Call
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-3">
              <span>🛍️</span> Marketplace Feed
            </h2>

            {/* Product Grid */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center max-w-md mx-auto">
                <p className="text-3xl mb-2">🔍</p>
                <h3 className="text-sm font-bold text-slate-900 mb-1">No products found</h3>
                <p className="text-xs text-slate-500 mb-3">Try clearing search or location filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSellerSlug('all');
                    setSelectedStatus('all');
                    setSelectedState('All States');
                    setSelectedCategory('all');
                    setOnlyNegotiable(false);
                  }}
                  className="h-9 px-4 bg-[#0066FF] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {firstHalf.map((item) => renderProductCard(item))}
                </div>

                {renderAdBanner(middleAd)}

                {secondHalf.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {secondHalf.map((item) => renderProductCard(item))}
                  </div>
                )}

                {renderAdBanner(bottomAd)}
              </>
            )}
          </div>
        </main>
      </div>
      

      {/* Modern goMarket Footer (With Support WhatsApp Icon) */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-10 pb-8 px-4 space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Buyer Protection Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-medium text-slate-300">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <strong className="text-white block text-xs">0% Commission Fees</strong>
                <span className="text-[11px] text-slate-400">Direct owner prices without middlemen</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <div>
                <strong className="text-white block text-xs">Verified WhatsApp Merchants</strong>
                <span className="text-[11px] text-slate-400">Chat & bargain directly with business owners</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <strong className="text-white block text-xs">Instant Local Pickup</strong>
                <span className="text-[11px] text-slate-400">Same-day delivery across all 36 states</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-[#0066FF] uppercase bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                Direct Seller Marketplace • 0% Commission
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Buy Directly From Verified Nigerian Vendors
              </h2>
            </div>
            <a
              href="/login"
              className="h-10 px-5 bg-[#0066FF] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center shadow-md transition-colors shrink-0"
            >
              Start Selling Free 🚀
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs border-t border-slate-900 pt-8">
            <div className="space-y-2.5">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">About Us</h3>
              <ul className="space-y-1.5 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">About goMarket</a></li>
                <li><a href="#" className="hover:text-white transition-colors">We are hiring!</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Policies</h3>
              <ul className="space-y-1.5 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Copyright Infringement Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Support</h3>
              <ul className="space-y-1.5 font-medium">
                <li className="text-slate-300 font-bold">support@gomarket.ng</li>
                {/* 💬 Support WhatsApp Link */}
                <li>
                  <a
                    href="https://wa.me/2348000000000?text=Hello%20goMarket%20Support,%20I%20need%20help%20with..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#25D366] font-bold hover:underline"
                  >
                    <span>💬</span> Chat with Support on WhatsApp
                  </a>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Center</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Our Resources</h3>
              <ul className="space-y-1.5 font-medium">
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1.5">📘 Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1.5">📸 Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1.5">🌐 goMarket Africa</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <span className="font-black text-slate-200">goMarket</span>
              <span>© {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <span>Built for Nigerian Direct Sellers & Buyers</span>
          </div>
        </div>
      </footer>

      {/* Offer Modal */}
      {offerItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">
                Make an Offer on "{offerItem.title}"
              </h3>
              <button
                onClick={() => setOfferItem(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Original Price: <strong className="text-slate-900">{formatPriceKobo(offerItem.price_kobo)}</strong>
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Your Offer Price (₦)
              </label>
              <input
                type="number"
                value={customOfferPrice}
                onChange={(e) => setCustomOfferPrice(e.target.value)}
                placeholder="Enter your price"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#0066FF]"
              />
            </div>
            

            <button
              onClick={handleSendCustomOffer}
              className="w-full h-10 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              💬 Send Offer via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


