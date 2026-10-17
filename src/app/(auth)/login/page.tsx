'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
    const syntheticEmail = `phone_${cleanPhone}@gomarket.ng`;

    const { error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });

    if (error) {
      setErrorMsg('Invalid WhatsApp phone number or password.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-900">
      <div className="bg-[#0066FF] text-white text-[11px] font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
        <span className="bg-white/20 text-white text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider">
          SELLER PORTAL
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
            Vendor & Storefront Sign In
          </p>
        </div>

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 space-y-5">
          <div className="space-y-1 text-center sm:text-left border-b border-slate-100 pb-4">
            <h1 className="text-xl font-black text-slate-900">Sign in with WhatsApp</h1>
            <p className="text-xs text-slate-500">
              Enter your WhatsApp phone number and password to manage your store.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WHATSAPP PHONE NUMBER
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In to Store 🚀'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have a store account yet?{' '}
            <Link href="/register" className="text-[#0066FF] font-bold hover:underline">
              Create Store
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
