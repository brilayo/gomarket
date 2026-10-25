'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NIGERIAN_STATES = [
  { name: 'Abia', emoji: '🌴' },
  { name: 'Adamawa', emoji: '⛰️' },
  { name: 'Akwa Ibom', emoji: '🛢️' },
  { name: 'Anambra', emoji: '⚡' },
  { name: 'Bauchi', emoji: '🦁' },
  { name: 'Bayelsa', emoji: '🌊' },
  { name: 'Benue', emoji: '🌾' },
  { name: 'Borno', emoji: '🐪' },
  { name: 'Cross River', emoji: '🌿' },
  { name: 'Delta', emoji: '💧' },
  { name: 'Ebonyi', emoji: '🍚' },
  { name: 'Edo', emoji: '👑' },
  { name: 'Ekiti', emoji: '📚' },
  { name: 'Enugu', emoji: '⛏️' },
  { name: 'FCT - Abuja', emoji: '🏛️' },
  { name: 'Gombe', emoji: '💎' },
  { name: 'Imo', emoji: '🌴' },
  { name: 'Jigawa', emoji: '🏜️' },
  { name: 'Kaduna', emoji: '🧶' },
  { name: 'Kano', emoji: '🧵' },
  { name: 'Katsina', emoji: '🐎' },
  { name: 'Kebbi', emoji: '🌾' },
  { name: 'Kogi', emoji: '🛶' },
  { name: 'Kwara', emoji: '🐂' },
  { name: 'Lagos', emoji: '🌆' },
  { name: 'Nasarawa', emoji: '⛏️' },
  { name: 'Niger', emoji: '⚡' },
  { name: 'Ogun', emoji: '🪨' },
  { name: 'Ondo', emoji: '🍫' },
  { name: 'Osun', emoji: '🕊️' },
  { name: 'Oyo', emoji: '🏛️' },
  { name: 'Plateau', emoji: '⛰️' },
  { name: 'Rivers', emoji: '🚢' },
  { name: 'Sokoto', emoji: '🕌' },
  { name: 'Taraba', emoji: '🌳' },
  { name: 'Yobe', emoji: '🌅' },
  { name: 'Zamfara', emoji: '🌾' }
];

const CATEGORIES = [
  { name: 'Phones & Tablets', emoji: '📱' },
  { name: 'Laptops & Computers', emoji: '💻' },
  { name: 'Clothing & Wearables', emoji: '👕' },
  { name: 'Shoes & Footwear', emoji: '👟' },
  { name: 'Food, Groceries & Drinks', emoji: '🍲' },
  { name: 'Furniture & Interior', emoji: '🛋️' },
  { name: 'Cars & Vehicles', emoji: '🏎️' },
  { name: 'Real Estate & Housing', emoji: '🏠' },
  { name: 'Home Appliances & Kitchen', emoji: '🍳' },
  { name: 'Beauty, Skincare & Makeup', emoji: '✨' },
  { name: 'Health, Wellness & Pharmacy', emoji: '💊' },
  { name: 'Agriculture & Farm Produce', emoji: '🌾' },
  { name: 'Baby, Kids & Toys', emoji: '🧸' },
  { name: 'Sports, Fitness & Gym', emoji: '⚽' },
  { name: 'Books, Stationery & Education', emoji: '📚' },
  { name: 'Gaming, Consoles & VR', emoji: '🎮' },
  { name: 'Services, Repairs & Agency', emoji: '🛠️' },
  { name: 'General Merchandise', emoji: '📦' }
];

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [storeName, setStoreName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [stateRegion, setStateRegion] = useState('Lagos');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Sign up with email redirect disabled to prevent triggering outgoing emails
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard',
        data: {
          store_name: storeName,
          whatsapp_phone: whatsappPhone,
          category,
          state_region: stateRegion,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Immediately sign in to establish the session
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-2">
          <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span>
          <span className="text-2xl font-black tracking-tight text-[#0066FF]">goMarket</span>
        </Link>
        <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Create Vendor Storefront
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleRegister}>
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Jazzy Gadgets Store"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">WhatsApp Phone</label>
                <input
                  type="text"
                  required
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="08030000000"
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">State / Region</label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st.name} value={st.name}>
                      {st.emoji} {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Store Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address (for login)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@email.com"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 pr-16 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-[11px] font-bold"
                >
                  {showPassword ? 'Hide 👁️' : 'Show 👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating Store...' : 'Create Storefront 🚀'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have a store account?{' '}
              <Link href="/login" className="font-bold text-[#0066FF] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
