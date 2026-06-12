import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Pencil, Trash2, X, ArrowLeft,
  Package, ChevronLeft, ChevronRight, Settings,
} from "lucide-react";
import {
  getProductsNewestFirst, addProduct,
  updateProduct, deleteProduct,
} from "../services/productService";
import { getAllOrders, updateOrderStatus, getRevenue } from "../services/cartService";
import { getSchedulerConfig, updateSchedulerConfig } from "../services/schedulerService";
import { getSession, logout } from "../services/authService";

const CATS      = ["MEN", "WOMEN", "KIDS", "SPORTS", "OTHER"];
const EMPTY     = { name: "", description: "", price: "", quantity: "",
                    imageUrl: "", category: "OTHER", isAvailable: true };
const PAGE_SIZE = 12;

const STATUS_FLOW = {
  PENDING:   { next: "CONFIRMED", label: "Confirm Order",  color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { next: "SHIPPED",   label: "Mark Shipped",   color: "bg-blue-100 text-blue-700"    },
  SHIPPED:   { next: "DELIVERED", label: "Mark Delivered", color: "bg-purple-100 text-purple-700" },
  DELIVERED: { next: null,        label: "Delivered",      color: "bg-green-100 text-green-700"   },
  CANCELLED: { next: null,        label: "Cancelled",      color: "bg-red-100 text-red-700"       },
};

export default function AdminPage() {
  const [tab, setTab]           = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [revenue, setRevenue]   = useState(0);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  // Scheduler state
  const [schedulerConfig, setSchedulerConfig]   = useState(null);
  const [schedulerSaving, setSchedulerSaving]   = useState(false);
  const [schedulerSuccess, setSchedulerSuccess] = useState(false);

  // Product pagination
  const [currentPage, setCurrentPage] = useState(0);

  const navigate = useNavigate();
  const session  = getSession();

  // ── Access guard ───────────────────────────────────────────────────────────
  if (!session || session.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center font-sans">
        <div className="bg-white rounded-3xl p-12 text-center shadow-card max-w-sm w-full">
          <h2 className="font-display text-2xl font-bold text-brand mb-3">Access Denied</h2>
          <p className="text-muted text-sm mb-6">You need an admin account to view this page.</p>
          <Link to="/auth" className="bg-brand text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ── Data loaders ───────────────────────────────────────────────────────────
  const loadProducts = useCallback(() => {
    setLoading(true); setError("");
    getProductsNewestFirst()
      .then(r => { setProducts(r.data); setCurrentPage(0); })
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  }, []);

  const loadOrders = useCallback(() => {
    setLoading(true); setError("");
    Promise.all([getAllOrders(), getRevenue()])
      .then(([ordersRes, revRes]) => {
        setOrders(ordersRes.data);
        setRevenue(revRes.data.totalRevenue ?? 0);
      })
      .catch(() => setError("Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  const loadSchedulerConfig = useCallback(() => {
    getSchedulerConfig()
      .then(r => setSchedulerConfig(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "products")  { loadProducts(); loadOrders(); }
    else if (tab === "orders")    { loadOrders(); }
    else if (tab === "scheduler") { loadSchedulerConfig(); }
  }, [tab]);

  // Load revenue on mount for stats
  useEffect(() => { loadOrders(); }, []);

  // ── Product CRUD ───────────────────────────────────────────────────────────
  function openCreate() { setEditing(null); setForm(EMPTY); setModal(true); setError(""); }
  function openEdit(p) {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description ?? "", price: p.price,
              quantity: p.quantity, imageUrl: p.imageUrl ?? "",
              category: p.category, isAvailable: p.isAvailable ?? true });
    setModal(true); setError("");
  }

  function handle(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function save(e) {
    e.preventDefault(); setSaving(true); setError("");
    const payload = { ...form,
      price:    parseFloat(form.price),
      quantity: parseInt(form.quantity, 10) };
    if (!payload.name?.trim())                   { setError("Name is required.");          setSaving(false); return; }
    if (isNaN(payload.price)    || payload.price    < 0) { setError("Enter a valid price.");    setSaving(false); return; }
    if (isNaN(payload.quantity) || payload.quantity < 0) { setError("Enter a valid quantity."); setSaving(false); return; }
    try {
      editing ? await updateProduct(editing, payload) : await addProduct(payload);
      setModal(false); loadProducts();
    } catch (err) { setError(err.message || "Save failed."); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm("Delete this product?")) return;
    try { await deleteProduct(id); loadProducts(); }
    catch (err) { setError(err.message || "Delete failed."); }
  }

  // ── Order management ───────────────────────────────────────────────────────
  async function advanceStatus(orderId, nextStatus) {
    setError("");
    try { await updateOrderStatus(orderId, nextStatus); loadOrders(); }
    catch { setError("Status update failed."); }
  }

  // ── Scheduler ─────────────────────────────────────────────────────────────
  function handleSchedulerChange(e) {
    const { name, value } = e.target;
    setSchedulerConfig(c => ({ ...c, [name]: parseInt(value, 10) }));
  }

  async function saveSchedulerConfig(e) {
    e.preventDefault();
    setSchedulerSaving(true); setSchedulerSuccess(false);
    try {
      const { data } = await updateSchedulerConfig(schedulerConfig);
      setSchedulerConfig(data);
      setSchedulerSuccess(true);
      setTimeout(() => setSchedulerSuccess(false), 3000);
    } catch { setError("Failed to update scheduler config."); }
    finally { setSchedulerSaving(false); }
  }

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const totalPages   = Math.ceil(products.length / PAGE_SIZE);
  const pagedProducts= products.slice(currentPage * PAGE_SIZE,
                                      (currentPage + 1) * PAGE_SIZE);

  function goToPage(page) {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmt     = v  => `$${Number(v ?? 0).toFixed(2)}`;
  const fmtDate = dt => new Date(dt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const pendingCount = orders.filter(o => o.status === "PENDING").length;

  const fieldCls = "flex flex-col gap-1";
  const labelCls = "text-[10px] font-bold uppercase tracking-widest text-muted";
  const inputCls = "bg-sand border border-border rounded-xl px-4 py-2.5 text-sm text-brand focus:outline-none focus:border-brand transition-colors";

  return (
    <div className="min-h-screen bg-sand font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors">
              <ArrowLeft size={17} /> Home
            </Link>
            <span className="text-xl font-bold tracking-widest text-brand">USTORE Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:block">
              Signed in as <strong className="text-brand">{session.username}</strong>
            </span>
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              className="text-sm font-semibold text-muted border border-border px-4 py-2 rounded-full hover:border-brand hover:text-brand transition-all">
              Logout
            </button>
            {tab === "products" && (
              <button onClick={openCreate}
                className="flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-neutral-800 transition-colors">
                <Plus size={16} /> Add Product
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products.length, icon: "📦" },
            { label: "Total Orders",   value: orders.length,   icon: "🛒" },
            { label: "Pending Orders", value: pendingCount,    icon: "🕐", alert: pendingCount > 0 },
            { label: "Revenue (Shipped + Delivered)", value: fmt(revenue), icon: "💰" },
          ].map(({ label, value, icon, alert }) => (
            <div key={label}
              className={`bg-white rounded-2xl p-5 shadow-card ${alert ? "ring-2 ring-yellow-400" : ""}`}>
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-2xl font-black text-brand">{value}</p>
              <p className="text-xs text-muted font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "products",  label: "Products" },
            { key: "orders",    label: "Orders", badge: pendingCount },
            { key: "scheduler", label: "Scheduler", icon: <Settings size={14} /> },
          ].map(({ key, label, badge, icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2
                ${tab === key
                  ? "bg-brand text-white"
                  : "bg-white border border-border text-muted hover:border-brand hover:text-brand"}`}>
              {icon}
              {label}
              {badge > 0 && (
                <span className={`text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center
                  ${tab === key ? "bg-white text-brand" : "bg-brand text-white"}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PRODUCTS TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === "products" && (
          loading ? (
            <div className="flex flex-col items-center gap-4 py-24 text-muted">
              <div className="w-9 h-9 border-2 border-border border-t-brand rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-card">
              <h2 className="font-display text-2xl font-bold mb-2">No products yet</h2>
              <p className="text-muted text-sm">Click "Add Product" to create your first one.</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white rounded-3xl shadow-card overflow-auto mb-6">
                <table className="w-full border-collapse">
                  <thead className="border-b border-border">
                    <tr>
                      {["Product", "Category", "Price", "Qty", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProducts.map(p => (
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
                            <button onClick={() => openEdit(p)}
                              className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-muted hover:bg-brand hover:text-white hover:border-brand transition-all">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => del(p.id)}
                              className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => goToPage(0)} disabled={currentPage === 0}
                      className="text-xs font-semibold px-3 py-2 rounded-xl border border-border text-muted hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      First
                    </button>
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted hover:border-brand hover:text-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i)
                      .filter(n => n >= Math.max(0, currentPage - 2) && n <= Math.min(totalPages - 1, currentPage + 2))
                      .map(n => (
                        <button key={n} onClick={() => goToPage(n)}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all
                            ${n === currentPage
                              ? "bg-brand text-white shadow-sm"
                              : "border border-border text-muted hover:border-brand hover:text-brand"}`}>
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
                    Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, products.length)} of {products.length} products
                  </p>
                </div>
              )}
            </>
          )
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ORDERS TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === "orders" && (
          loading ? (
            <div className="flex flex-col items-center gap-4 py-24 text-muted">
              <div className="w-9 h-9 border-2 border-border border-t-brand rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-card">
              <Package size={40} strokeWidth={1} className="text-border mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted text-sm">Orders will appear here after customers checkout.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => {
                const flow = STATUS_FLOW[order.status] || STATUS_FLOW.CANCELLED;
                return (
                  <div key={order.id}
                    className={`bg-white rounded-3xl p-5 shadow-card ${order.status === "PENDING" ? "ring-2 ring-yellow-300" : ""}`}>

                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-brand">Order #{order.id}</p>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${flow.color}`}>
                            {order.status}
                          </span>
                          {order.status === "PENDING" && (
                            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                              Needs confirmation
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          by <strong className="text-brand">{order.username}</strong> · {fmtDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xl text-brand">{fmt(order.totalPrice)}</span>
                        {flow.next && (
                          <button onClick={() => advanceStatus(order.id, flow.next)}
                            className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">
                            {flow.label}
                          </button>
                        )}
                        {order.status === "PENDING" && (
                          <button onClick={() => advanceStatus(order.id, "CANCELLED")}
                            className="text-red-500 border border-red-200 bg-red-50 text-xs font-semibold px-4 py-2 rounded-full hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-border pt-4">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex items-center gap-2 bg-sand px-3 py-2 rounded-xl">
                          <img
                            src={item.productImageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=60&q=80"}
                            alt={item.productName}
                            className="w-8 h-8 object-cover rounded-lg shrink-0"
                            onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=60&q=80"; }}
                          />
                          <div>
                            <p className="text-xs font-semibold text-brand">{item.productName}</p>
                            <p className="text-[11px] text-muted">× {item.quantity} · {fmt(item.lineTotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCHEDULER TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === "scheduler" && (
          !schedulerConfig ? (
            <div className="flex flex-col items-center gap-4 py-24 text-muted">
              <div className="w-9 h-9 border-2 border-border border-t-brand rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="bg-white rounded-3xl p-8 shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <Settings size={22} className="text-brand" />
                  <h2 className="font-display text-2xl font-bold text-brand">Dynamic Scheduler</h2>
                </div>
                <p className="text-sm text-muted mb-8 leading-relaxed">
                  Configure how often the order lifecycle task runs and the thresholds
                  for automatic status transitions. Changes apply <strong>instantly</strong> —
                  no server restart required.
                </p>

                {schedulerSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 font-semibold">
                    ✓ Scheduler updated and rescheduled successfully.
                  </div>
                )}

                <form onSubmit={saveSchedulerConfig} className="flex flex-col gap-6">

                  {/* Run interval */}
                  <div className="bg-sand rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
                      Run Interval
                    </p>
                    <p className="text-xs text-muted mb-4">
                      How often the scheduler checks and processes orders.
                    </p>
                    <div className={fieldCls}>
                      <label className={labelCls}>Every (minutes)</label>
                      <input
                        name="orderLifecycleIntervalMinutes"
                        type="number" min="1" max="60"
                        value={schedulerConfig.orderLifecycleIntervalMinutes}
                        onChange={handleSchedulerChange}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Thresholds */}
                  <div className="bg-sand rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
                      Order Lifecycle Thresholds
                    </p>
                    <p className="text-xs text-muted mb-5">
                      How long each status can sit before the scheduler acts automatically.
                    </p>

                    <div className="flex flex-col gap-4">
                      <div className={fieldCls}>
                        <label className={labelCls}>
                          Cancel PENDING orders after (minutes)
                        </label>
                        <p className="text-[11px] text-muted mb-1">
                          If admin doesn't confirm within this time, stock is restored and order is cancelled.
                        </p>
                        <input
                          name="pendingCancelAfterMinutes"
                          type="number" min="1"
                          value={schedulerConfig.pendingCancelAfterMinutes}
                          onChange={handleSchedulerChange}
                          className={inputCls}
                        />
                      </div>

                      <div className={fieldCls}>
                        <label className={labelCls}>
                          Auto-ship CONFIRMED orders after (minutes)
                        </label>
                        <p className="text-[11px] text-muted mb-1">
                          If admin hasn't marked as shipped, the scheduler does it automatically.
                        </p>
                        <input
                          name="confirmedShipAfterMinutes"
                          type="number" min="1"
                          value={schedulerConfig.confirmedShipAfterMinutes}
                          onChange={handleSchedulerChange}
                          className={inputCls}
                        />
                      </div>

                      <div className={fieldCls}>
                        <label className={labelCls}>
                          Auto-deliver SHIPPED orders after (minutes)
                        </label>
                        <p className="text-[11px] text-muted mb-1">
                          Shipped orders are automatically marked delivered after this time.
                        </p>
                        <input
                          name="shippedDeliverAfterMinutes"
                          type="number" min="1"
                          value={schedulerConfig.shippedDeliverAfterMinutes}
                          onChange={handleSchedulerChange}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current config summary */}
                  <div className="bg-brand/5 border border-brand/10 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-3">
                      Current Schedule Summary
                    </p>
                    <div className="flex flex-col gap-1.5 text-sm">
                      <p className="text-muted">
                        ⚙️ Runs every <strong className="text-brand">{schedulerConfig.orderLifecycleIntervalMinutes} min</strong>
                      </p>
                      <p className="text-muted">
                        🕐 Pending cancelled after <strong className="text-brand">{schedulerConfig.pendingCancelAfterMinutes} min</strong>
                      </p>
                      <p className="text-muted">
                        🚚 Confirmed auto-shipped after <strong className="text-brand">{schedulerConfig.confirmedShipAfterMinutes} min</strong>
                      </p>
                      <p className="text-muted">
                        📬 Shipped auto-delivered after <strong className="text-brand">{schedulerConfig.shippedDeliverAfterMinutes} min</strong>
                      </p>
                    </div>
                  </div>

                  <button type="submit" disabled={schedulerSaving}
                    className="bg-brand text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {schedulerSaving ? "Applying…" : "Apply & Reschedule Now"}
                  </button>
                </form>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Product Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setModal(false)}>
          <div className="bg-white rounded-4xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>

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
                <div className={fieldCls}>
                  <label className={labelCls}>Name *</label>
                  <input name="name" required value={form.name} onChange={handle}
                    placeholder="Product name" className={inputCls} />
                </div>
                <div className={fieldCls}>
                  <label className={labelCls}>Category *</label>
                  <select name="category" value={form.category} onChange={handle} className={inputCls}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className={fieldCls}>
                <label className={labelCls}>Description</label>
                <textarea name="description" rows={2} value={form.description} onChange={handle}
                  placeholder="Short description" className={`${inputCls} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={fieldCls}>
                  <label className={labelCls}>Price *</label>
                  <input name="price" type="number" step="0.01" min="0" required
                    value={form.price} onChange={handle} placeholder="0.00" className={inputCls} />
                </div>
                <div className={fieldCls}>
                  <label className={labelCls}>Quantity *</label>
                  <input name="quantity" type="number" min="0" required
                    value={form.quantity} onChange={handle} placeholder="0" className={inputCls} />
                </div>
              </div>

              <div className={fieldCls}>
                <label className={labelCls}>Image URL</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handle}
                  placeholder="https://…" className={inputCls} />
              </div>

              <label className="flex items-center gap-2.5 text-sm font-medium text-brand cursor-pointer">
                <input name="isAvailable" type="checkbox" checked={form.isAvailable}
                  onChange={handle} className="accent-brand w-4 h-4" />
                Available for sale
              </label>

              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-muted hover:border-brand hover:text-brand transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-full bg-brand text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
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