import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import { getProducts } from "../services/productService";

const CATEGORIES = ["ALL", "MEN", "WOMEN", "KIDS", "SPORTS", "OTHER"];
const SORTS = [
  { val: "default",    label: "Default" },
  { val: "price-asc",  label: "Price: Low → High" },
  { val: "price-desc", label: "Price: High → Low" },
  { val: "name-asc",   label: "Name A–Z" },
];

export default function ShopPage() {
  const [products, setProducts]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("ALL");
  const [sort, setSort]             = useState("default");
  const [loading, setLoading]       = useState(true);
  const [sidebarOpen, setSidebar]   = useState(false);

  useEffect(() => {
    getProducts()
      .then(r => { setProducts(r.data); setFiltered(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...products];
    if (category !== "ALL") result = result.filter(p => p.category === category);
    if (search.trim())
      result = result.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
    if (sort === "price-asc")  result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "name-asc")   result.sort((a, b) => a.name.localeCompare(b.name));
    setFiltered(result);
  }, [products, search, category, sort]);

  const fmt = v => `$${Number(v ?? 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-sand font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand transition-colors">
              <ArrowLeft size={17} /> <span className="hidden sm:inline">Back</span>
            </Link>
            <span className="text-xl font-bold tracking-widest text-brand">USTORE</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:flex items-center bg-sand rounded-full px-4 h-10 gap-2 border border-border focus-within:border-brand transition-colors">
            <Search size={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search products…"
              className="flex-1 bg-transparent text-sm text-brand placeholder-muted outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted hover:text-brand">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSidebar(v => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold bg-stone px-4 py-2 rounded-full hover:bg-border transition-colors"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button className="relative text-brand">
              <ShoppingCart size={21} />
              <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none px-1">
                0
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-6 pb-3">
          <div className="flex items-center bg-sand rounded-full px-4 h-10 gap-2 border border-border">
            <Search size={16} className="text-muted shrink-0" />
            <input
              type="text" placeholder="Search products…"
              className="flex-1 bg-transparent text-sm outline-none placeholder-muted"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex gap-7 items-start">

        {/* ── Sidebar ── */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block shrink-0 w-52 bg-white rounded-3xl p-5 shadow-card sticky top-24`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-brand">Filters</h3>
            <button onClick={() => setSidebar(false)} className="lg:hidden text-muted hover:text-brand">
              <X size={17} />
            </button>
          </div>

          {/* Category */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Category</p>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setSidebar(false); }}
                className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all
                  ${category === cat
                    ? "bg-brand text-white"
                    : "text-muted hover:bg-stone hover:text-brand"}`}
              >
                {cat === "ALL" ? "All Products" : cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Sort By</p>
            {SORTS.map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setSort(val)}
                className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all
                  ${sort === val
                    ? "bg-brand text-white"
                    : "text-muted hover:bg-stone hover:text-brand"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-brand">Shop Products</h1>
            <p className="text-sm text-muted mt-1">
              {loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-24 text-muted">
              <div className="w-9 h-9 border-2 border-border border-t-brand rounded-full animate-spin" />
              <p className="text-sm">Loading products…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-4xl p-16 text-center shadow-card flex flex-col items-center gap-4">
              <h2 className="font-display text-2xl font-bold">No products found</h2>
              <p className="text-muted text-sm">Try a different search or category.</p>
              <button
                onClick={() => { setSearch(""); setCategory("ALL"); }}
                className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-4xl overflow-hidden shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={p.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"}
                      alt={p.name}
                      className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                      onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"; }}
                    />
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-3 py-1 rounded-full
                      ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.isAvailable ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    {p.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-stone text-muted px-2.5 py-1 rounded-full w-fit">
                        {p.category}
                      </span>
                    )}
                    <h3 className="font-bold text-brand leading-snug">{p.name}</h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2 flex-1">{p.description}</p>

                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <span className="text-2xl font-black text-brand">{fmt(p.price)}</span>
                        <span className="block text-[11px] text-muted">Qty: {p.quantity}</span>
                      </div>
                      <button
                        disabled={!p.isAvailable}
                        className="bg-brand text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-neutral-800 transition-colors disabled:bg-border disabled:text-muted disabled:cursor-not-allowed"
                      >
                        {p.isAvailable ? "Add to Cart" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}