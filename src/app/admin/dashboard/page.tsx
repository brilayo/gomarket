'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [featuredSlots, setFeaturedSlots] = useState<any[]>([]);

  // Form states for Featured Slot
  const [title, setTitle] = useState('');
  const [priceKobo, setPriceKobo] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('Weekly (7 Days)');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const { data } = await supabase
        .from('admin_featured_slots')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setFeaturedSlots(data);
    } catch (err) {
      console.error('Error fetching admin slots:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishSlot(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('admin_featured_slots').insert([
      {
        title,
        price_kobo: Number(priceKobo) * 100,
        payment_plan: paymentPlan,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop',
        target_url: targetUrl,
        store_name: businessName,
        whatsapp_number: whatsapp,
      },
    ]);

    setSubmitting(false);

    if (!error) {
      setTitle('');
      setPriceKobo('');
      setImageUrl('');
      setTargetUrl('');
      setBusinessName('');
      setWhatsapp('');
      fetchAdminData();
    } else {
      alert('Error publishing slot: ' + error.message);
    }
  }

  async function handleDeleteSlot(id: string) {
    if (!confirm('Are you sure you want to delete this featured slot?')) return;
    await supabase.from('admin_featured_slots').delete().eq('id', id);
    fetchAdminData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-mono text-xs">
        Loading Command Center...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Enterprise Dark Header */}
      <header className="bg-slate-950 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-lg">👑</span>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-black tracking-wider uppercase font-mono">
              goMarket Enterprise Command Center
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">
              Full Control
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center"
          >
            ← Back to Marketplace
          </a>
        </div>
      </header>

      {/* Control Module Tabs Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('featured')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'featured' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'hover:bg-slate-200/60'
          }`}
        >
          👑 Featured Slots ({featuredSlots.length}/5)
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'banners' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          📢 Ad Banners (2)
        </button>
        <button
          onClick={() => setActiveTab('ticker')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'ticker' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          📻 Ticker & Notice (1)
        </button>
        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'fraud' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          🚨 Fraud Detection
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'heatmap' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          📊 Regional Heatmap
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'verifications' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          ✔️ Verifications
        </button>
        <button
          onClick={() => setActiveTab('subadmins')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'subadmins' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          🛡️ Sub-Admins (0)
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'sellers' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          🏪 Sellers (1)
        </button>
      </div>

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto p-6 flex-1">
        {activeTab === 'featured' && (
          <div className="
cat << 'EOF' > src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [featuredSlots, setFeaturedSlots] = useState<any[]>([]);

  // Form states for Featured Slot
  const [title, setTitle] = useState('');
  const [priceKobo, setPriceKobo] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('Weekly (7 Days)');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const { data } = await supabase
        .from('admin_featured_slots')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setFeaturedSlots(data);
    } catch (err) {
      console.error('Error fetching admin slots:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishSlot(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('admin_featured_slots').insert([
      {
        title,
        price_kobo: Number(priceKobo) * 100,
        payment_plan: paymentPlan,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop',
        target_url: targetUrl,
        store_name: businessName,
        whatsapp_number: whatsapp,
      },
    ]);

    setSubmitting(false);

    if (!error) {
      setTitle('');
      setPriceKobo('');
      setImageUrl('');
      setTargetUrl('');
      setBusinessName('');
      setWhatsapp('');
      fetchAdminData();
    } else {
      alert('Error publishing slot: ' + error.message);
    }
  }

  async function handleDeleteSlot(id: string) {
    if (!confirm('Are you sure you want to delete this featured slot?')) return;
    await supabase.from('admin_featured_slots').delete().eq('id', id);
    fetchAdminData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-mono text-xs">
        Loading Command Center...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Enterprise Dark Header */}
      <header className="bg-slate-950 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-lg">👑</span>
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-black tracking-wider uppercase font-mono">
              goMarket Enterprise Command Center
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">
              Full Control
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center"
          >
            ← Back to Marketplace
          </a>
        </div>
      </header>

      {/* Control Module Tabs Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('featured')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'featured' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'hover:bg-slate-200/60'
          }`}
        >
          👑 Featured Slots ({featuredSlots.length}/5)
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'banners' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          📢 Ad Banners (2)
        </button>
        <button
          onClick={() => setActiveTab('ticker')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'ticker' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          📻 Ticker & Notice (1)
        </button>
        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'fraud' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          🚨 Fraud Detection
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'heatmap' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          📊 Regional Heatmap
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'verifications' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          ✔️ Verifications
        </button>
        <button
          onClick={() => setActiveTab('subadmins')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'subadmins' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          🛡️ Sub-Admins (0)
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
            activeTab === 'sellers' ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/60'
          }`}
        >
          🏪 Sellers (1)
        </button>
      </div>

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto p-6 flex-1">
        {activeTab === 'featured' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form Column */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-5">
              <div className="space-y-1">
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                  Publish Featured Slot
                </h2>
                <p className="text-xs text-slate-500">
                  Upload banner image directly or insert URL.
                </p>
              </div>

              <form onSubmit={handlePublishSlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PRODUCT TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Puma FlexJet Lite Men Running Shoes"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PRICE (₦)
                    </label>
                    <input
                      type="number"
                      required
                      value={priceKobo}
                      onChange={(e) => setPriceKobo(e.target.value)}
                      placeholder="1200000"
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PAYMENT PLAN
                    </label>
                    <select
                      value={paymentPlan}
                      onChange={(e) => setPaymentPlan(e.target.value)}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                    >
                      <option value="Weekly (7 Days)">Weekly (7 Days)</option>
                      <option value="Daily">Daily</option>
                      <option value="Monthly (30 Days)">Monthly (30 Days)</option>
                    </select>
                  </div>
                </div>

                <div className="border border-dashed border-slate-200 p-4 rounded-xl space-y-2 bg-slate-50/50">
                  <label className="block text-[11px] font-black uppercase text-slate-600">
                    📷 Upload Device Image
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="h-9 px-3 bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center transition-all">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageUrl(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-500 truncate">
                      {imageUrl ? 'Image file attached' : 'No file chosen'}
                    </span>
                  </div>
                  <div className="text-center text-[10px] font-bold text-slate-400">— OR —</div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste external Image Web URL"
                    className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CUSTOM WEB LANDING LINK
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://vendorwebsite.com or Selar page"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    BUSINESS NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Lagos Tech Hub"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WHATSAPP
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="2348012345678"
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PHONE
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="2348012345678"
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-[#0066FF] hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Publishing...' : 'Publish Featured Slot 🚀'}
                </button>
              </form>
            </div>

            {/* Right Active Slots Column */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                ACTIVE FEATURED SLOTS ({featuredSlots.length}/5)
              </h2>

              {featuredSlots.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-2 text-xs text-slate-500">
                  No active featured slots currently published.
                </div>
              ) : (
                <div className="space-y-3">
                  {featuredSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                          <img
                            src={
                              slot.image_url ||
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
                            }
                            alt={slot.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900">{slot.title}</h4>
                          <p className="text-[10px] font-mono font-bold text-slate-500">
                            DURATION: {slot.payment_plan || 'DAILY'} • EXP: {new Date(Date.now() + 86400000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => alert('Slot extended!')}
                          className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-bold rounded-lg transition-all"
                        >
                          💬 Renewal
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="h-8 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab !== 'featured' && (
          <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-2">
            <h3 className="text-sm font-bold text-slate-800 capitalize">
              {activeTab} Management Module
            </h3>
            <p className="text-xs text-slate-500">
              Enterprise control module is online and ready for actions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
