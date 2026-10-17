'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NIGERIAN_STATES = [
  'Lagos', 'Abuja (FCT)', 'Rivers (Port Harcourt)', 'Oyo (Ibadan)',
  'Kano', 'Anambra', 'Edo', 'Delta', 'Ogun', 'Enugu', 'Kaduna', 'Akwa Ibom'
];

const STORE_CATEGORIES = [
  { label: 'Auctions & Bidding', emoji: '🏷️' },
  { label: 'Cars & Vehicles', emoji: '🏎️' },
  { label: 'Bikes & Tricycles', emoji: '🛵' },
  { label: 'Houses & Apartments', emoji: '🏠' },
  { label: 'Land & Plots', emoji: '🏞️' },
  { label: 'Phones & Gadgets', emoji: '📱' },
  { label: 'Laptops & Tech', emoji: '💻' },
  { label: 'Food Stuff', emoji: '🥖' },
  { label: 'Fashion & Apparel', emoji: '👔' },
  { label: 'General Merchandise', emoji: '📦' },
];

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [storeName, setStoreName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [category, setCategory] = useState(STORE_CATEGORIES[0].label);
  const [stateRegion, setStateRegion] = useState(NIGERIAN_STATES[0]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Format phone into a synthetic Supabase email for auth tracking
    const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
    const syntheticEmail = `phone_${cleanPhone}@gomarket.ng`;

    const { error } = await supabase.auth.signUp({
      email: syntheticEmail,
      password,
      options: {
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
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-900">
      <div className="bg-[#0066FF] text-white text-[11px] font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
        <span className="bg-white/20 text-white text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider">
          REGISTER STORE
        </span>
        <span>Over 140+ buyers currently chatting directly with verified vendors across Nigeria</span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 my-6">
        <div className="mb-6 text-center space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span>
            <span className="text-2xl font-black tracking-tight text-[#0066FF]">
              goMarket
            </span>
          </Link>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verified Vendor Registration
          </p>
        </div>

        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 space-y-5">
          <div className="space-y-1 text-center sm:text-left border-b border-slate-100 pb-4">
            <h1 className="text-xl font-black text-slate-900">Start Selling on goMarket</h1>
            <p className="text-xs text-slate-500">
              Set up your storefront with your WhatsApp phone number and password.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                STORE / BUSINESS NAME
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Ella's Boutique"
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WHATSAPP PHONE NUMBER (FOR BUYER CHATS)
              </label>
              <input
                type="tel"
                required
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PRIMARY CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                >
                  {STORE_CATEGORIES.map((cat) => (
                    <option key={cat.label} value={cat.label}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  LOCATION (STATE)
                </label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      📍 {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Store...' : 'Create Storefront 🛒'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have a store account?{' '}
            <Link href="/login" className="text-[#0066FF] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 border-t border-slate-200 bg-white text-[11px] text-slate-500 font-medium">
        goMarket Marketplace Platform • Direct Vendor Chat & Ad Engine
      </footer>
    </div>
  );
}
