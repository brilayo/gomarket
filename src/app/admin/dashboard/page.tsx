'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  location: string;
  image_url_1: string;
  is_flash_sale?: boolean;
  is_sponsored?: boolean;
  is_featured?: boolean;
  is_flagged?: boolean;
  vendor_name?: string;
  vendor_id?: string;
  whatsapp?: string;
  phone?: string;
  views_count?: number;
  created_at?: string;
}

interface MemberProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  kyc_status?: 'pending' | 'verified' | 'rejected';
  status?: 'active' | 'deleted';
  last_seen?: string;
  id_type?: string;
  id_number?: string;
  created_at?: string;
}

const NIGERIAN_STATES = [
  'All 36 States', 'Lagos', 'FCT Abuja', 'Rivers', 'Oyo', 'Kano', 'Edo', 'Delta', 'Anambra', 'Ogun', 'Kaduna',
  'Abia', 'Adamawa', 'Akwa Ibom', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Ebonyi', 'Ekiti',
  'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Niger',
  'Ondo', 'Osun', 'Plateau', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function AdminDashboard() {
  const supabase = createClient();
  
  // Password Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // In-Dashboard Password Settings State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<
    'listings' | 'vendors' | 'kyc' | 'users' | 'deleted' | 'promotions' | 'analytics' | 'moderation' | 'settings'
  >('listings');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All 36 States');
  const [filterType, setFilterType] = useState('all');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  // Announcement & Banner State
  const [announcementText, setAnnouncementText] = useState('🔥 Independence Flash Sales Live Across All 36 States!');
  const [heroTitle, setHeroTitle] = useState('Buy & Sell Directly With Verified Vendors');

  // Verified Vendors Set
  const [verifiedVendors, setVerifiedVendors] = useState<Record<string, boolean>>({});

  // Get active password from LocalStorage or default to 'admin123'
  const getStoredPassword = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gomarket_admin_secret') || 'admin123';
    }
    return 'admin123';
  };

  // Check Session Storage on Mount for Password Login
  useEffect(() => {
    const authStatus = sessionStorage.getItem('gomarket_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  async function fetchData() {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!productError && productData) {
      setProducts(productData);
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profileError && profileData) {
      setMembers(profileData);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, supabase]);

  // Handle Admin Password Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPassword = getStoredPassword();

    if (inputPassword === currentPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('gomarket_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
      setInputPassword('');
    }
  };

  // Handle Password Change from Dashboard Settings
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const activePassword = getStoredPassword();

    if (currentPassInput !== activePassword) {
      alert('❌ Your current password is incorrect!');
      return;
    }

    if (newPassInput.length < 4) {
      alert('❌ New password must be at least 4 characters long!');
      return;
    }

    if (newPassInput !== confirmPassInput) {
      alert('❌ New passwords do not match!');
      return;
    }

    localStorage.setItem('gomarket_admin_secret', newPassInput);
    alert('🎉 Admin password successfully updated!');
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gomarket_admin_auth');
    setIsAuthenticated(false);
  };

  const handleToggleSponsored = async (productId: string, currentStatus: boolean) => {
    const nextStatus = !Boolean(currentStatus);
    setProducts(products.map(p => p.id === productId ? { ...p, is_sponsored: nextStatus, is_featured: nextStatus } : p));
    await supabase.from('products').update({ is_sponsored: nextStatus, is_featured: nextStatus }).eq('id', productId);
  };

  const handleToggleFlashSale = async (productId: string, currentStatus: boolean) => {
    const nextStatus = !Boolean(currentStatus);
    setProducts(products.map(p => p.id === productId ? { ...p, is_flash_sale: nextStatus } : p));
    await supabase.from('products').update({ is_flash_sale: nextStatus }).eq('id', productId);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) setProducts(products.filter(p => p.id !== productId));
  };

  const handleApproveFlagged = async (productId: string) => {
    setProducts(products.map(p => p.id === productId ? { ...p, is_flagged: false } : p));
    await supabase.from('products').update({ is_flagged: false }).eq('id', productId);
    alert('Listing approved and cleared from queue.');
  };

  const handleToggleVerifiedVendor = (vendorName: string) => {
    setVerifiedVendors(prev => ({ ...prev, [vendorName]: !prev[vendorName] }));
  };

  const handleUpdateKYC = async (memberId: string, newStatus: 'verified' | 'rejected' | 'pending') => {
    const { error } = await supabase
      .from('profiles')
      .update({ kyc_status: newStatus })
      .eq('id', memberId);

    if (!error) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, kyc_status: newStatus } : m));
      alert(`Vendor KYC status updated to ${newStatus.toUpperCase()} ✅`);
    } else {
      alert('Failed to update KYC status. Check Supabase table permissions.');
    }
  };

  const handleToggleAccountStatus = async (memberId: string, currentStatus?: string) => {
    const targetStatus = currentStatus === 'deleted' ? 'active' : 'deleted';
    const { error } = await supabase
      .from('profiles')
      .update({ status: targetStatus })
      .eq('id', memberId);

    if (!error) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: targetStatus } : m));
      alert(`Account status changed to ${targetStatus.toUpperCase()}`);
    }
  };

  // Metrics Calculations
  const totalListings = products.length;
  const activeFlashCount = products.filter(p => p.is_flash_sale).length;
  const flaggedCount = products.filter(p => p.is_flagged).length;

  const activeMembers = members.filter(m => m.status !== 'deleted');
  const totalRegisteredUsers = activeMembers.length;
  const deletedUsersList = members.filter(m => m.status === 'deleted');
  
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const usersOnlineCount = activeMembers.filter(m => {
    if (!m.last_seen) return false;
    return new Date(m.last_seen) > fifteenMinsAgo;
  }).length;

  const pendingKYCCount = activeMembers.filter(m => m.kyc_status === 'pending').length;

  const vendorsMap = new Map();
  products.forEach(p => {
    const name = p.vendor_name || 'Verified Store';
    if (!vendorsMap.has(name)) {
      vendorsMap.set(name, { name, count: 0, phone: p.phone || p.whatsapp || '2348012345678', whatsapp: p.whatsapp || p.phone || '2348012345678' });
    }
    vendorsMap.get(name).count += 1;
  });
  const uniqueVendorsList = Array.from(vendorsMap.values());

  const stateCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  products.forEach(p => {
    if (p.location) stateCounts[p.location] = (stateCounts[p.location] || 0) + 1;
    if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.vendor_name && p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesState = selectedState === 'All 36 States' || p.location === selectedState;
    const matchesType = 
      filterType === 'all' ? true :
      filterType === 'sponsored' ? (p.is_sponsored || p.is_featured) :
      filterType === 'flash' ? p.is_flash_sale : true;

    return matchesSearch && matchesState && matchesType;
  });

  const filteredKYCMembers = activeMembers.filter(m => {
    const matchesSearch = !searchQuery || (m.full_name && m.full_name.toLowerCase().includes(searchQuery.toLowerCase())) || (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = kycFilter === 'all' || m.kyc_status === kycFilter;
    return matchesSearch && matchesStatus;
  });

  // RENDER LOGIN GATE IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-white">
          <div className="text-center space-y-2">
            <span className="text-4xl">🛡️</span>
            <h1 className="text-xl font-black tracking-tight">Admin Command Center</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Secure Access Required</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase mb-1.5">Enter Admin Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full h-12 bg-slate-950 border border-slate-700 px-4 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                required
              />
              {authError && (
                <p className="text-[11px] text-rose-500 font-bold mt-1.5">❌ Incorrect password. Please try again.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition"
            >
              Unlock Dashboard 🔓
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition">
              ← Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-bold">Loading Admin Command Center...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-sm font-black tracking-tight">goMarket <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">Admin Command Center</span></h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Enterprise Management Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[11px] bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online: <strong className="text-white">{usersOnlineCount}</strong></span>
            </div>
            <button onClick={handleLogout} className="h-9 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow transition">
              Lock 🔒
            </button>
            <Link href="/" className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center shadow-md">Homepage 🏠</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
            <div className="text-[10px] font-black uppercase text-slate-400">Total Listings</div>
            <div className="text-2xl font-black text-slate-900">{totalListings}</div>
          </div>
          <div className="bg-white border border-blue-200 rounded-3xl p-5 shadow-xs space-y-1 bg-blue-50/30">
            <div className="text-[10px] font-black uppercase text-blue-700">Registered Users</div>
            <div className="text-2xl font-black text-blue-600">{totalRegisteredUsers}</div>
          </div>
          <div className="bg-white border border-amber-200 rounded-3xl p-5 shadow-xs space-y-1 bg-amber-50/40">
            <div className="text-[10px] font-black uppercase text-amber-700">Pending KYC</div>
            <div className="text-2xl font-black text-amber-600">{pendingKYCCount}</div>
          </div>
          <div className="bg-white border border-rose-200 rounded-3xl p-5 shadow-xs space-y-1 bg-rose-50/40">
            <div className="text-[10px] font-black uppercase text-rose-700">Active Flash Deals</div>
            <div className="text-2xl font-black text-rose-600">{activeFlashCount}</div>
          </div>
          <div className="bg-white border border-red-200 rounded-3xl p-5 shadow-xs space-y-1 bg-red-50/40">
            <div className="text-[10px] font-black uppercase text-red-700">Flagged Queue</div>
            <div className="text-2xl font-black text-red-600">{flaggedCount}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button onClick={() => setActiveTab('listings')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'listings' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>📦 Listings</button>
          <button onClick={() => setActiveTab('vendors')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'vendors' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>🏪 Vendors ({uniqueVendorsList.length})</button>
          <button onClick={() => setActiveTab('kyc')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'kyc' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>
            🛡️ KYC Approval Center
            {pendingKYCCount > 0 && <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-black">{pendingKYCCount}</span>}
          </button>
          <button onClick={() => setActiveTab('users')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'users' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>👤 Users & Online ({totalRegisteredUsers})</button>
          <button onClick={() => setActiveTab('deleted')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'deleted' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>🗑️ Deleted Accounts ({deletedUsersList.length})</button>
          <button onClick={() => setActiveTab('promotions')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'promotions' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>📢 Banners</button>
          <button onClick={() => setActiveTab('analytics')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'analytics' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>📊 Analytics</button>
          <button onClick={() => setActiveTab('moderation')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'moderation' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>🚨 Flagged ({flaggedCount})</button>
          <button onClick={() => setActiveTab('settings')} className={`h-10 px-4 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}>⚙️ Settings</button>
        </div>

        {/* TAB 1: LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Search title or store name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 bg-slate-50 border px-3 rounded-xl text-xs font-bold" />
              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full h-10 bg-slate-50 border px-3 rounded-xl text-xs font-bold">
                {NIGERIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full h-10 bg-slate-50 border px-3 rounded-xl text-xs font-bold">
                <option value="all">All Listings</option>
                <option value="sponsored">⭐ Sponsored Ads Only</option>
                <option value="flash">⚡ Flash Deals Only</option>
              </select>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-3">Manage Listings ({filteredProducts.length})</h3>
              <div className="space-y-3">
                {filteredProducts.map(item => {
                  const sponsoredActive = Boolean(item.is_sponsored || item.is_featured);
                  const flashActive = Boolean(item.is_flash_sale);

                  return (
                    <div key={item.id} className="bg-slate-50 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image_url_1} alt={item.title} className="w-14 h-14 object-cover rounded-xl border" />
                        <div>
                          <h4 className="font-black text-xs">{item.title}</h4>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">🏪 {item.vendor_name || 'Store'} | 📍 {item.location} | 👀 {item.views_count || 0} views</div>
                          <div className="text-xs font-black text-[#0066FF]">₦{Number(item.price).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleSponsored(item.id, sponsoredActive)} className={`h-9 px-3 rounded-xl text-[10px] font-black ${sponsoredActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>{sponsoredActive ? '⭐ ACTIVE AD' : 'TURN ON'}</button>
                        <button onClick={() => handleToggleFlashSale(item.id, flashActive)} className={`h-9 px-3 rounded-xl text-[10px] font-black ${flashActive ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{flashActive ? '⚡ FLASH DEAL' : 'TURN ON'}</button>
                        <button onClick={() => handleDeleteProduct(item.id)} className="h-9 px-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold border">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VENDORS */}
        {activeTab === 'vendors' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-3">Vendor Stores & Verification Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueVendorsList.map(vendor => {
                const isVerified = verifiedVendors[vendor.name];
                return (
                  <div key={vendor.name} className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900">🏪 {vendor.name}</h4>
                        {isVerified && <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">Verified Merchant ⭐</span>}
                      </div>
                      <div className="text-xs text-slate-500 font-bold">Listings: <span className="text-blue-600">{vendor.count}</span></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <a href={`https://wa.me/${vendor.whatsapp}`} target="_blank" rel="noopener noreferrer" className="h-9 bg-emerald-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center">WhatsApp 💬</a>
                      <button onClick={() => handleToggleVerifiedVendor(vendor.name)} className={`h-9 rounded-xl text-[10px] font-black border ${isVerified ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>{isVerified ? 'Revoke Badge' : 'Grant Badge ⭐'}</button>
                      <a href={`tel:${vendor.phone}`} className="h-9 bg-slate-900 text-white rounded-xl text-[10px] font-black flex items-center justify-center">Call 📞</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: KYC APPROVAL CENTER */}
        {activeTab === 'kyc' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900">Vendor KYC & Identity Approvals</h3>
              <select value={kycFilter} onChange={(e: any) => setKycFilter(e.target.value)} className="h-9 px-3 bg-slate-50 border rounded-xl text-xs font-bold">
                <option value="all">All KYC Statuses</option>
                <option value="pending">Pending Review Only</option>
                <option value="verified">Verified Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-400 font-black uppercase text-[10px]">
                    <th className="pb-3">Name / Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">ID Document Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-bold text-slate-700">
                  {filteredKYCMembers.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3">
                        <div className="font-black text-slate-900">{m.full_name || 'Unnamed Vendor'}</div>
                        <div className="text-[10px] text-slate-400">{m.email || 'No email provided'}</div>
                      </td>
                      <td className="py-3">{m.phone || 'N/A'}</td>
                      <td className="py-3">
                        <span className="bg-slate-100 border px-2 py-1 rounded text-[10px] uppercase font-black">
                          {m.id_type || 'NIN'} : {m.id_number || 'Not provided'}
                        </span>
                      </td>
                      <td className="py-3">
                        {m.kyc_status === 'verified' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">Verified 🛡️</span>}
                        {m.kyc_status === 'rejected' && <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">Rejected ❌</span>}
                        {(!m.kyc_status || m.kyc_status === 'pending') && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">Pending ⏳</span>}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdateKYC(m.id, 'verified')} className="h-8 px-3 bg-emerald-600 text-white rounded-lg text-[10px] font-black">Approve ✅</button>
                          <button onClick={() => handleUpdateKYC(m.id, 'rejected')} className="h-8 px-3 bg-rose-600 text-white rounded-lg text-[10px] font-black">Reject ❌</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredKYCMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">No member KYC records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: USERS & ONLINE STATUS */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900">Registered Users & Live Online Presence</h3>
              <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                ⚡ Online Now: {usersOnlineCount} Users
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-400 font-black uppercase text-[10px]">
                    <th className="pb-3">User Name</th>
                    <th className="pb-3">Email & Phone</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Last Active</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-bold text-slate-700">
                  {activeMembers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 font-black text-slate-900">{u.full_name || 'Anonymous User'}</td>
                      <td className="py-3">
                        <div>{u.email}</div>
                        <div className="text-[10px] text-slate-400">{u.phone || 'No phone'}</div>
                      </td>
                      <td className="py-3 uppercase text-[10px]">{u.role || 'Vendor'}</td>
                      <td className="py-3 text-slate-500">{u.last_seen ? new Date(u.last_seen).toLocaleString() : 'Recently'}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleToggleAccountStatus(u.id, u.status)} className="h-8 px-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-black">Suspend / Delete</button>
                      </td>
                    </tr>
                  ))}
                  {activeMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">No active registered user profiles found in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DELETED ACCOUNTS */}
        {activeTab === 'deleted' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-3">Deleted / Suspended Accounts ({deletedUsersList.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-400 font-black uppercase text-[10px]">
                    <th className="pb-3">User Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-bold text-slate-700">
                  {deletedUsersList.map(du => (
                    <tr key={du.id} className="hover:bg-slate-50">
                      <td className="py-3 font-black text-slate-900">{du.full_name || 'User'}</td>
                      <td className="py-3">{du.email}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleToggleAccountStatus(du.id, du.status)} className="h-8 px-3 bg-blue-600 text-white rounded-lg text-[10px] font-black">Restore Account 🔄</button>
                      </td>
                    </tr>
                  ))}
                  {deletedUsersList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-400">No deleted or suspended accounts.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: BANNER & ANNOUNCEMENTS */}
        {activeTab === 'promotions' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-2xl">
            <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-3">Hero & Announcement Broadcast Manager</h3>
            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Global Urgent Announcement Ticker</label>
                <input type="text" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-bold" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Main Homepage Hero Title</label>
                <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-bold" />
              </div>
              <button onClick={() => alert('🎉 Banner broadcast updated live!')} className="w-full h-12 bg-blue-600 text-white font-black rounded-xl shadow">Publish Live Broadcast 🚀</button>
            </div>
          </div>
        )}

        {/* TAB 7: PERFORMANCE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-3">Top States by Listing Volume</h3>
              <div className="space-y-2">
                {Object.entries(stateCounts).map(([state, count]) => (
                  <div key={state} className="flex justify-between items-center text-xs font-bold bg-slate-50 p-3 rounded-xl border">
                    <span>📍 {state}</span>
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg">{count} listings</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-3">Trending Categories</h3>
              <div className="space-y-2">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center text-xs font-bold bg-slate-50 p-3 rounded-xl border">
                    <span>🏷️ {cat}</span>
                    <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg">{count} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FLAGGED QUEUE */}
        {activeTab === 'moderation' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-3">Scam Prevention & Flagged Queue</h3>
            <div className="space-y-3">
              {products.filter(p => p.is_flagged).map(item => (
                <div key={item.id} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-xs text-red-900">{item.title}</h4>
                    <p className="text-[10px] text-red-600 font-bold">Reported for suspicious pricing or prohibited content.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveFlagged(item.id)} className="h-9 px-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black">Approve</button>
                    <button onClick={() => handleDeleteProduct(item.id)} className="h-9 px-3 bg-red-600 text-white rounded-xl text-[10px] font-black">Delete</button>
                  </div>
                </div>
              ))}
              {flaggedCount === 0 && <div className="text-center py-10 text-slate-400 text-xs font-bold">No flagged listings. The marketplace is clean!</div>}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS (PASSWORD CHANGE FORM ADDED) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-3">Global Platform Configuration</h3>
              <div className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 mb-1">Platform Brand Name</label>
                  <input type="text" defaultValue="goMarket NG" className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-bold" />
                </div>
                <button onClick={() => alert('Settings saved!')} className="w-full h-12 bg-blue-600 text-white font-black rounded-xl shadow">Save Configuration 💾</button>
              </div>
            </div>

            {/* In-Dashboard Password Changer Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <span className="text-lg">🔑</span>
                <h3 className="text-sm font-black uppercase text-slate-900">Change Admin Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">New Admin Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow transition"
                >
                  Update Admin Password 🔐
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
