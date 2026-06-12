import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, ArrowLeft, SlidersHorizontal,
  X, ChevronLeft, ChevronRight, Plus, Minus,
} from "lucide-react";
import { getProductsPaged } from "../services/productService";
import { addToCart }        from "../services/cartService";
import { getSession }       from "../services/authService";

import Navbar from "../components/Navbar";

const CATEGORIES = ["ALL", "MEN", "WOMEN", "KIDS", "SPORTS", "OTHER"];
const SORTS = [
  { val: "id-desc",    label: "Newest First",      sortBy: "id",    dir: "desc" },
  { val: "price-asc",  label: "Price: Low → High", sortBy: "price", dir: "asc"  },
  { val: "price-desc", label: "Price: High → Low", sortBy: "price", dir: "desc" },
  { val: "name-asc",   label: "Name A–Z",          sortBy: "name",  dir: "asc"  },
];
const PAGE_SIZE = 9;

export default function ShopPage() {
  const [products, setProducts]   = useState([]);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("ALL");
  const [sort, setSort]           = useState("id-desc");
  const [loading, setLoading]     = useState(true);
  const [sidebarOpen, setSidebar] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalItems, setTotalItems]   = useState(0);

  // Cart state
  const [cartCount,  setCartCount]  = useState(0);
  const [qtyModal,   setQtyModal]   = useState(null);
  const [qtyValue,   setQtyValue]   = useState(1);
  const [addingId,   setAddingId]   = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  const session      = getSession();
  const navigate     = useNavigate();
  const activeSort   = SORTS.find(s => s.val === sort) || SORTS[0];
  const isFiltered   = category !== "ALL" || search.trim();

  // Reset to page 0 when category or sort changes
  useEffect(() => { setCurrentPage(0); }, [category, sort]);

  useEffect(() => { fetchPage(currentPage); }, [currentPage, category, sort]);

  async function fetchPage(page) {
    setLoading(true);
    try {
      const { data } = await getProductsPaged(
        page, PAGE_SIZE, activeSort.sortBy, activeSort.dir, category
      );
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalElements);
    } catch {
      setProducts([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }

  // Client-side search on current page
  const displayed = products.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  function goToPage(page) {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCategoryChange(cat) {
    setCategory(cat);
    setSearch("");
    setSidebar(false);
  }

  function clearAllFilters() {
    setCategory("ALL");
    setSearch("");
    setSort("id-desc");
  }

  function pageNumbers() {
    const pages = [];
    const start = Math.max(0, currentPage - 2);
    const end   = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Cart handlers
  function openQtyModal(p) {
    if (!session) { navigate("/auth"); return; }
    setQtyModal({ id: p.id, name: p.name, price: p.price, stock: p.quantity, imageUrl: p.imageUrl });
    setQtyValue(1);
  }

  async function confirmAddToCart() {
    if (!qtyModal) return;
    setAddingId(qtyModal.id);
    try {
      await addToCart(qtyModal.id, qtyValue);
      setCartCount(c => c + qtyValue);
      setAddSuccess(qtyModal.id);
      setQtyModal(null);
      setTimeout(() => setAddSuccess(null), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to cart.");
    } finally {
      setAddingId(null);
    }
  }

  const fmt = v => `$${Number(v ?? 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-sand font-sans">

      <Navbar carCount={cartCount} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex gap-7 items-start">

        {/* ── Sidebar ── */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block shrink-0 w-52 bg-white rounded-3xl p-5 shadow-card sticky top-24`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-brand">Filters</h3>
            <button onClick={() => setSidebar(false)} className="lg:hidden text-muted hover:text-brand"><X size={17} /></button>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Category</p>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all
                  ${category === cat ? "bg-brand text-white" : "text-muted hover:bg-stone hover:text-brand"}`}>
                {cat === "ALL" ? "All Products" : cat}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Sort By</p>
            {SORTS.map(({ val, label }) => (
              <button key={val} onClick={() => setSort(val)}
                className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all
                  ${sort === val ? "bg-brand text-white" : "text-muted hover:bg-stone hover:text-brand"}`}>
                {label}
              </button>
            ))}
          </div>

          {isFiltered && (
            <button onClick={clearAllFilters}
              className="w-full text-sm font-semibold text-red-500 border border-red-200 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors">
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0">
          <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-brand">
                {category === "ALL" ? "Shop Products" : category}
              </h1>
              <p className="text-sm text-muted mt-1">
                {loading ? "Loading…" : `${totalItems} product${totalItems !== 1 ? "s" : ""}${category !== "ALL" ? ` in ${category}` : ""}`}
              </p>
            </div>
            {!loading && totalPages > 1 && (
              <span className="text-xs font-semibold text-muted bg-stone px-3 py-1.5 rounded-full">
                Page {currentPage + 1} of {totalPages}
              </span>
            )}
          </div>

          {/* Active filter chips */}
          {isFiltered && (
            <div className="flex flex-wrap gap-2 mb-5">
              {category !== "ALL" && (
                <span className="flex items-center gap-1.5 bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {category}
                  <button onClick={() => handleCategoryChange("ALL")}><X size={12} /></button>
                </span>
              )}
              {search.trim() && (
                <span className="flex items-center gap-1.5 bg-stone text-brand text-xs font-semibold px-3 py-1.5 rounded-full">
                  "{search}"
                  <button onClick={() => setSearch("")}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-24 text-muted">
              <div className="w-9 h-9 border-2 border-border border-t-brand rounded-full animate-spin" />
              <p className="text-sm">Loading products…</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="bg-white rounded-4xl p-16 text-center shadow-card flex flex-col items-center gap-4">
              <h2 className="font-display text-2xl font-bold">No products found</h2>
              <p className="text-muted text-sm">
                {search.trim()
                  ? `No results for "${search}"`
                  : `No products in the ${category} category yet.`}
              </p>
              <button onClick={clearAllFilters}
                className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayed.map(p => (
                <div key={p.id}
                  className="bg-white rounded-4xl overflow-hidden shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col">
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
                        onClick={() => openQtyModal(p)}
                        disabled={!p.isAvailable}
                        className={`text-xs font-semibold px-4 py-2.5 rounded-full transition-all
                          ${addSuccess === p.id
                            ? "bg-green-500 text-white"
                            : "bg-brand text-white hover:bg-neutral-800"}
                          disabled:bg-border disabled:text-muted disabled:cursor-not-allowed`}>
                        {addSuccess === p.id ? "Added ✓" : p.isAvailable ? "Add to Cart" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => goToPage(0)} disabled={currentPage === 0}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-border text-muted hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  First
                </button>
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                {pageNumbers().map(n => (
                  <button key={n} onClick={() => goToPage(n)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all
                      ${n === currentPage ? "bg-brand text-white shadow-sm" : "border border-border text-muted hover:border-brand hover:text-brand"}`}>
                    {n + 1}
                  </button>
                ))}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
                <button onClick={() => goToPage(totalPages - 1)} disabled={currentPage === totalPages - 1}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-border text-muted hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  Last
                </button>
              </div>
              <p className="text-xs text-muted">
                Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalItems)} of {totalItems} products
                {category !== "ALL" && ` in ${category}`}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ── Quantity Modal ── */}
      {qtyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setQtyModal(null)}>
          <div className="bg-white rounded-4xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}>

            <div className="flex gap-4 items-center mb-6">
              <img
                src={qtyModal.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"}
                alt={qtyModal.name}
                className="w-16 h-16 object-cover rounded-2xl shrink-0"
                onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"; }}
              />
              <div>
                <h3 className="font-bold text-brand leading-snug">{qtyModal.name}</h3>
                <p className="text-lg font-black text-brand">{fmt(qtyModal.price)}</p>
                <p className="text-[11px] text-muted">{qtyModal.stock} available</p>
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Quantity</p>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setQtyValue(v => Math.max(1, v - 1))}
                className="w-11 h-11 flex items-center justify-center border-2 border-border rounded-2xl text-brand hover:border-brand transition-colors text-xl font-bold">
                −
              </button>
              <span className="flex-1 text-center text-3xl font-black text-brand">{qtyValue}</span>
              <button onClick={() => setQtyValue(v => Math.min(qtyModal.stock, v + 1))}
                disabled={qtyValue >= qtyModal.stock}
                className="w-11 h-11 flex items-center justify-center border-2 border-border rounded-2xl text-brand hover:border-brand transition-colors text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed">
                +
              </button>
            </div>

            <div className="bg-stone rounded-2xl px-4 py-3 flex justify-between items-center mb-5">
              <span className="text-sm text-muted font-medium">Subtotal</span>
              <span className="font-black text-brand text-lg">{fmt(qtyModal.price * qtyValue)}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setQtyModal(null)}
                className="flex-1 py-3 rounded-2xl border border-border text-sm font-semibold text-muted hover:border-brand hover:text-brand transition-all">
                Cancel
              </button>
              <button onClick={confirmAddToCart} disabled={addingId === qtyModal.id}
                className="flex-1 py-3 rounded-2xl bg-brand text-white text-sm font-bold hover:bg-neutral-800 transition-colors disabled:opacity-60">
                {addingId === qtyModal.id ? "Adding…" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}