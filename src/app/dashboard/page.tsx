'use client';

import React, { useEffect, useState } from 'react';
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
  whatsapp?: string;
  phone?: string;
  views_count?: number;
  created_at?: string;
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

export default function VendorDashboard() {
  const supabase = createClient();
  const [vendorName, setVendorName] = useState('Apex Gadgets NG');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Phones & Gadgets');
  const [location, setLocation] = useState('Lagos');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('2348012345678');
  const [phone, setPhone] = useState('2348012345678');

  // 5 Image Upload Slots
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(['', '', '', '', '']);
  const [uploading, setUploading] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchVendorInventory();
  }, []);

  async function fetchVendorInventory() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  }

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result as string;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !imageFiles[0]) {
      alert('Please provide a title, price, and at least the primary image.');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = ['', '', '', '', ''];
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i]) {
          uploadedUrls[i] = await convertFileToBase64(imageFiles[i]!);
        }
      }

      const { error } = await supabase.from('products').insert([
        {
          title,
          price: Number(price),
          category,
          location,
          description,
          vendor_name: vendorName,
          whatsapp,
          phone,
          image_url_1: uploadedUrls[0] || imagePreviews[0],
          image_url_2: uploadedUrls[1] || null,
          image_url_3: uploadedUrls[2] || null,
          image_url_4: uploadedUrls[3] || null,
          image_url_5: uploadedUrls[4] || null,
          is_available: true,
          views_count: 0
        }
      ]);

      if (error) throw error;

      alert('Product published successfully! 🚀');
      setTitle('');
      setPrice('');
      setDescription('');
      setImageFiles([null, null, null, null, null]);
      setImagePreviews(['', '', '', '', '']);
      fetchVendorInventory();
    } catch (err: any) {
      alert('Error publishing product: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditPrice(String(p.price));
    setEditCategory(p.category || 'Phones & Gadgets');
    setEditLocation(p.location || 'Lagos');
    setEditDescription(p.description || '');
    setEditWhatsapp(p.whatsapp || '2348012345678');
    setEditPhone(p.phone || '2348012345678');
  };

  // Save Edits
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: editTitle,
          price: Number(editPrice),
          category: editCategory,
          location: editLocation,
          description: editDescription,
          whatsapp: editWhatsapp,
          phone: editPhone
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      alert('Product updated successfully! ✅');
      setEditingProduct(null);
      fetchVendorInventory();
    } catch (err: any) {
      alert('Error updating product: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', id);

    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, is_available: !currentStatus } : p));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const copyStoreLink = () => {
    const url = `${window.location.origin}/vendor/${encodeURIComponent(vendorName)}`;
    navigator.clipboard.writeText(url);
    alert('Verified Store Link copied to clipboard! 📋');
  };

  const copyProductLink = (id: string) => {
    const url = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(url);
    alert('Product Link copied to clipboard! 📋');
  };

  const requestBoost = (boostType: 'Sponsored' | 'Flash Deal', productTitle: string) => {
    const adminWhatsApp = '2348012345678';
    const message = `Hello Admin, I am requesting a "${boostType}" boost for my product: "${productTitle}" on goMarket NG. Please review my store (${vendorName}).`;
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-950 pb-24">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🛒</span>
            <div>
              <h1 className="text-base font-black tracking-tight">goMarket <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">NG</span></h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Vendor Command Dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={copyStoreLink}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-1.5"
            >
              📋 Copy Store Link
            </button>
            <Link href="/" className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center border border-slate-700">
              ← Marketplace
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Vendor Identity & Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Store Identity</div>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full h-11 bg-slate-50 border p-3 rounded-xl font-black text-slate-900 text-sm"
              placeholder="Your Store / Brand Name"
            />
            <p className="text-[10px] text-slate-500 font-bold">All your listings will be branded under this store name.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Active Listings</div>
            <div className="text-4xl font-black text-[#0066FF]">{products.length}</div>
            <div className="text-[10px] text-emerald-600 font-black">Zero-commission P2P model active ✅</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Store Views</div>
            <div className="text-4xl font-black text-slate-900">
              {products.reduce((acc, p) => acc + (p.views_count || 0), 0)}
            </div>
            <div className="text-[10px] text-slate-400 font-bold">Tracked across all product impressions</div>
          </div>
        </div>

        {/* Create Listing Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Post New Product (Up to 5 Photo Angles) 📸</h2>
            <p className="text-xs text-slate-500 mt-1">Upload multiple photos from your device to give buyers complete visibility.</p>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Max 256GB"
                  className="w-full h-12 bg-slate-50 border p-3 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Price (₦)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="450000"
                  className="w-full h-12 bg-slate-50 border p-3 rounded-xl text-xs font-bold text-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 bg-slate-50 border p-3 rounded-xl text-xs font-bold"
                >
                  <option value="Phones & Gadgets">Phones & Gadgets</option>
                  <option value="Laptops & Computers">Laptops & Computers</option>
                  <option value="Fashion & Wearables">Fashion & Wearables</option>
                  <option value="Home & Appliances">Home & Appliances</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">State Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-12 bg-slate-50 border p-3 rounded-xl text-xs font-bold"
                >
                  {NIGERIAN_STATES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="2348012345678"
                  className="w-full h-12 bg-slate-50 border p-3 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Direct Call Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="2348012345678"
                  className="w-full h-12 bg-slate-50 border p-3 rounded-xl text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe condition, battery health, accessories included, pickup or delivery options..."
                className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-medium"
              />
            </div>

            {/* 5 Image Upload Slots */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">Upload Product Images (Up to 5 Photos)</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="border-2 border-dashed border-slate-200 rounded-2xl p-2 flex flex-col items-center justify-center relative bg-slate-50 h-32 overflow-hidden">
                    {imagePreviews[idx] ? (
                      <img src={imagePreviews[idx]} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center text-[10px] text-slate-400 font-bold">
                        <span>📷</span>
                        <p>Photo {idx + 1} {idx === 0 ? '(Main)' : ''}</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(idx, e)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition"
            >
              {uploading ? 'Publishing Listing...' : 'Publish Product to Marketplace 🚀'}
            </button>
          </form>
        </div>

        {/* Inventory Management Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">Your Inventory ({products.length})</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => {
              const isAvailable = product.is_available !== false;
              return (
                <div key={product.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="w-full h-48 bg-slate-100 rounded-2xl overflow-hidden relative border">
                    <img src={product.image_url_1} alt={product.title} className="w-full h-full object-cover" />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full">SOLD OUT ❌</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">📍 {product.location} • 👁️ {product.views_count || 0} views</div>
                    <h3 className="font-black text-xs text-slate-900 line-clamp-1">{product.title}</h3>
                    <div className="text-sm font-black text-[#0066FF]">₦{Number(product.price).toLocaleString()}</div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => openEditModal(product)}
                        className="h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black border border-blue-200"
                      >
                        Edit ✏️
                      </button>
                      <button
                        onClick={() => toggleAvailability(product.id, isAvailable)}
                        className={`h-9 rounded-xl text-[10px] font-black ${isAvailable ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
                      >
                        {isAvailable ? 'Sold 🏷️' : 'Available ✅'}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black border border-rose-200"
                      >
                        Delete 🗑️
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => requestBoost('Sponsored', product.title)}
                        className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-black border border-slate-300"
                      >
                        Boost Sponsored ⚡
                      </button>
                      <button
                        onClick={() => requestBoost('Flash Deal', product.title)}
                        className="h-9 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-[10px] font-black border border-purple-200"
                      >
                        Boost Flash Deal 🔥
                      </button>
                    </div>

                    <button
                      onClick={() => copyProductLink(product.id)}
                      className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black shadow-xs flex items-center justify-center gap-1.5"
                    >
                      🔗 Share Product Link
                    </button>
                  </div>
                </div>
              );
            })}

            {products.length === 0 && !loading && (
              <div className="col-span-full text-center py-16 text-slate-400 text-xs font-bold">
                You have no products listed yet. Fill out the form above to post your first item!
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">Edit Listing Details ✏️</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">✕ Close</button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Price (₦)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full h-11 bg-slate-50 border p-3 rounded-xl text-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full h-11 bg-slate-50 border p-3 rounded-xl"
                  >
                    <option value="Phones & Gadgets">Phones & Gadgets</option>
                    <option value="Laptops & Computers">Laptops & Computers</option>
                    <option value="Fashion & Wearables">Fashion & Wearables</option>
                    <option value="Home & Appliances">Home & Appliances</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Services">Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">State Location</label>
                  <select
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full h-11 bg-slate-50 border p-3 rounded-xl"
                  >
                    {NIGERIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full h-11 bg-slate-50 border p-3 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-11 bg-slate-50 border p-3 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border p-3 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={savingEdit}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md uppercase"
              >
                {savingEdit ? 'Saving Changes...' : 'Update Listing ✅'}
              </button>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
