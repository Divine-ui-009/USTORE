import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, X, ArrowLeft } from "lucide-react";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../services/productService";

const CATS  = ["MEN", "WOMEN", "KIDS", "SPORTS", "OTHER"];
const EMPTY = { name: "", description: "", price: "", quantity: "", imageUrl: "", category: "OTHER", isAvailable: true };

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const load = () => {
    setLoading(true);
    getProducts()
      .then(r => setProducts(r.data))
      .catch(() => setError("Could not reach API. Is Spring Boot running?"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY); setModal(true); setError(""); }
  function openEdit(p) {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description ?? "", price: p.price, quantity: p.quantity, imageUrl: p.imageUrl ?? "", category: p.category, isAvailable: p.isAvailable ?? true });
    setModal(true); setError("");
  }

  function handle(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function save(e) {
    e.preventDefault(); setSaving(true); setError("");
    const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity, 10) };
    try {
      editing ? await updateProduct(editing, payload) : await addProduct(payload);
      setModal(false); load();
    } catch { setError("Save failed. Check all fields."); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm("Delete this product?")) return;
    try { await deleteProduct(id); load(); }
    catch { setError("Delete failed."); }
  }

  const fmt = v => `$${Number(v ?? 0).toFixed(2)}`;
  const field = "flex flex-col gap-1";
  const label = "text-[10px] font-bold uppercase tracking-widest text-muted";
  const input = "bg-sand border border-border rounded-xl px-4 py-2.5 text-sm text-brand focus:outline-none focus:border-brand transition-colors";

  return (
    <div className="min-h-screen bg-sand font-sans">

      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors">
              <ArrowLeft size={17} /> Home
            </Link>
            <span className="text-xl font-bold tracking-widest text-brand">USTORE Admin</span>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-neutral-800 transition-colors">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-brand">Product Management</h1>
          <p className="text-sm text-muted mt-1">{products.length} product{products.length !== 1 ? "s" : ""} in database</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24 text-muted">
            <div className="w-9 h-9 border-2 border-border border-t-brand rounded-full animate-spin" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-4xl p-16 text-center shadow-card">
            <h2 className="font-display text-2xl font-bold mb-2">No products yet</h2>
            <p className="text-muted text-sm">Click "Add Product" to create your first one.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-card overflow-auto">
            <table className="w-full border-collapse">
              <thead className="border-b border-border">
                <tr>
                  {["Product", "Category", "Price", "Qty", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-sand transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80"}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl shrink-0"
                          onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80"; }}
                        />
                        <div>
                          <p className="font-semibold text-sm text-brand">{p.name}</p>
                          <p className="text-xs text-muted truncate max-w-[180px]">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-stone text-muted px-2.5 py-1 rounded-full">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-sm text-brand">{fmt(p.price)}</td>
                    <td className="px-5 py-4 text-sm text-muted">{p.quantity}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full
                        ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-muted hover:bg-brand hover:text-white hover:border-brand transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => del(p.id)}
                          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-4xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-brand">
                {editing ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={() => setModal(false)} className="text-muted hover:text-brand transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
            )}

            <form onSubmit={save} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className={field}>
                  <label className={label}>Name *</label>
                  <input name="name" required value={form.name} onChange={handle} placeholder="Product name" className={input} />
                </div>
                <div className={field}>
                  <label className={label}>Category *</label>
                  <select name="category" value={form.category} onChange={handle} className={input}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className={field}>
                <label className={label}>Description</label>
                <textarea name="description" rows={2} value={form.description} onChange={handle} placeholder="Short description" className={`${input} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={field}>
                  <label className={label}>Price *</label>
                  <input name="price" type="number" step="0.01" min="0" required value={form.price} onChange={handle} placeholder="0.00" className={input} />
                </div>
                <div className={field}>
                  <label className={label}>Quantity *</label>
                  <input name="quantity" type="number" min="0" required value={form.quantity} onChange={handle} placeholder="0" className={input} />
                </div>
              </div>

              <div className={field}>
                <label className={label}>Image URL</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handle} placeholder="https://…" className={input} />
              </div>

              <label className="flex items-center gap-2.5 text-sm font-medium text-brand cursor-pointer">
                <input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={handle} className="accent-brand w-4 h-4" />
                Available for sale
              </label>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-muted hover:text-brand hover:border-brand transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-full bg-brand text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}