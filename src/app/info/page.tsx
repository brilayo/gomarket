'use client';

import React from 'react';
import Link from 'next/link';

export default function InfoCenterPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🛒</span>
            <div>
              <h1 className="text-base font-black tracking-tight">goMarket <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">NG</span></h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Legal Framework & Help Center</p>
            </div>
          </Link>
          <Link href="/" className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center border border-slate-700 transition">
            ← Back to Marketplace
          </Link>
        </div>
      </header>

      {/* Legal Hero Banner */}
      <section className="bg-slate-950 text-white py-12 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
            Standard Legal & Operational Policies
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">goMarket NG Legal & Resource Hub</h1>
          <p className="text-xs text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Standardized operational policies designed to protect buyers, verified merchants, and platform infrastructure under Nigerian peer-to-peer commerce laws.
          </p>

          {/* Jump Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs font-bold">
            <a href="#about" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition">About Us</a>
            <a href="#terms" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition">Terms of Service</a>
            <a href="#safety" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition">Safety Protocol 🛡️</a>
            <a href="#privacy" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition">Privacy Policy</a>
            <a href="#careers" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition">Careers 💼</a>
            <a href="#contact" className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl text-white transition">Support 📞</a>
          </div>
        </div>
      </section>

      {/* Main Legal Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        
        {/* 1. ABOUT US */}
        <section id="about" className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2 text-blue-600 font-black text-xl border-b pb-3">
            <span>🏪</span>
            <h2>1. About goMarket NG</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            goMarket NG is a specialized peer-to-peer (P2P) merchant directory and technological facilitator operating within the Federal Republic of Nigeria. Our infrastructure enables verified independent sellers, retail traders, and local businesses to create digital storefronts and list merchandise. We provide technological bridging that allows direct communication between prospective buyers and sellers via call and encrypted messaging protocols.
          </p>
        </section>

        {/* 2. TERMS & CONDITIONS (LEGALLY CONSTRUCTIVE FRAMEWORK) */}
        <section id="terms" className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-5 scroll-mt-24">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xl border-b pb-3">
            <span>📜</span>
            <h2>2. Terms of Service & Liability Framework</h2>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm">2.1 Marketplace Facilitator Status (No Escrow or Payment Processing)</h3>
              <p>
                goMarket NG operates strictly as a technological listing platform and advertising directory. Unless expressly indicated under a written corporate guarantee, goMarket NG does not hold escrow funds, take possession of physical inventory, manage banking transactions, or guarantee off-platform money transfers between buyers and sellers.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm">2.2 Merchant Warranties & Product Declarations</h3>
              <p>
                By publishing a listing on goMarket NG, vendors warrant and represent that:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
                <li>They hold full legal title and unencumbered ownership of all listed products.</li>
                <li>Product images uploaded represent the exact, genuine physical item being offered.</li>
                <li>Items sold comply with Nigerian Consumer Protection regulations and do not infringe on third-party trademarks or copyrights.</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm">2.3 Limitation of Liability</h3>
              <p>
                Under no circumstances shall goMarket NG, its founders, operators, or technical affiliates be liable for any indirect, incidental, punitive, or consequential damages resulting from off-platform transactions, non-delivery of goods, defective merchandise, or financial misrepresentation committed by independent third-party users.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm">2.4 Prohibited Items & Anti-Fraud Zero Tolerance</h3>
              <p>
                Listing stolen property, counterfeit goods, unregistered financial instruments, firearms, illegal narcotics, or fraudulent services is strictly prohibited. Violation results in permanent hardware/IP account ban, removal of listings, and immediate reporting to law enforcement authorities (EFCC / NPF).
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm">2.5 Governing Law & Dispute Resolution</h3>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any legal proceedings arising from platform infrastructure shall be submitted to mediation in Lagos State, Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* 3. SAFETY PROTOCOL */}
        <section id="safety" className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2 text-amber-600 font-black text-xl border-b pb-3">
            <span>🛡️</span>
            <h2>3. Buyer & Seller Safety Guidelines</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            To maintain a high-trust peer-to-peer ecosystem, all platform participants must adhere to standard physical trade verification procedures:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 pt-2">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
              <h3 className="font-black text-sm text-amber-900 uppercase">Buyer Safety Mandate 🛍️</h3>
              <ul className="space-y-1.5 leading-relaxed text-amber-800 font-medium">
                <li>• <strong>Physical Inspection First:</strong> Do not transfer advance payments, reservation fees, or waybill charges prior to physical inspection.</li>
                <li>• <strong>Public Verification Venues:</strong> Conduct physical handovers exclusively in populated public areas (e.g. shopping centers, plazas, fuel station premises).</li>
                <li>• <strong>Gadget Diagnostics:</strong> Verify IMEI codes, cloud locks, battery health, and operational status prior to concluding cash or transfer payments.</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-2">
              <h3 className="font-black text-sm text-blue-900 uppercase">Merchant Protection Mandate 🏪</h3>
              <ul className="space-y-1.5 leading-relaxed text-blue-800 font-medium">
                <li>• <strong>In-App Bank Alert Verification:</strong> Verify incoming credit alerts directly inside your official banking mobile app rather than relying on SMS alerts or buyer receipts.</li>
                <li>• <strong>Waybill Dispatch Protocol:</strong> Retain logistics receipts and dispatch rider phone numbers for interstate deliveries.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. PRIVACY POLICY */}
        <section id="privacy" className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2 text-emerald-600 font-black text-xl border-b pb-3">
            <span>🔒</span>
            <h2>4. Privacy & Data Handling Policy</h2>
          </div>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>4.1 Data Minimization:</strong> goMarket NG collects only essential operational data required to publish storefronts (vendor name, contact numbers, general location, and listing media).
            </p>
            <p>
              <strong>4.2 Public Directory Consent:</strong> By registering as a vendor, merchants explicitly consent to displaying their business phone number and location on public product cards to allow prospective buyers to initiate trade contact.
            </p>
            <p>
              <strong>4.3 Third-Party Protection:</strong> We do not sell, license, or lease user databases to third-party ad networks or data brokers.
            </p>
          </div>
        </section>

        {/* 5. CAREERS */}
        <section id="careers" className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2 text-purple-600 font-black text-xl border-b pb-3">
            <span>💼</span>
            <h2>5. Careers & Regional Expansion</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            goMarket NG is expanding its regional merchant acquisition and field verification team across Lagos, Abuja, Port Harcourt, Ibadan, and Kano. We welcome applications for merchant onboarding agents, field quality assurance officers, and regional community leads.
          </p>
          <div className="pt-2">
            <a href="mailto:careers@gomarket.ng" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow transition">
              Send CV / Inquiries: careers@gomarket.ng ✉️
            </a>
          </div>
        </section>

        {/* 6. CONTACT & ABUSE REPORTING */}
        <section id="contact" className="bg-slate-900 text-white rounded-3xl p-8 shadow-md space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2 font-black text-xl border-b border-slate-800 pb-3">
            <span>📞</span>
            <h2>6. Platform Support & Legal Compliance Desk</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            For platform support, listing updates, or reporting suspicious activities/listing takedown requests:
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a href="mailto:support@gomarket.ng" className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow">
              ✉️ Email Desk: support@gomarket.ng
            </a>
            <a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow">
              💬 Direct Legal / Compliance Desk
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 border-t border-slate-800 py-8 text-center text-xs font-bold">
        <div>&copy; {currentYear} goMarket Nigeria. All rights reserved. Peer-to-peer commerce directory.</div>
      </footer>
    </div>
  );
}
