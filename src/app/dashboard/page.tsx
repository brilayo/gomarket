'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price_kobo: number;
  image_url?: string;
  clicks?: number;
  slug?: string;
  description?: string;
}

export default function VendorDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [priceNaira, setPriceNaira] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const storeName = "Ella's Boutique";
  const storeSlug = "/s/ella-s-boutique-0336";

  useEffect(() => {
    fetchVendorData();
  }, []);

  async function fetchVendorData() {
    try {
      const { data } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle('');
    setPriceNaira('');
    setImageUrl('');
    setDescription('');
    setEditingProduct(null);
  }

  function handleOpenEdit(product: Product) {
    setEditingProduct(product);
    setTitle(product.title || '');
    setPriceNaira(product.price_kobo ? (product.price_kobo / 100).toString() : '');
    setImageUrl(product.image_url || '');
    setDescription(product.description || '');
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const price_kobo = Math.round(Number(priceNaira) * 100);

    if (editingProduct) {
      // Update existing item
      const { error } = await supabase
        .from('items')
        .update({
          title,
          price_kobo,
          image_url: imageUrl,
          description,
        })
        .eq('id', editingProduct.id);

      if (!error) {
        resetForm();
        fetchVendorData();
      } else {
        alert('Error updating product: ' + error.message);
      }
    } else {
      // Create new item
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
      const { error } = await supabase.from('items').insert([
        {
          title,
          price_kobo,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          description,
          slug,
          clicks: 0,
        },
      ]);

      if (!error) {
        setIsAddModalOpen(false);
        resetForm();
        fetchVendorData();
      } else {
        alert('Error adding product: ' + error.message);
      }
    }

    setSubmitting(false);
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await supabase.from('items').delete().eq('id', id);
    if (editingProduct?.id === id) resetForm();
    fetchVendorData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  function handleCopyLink(product: Product) {
    const targetPath = product.slug ? `/item/${product.slug}` : `/item/${product.id}`;
    const productUrl = `${window.location.origin}${targetPath}`;
    
    navigator.clipboard.writeText(productUrl);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getProductImage(item: Product) {
    if (item.image_url && item.image_url.trim().length > 5) {
      return item.image_url;
    }
    return `https://picsum.photos/seed/${item.id}/300/300`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-bold text-slate-500">
        Loading Seller Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 flex flex-col font-sans">
      {/* Navbar Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <a href="/" className="text-lg font-black tracking-tight text-[#0066FF]">
            goMarket
          </a>
          <span className="text-[10px] font-black uppercase bg-blue-50 text-[#0066FF] px-2 py-0.5 rounded">
            Seller Portal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center"
          >
            View Marketplace ↗
          </a>
          <button
            onClick={handleLogout}
            className="h-9 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Store Profile Branding Banner */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏪</span>
              <h2 className="text-xl font-black text-slate-900">{storeName}</h2>
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">
                Verified Store
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Store URL: <span className="text-[#0066FF] font-medium">{storeSlug}</span>
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="h-10 px-4 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            + Add New Product
          </button>
        </div>

        {/* Products Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              YOUR PRODUCTS ({products.length} ITEMS)
            </h3>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-2 shadow-xs">
              <p className="text-xs text-slate-500">No products listed in your store yet.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="h-9 px-4 bg-[#0066FF] text-white text-xs font-bold rounded-xl"
              >
                Create First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 hover:border-[#0066FF] p-2.5 rounded-xl shadow-xs transition-all flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1.5">
                    <div className="relative w-full h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                      <img
                        src={getProductImage(item)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 right-1.5 text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                        ACTIVE
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs font-black text-[#0066FF] mt-0.5">
                        ₦{(item.price_kobo / 100).toLocaleString('en-NG')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span title="Total buyer clicks/views">👁️ {item.clicks || 0} views</span>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-[#0066FF] font-black hover:underline"
                      >
                        Edit ✏️
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyLink(item)}
                      className={`w-full h-7 text-[10px] font-bold rounded-md transition-all flex items-center justify-center ${
                        copiedId === item.id
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {copiedId === item.id ? '✓ Copied!' : 'Copy Link 🔗'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal: Add or Edit Product */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PRODUCT TITLE
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nike Air Max 270"
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PRICE (₦)
                </label>
                <input
                  type="number"
                  required
                  value={priceNaira}
                  onChange={(e) => setPriceNaira(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  IMAGE URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste direct product image link"
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Item details, condition, size, color..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(editingProduct.id)}
                    className="h-10 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all"
                  >
                    Delete 🗑️
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="h-10 px-4 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-10 px-5 bg-[#0066FF] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
                  >
                    {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product 🚀'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
