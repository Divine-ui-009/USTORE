import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Package } from "lucide-react";
import { getCart, updateCart, removeFromCart, clearCart, checkout } from "../services/cartService";
import { getSession } from "../services/authService";
import Navbar from "../components/Navbar";

export default function CartPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const navigate              = useNavigate();
  const session               = getSession();

  useEffect(() => {
    if (!session) { navigate("/auth"); return; }
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    try {
      const { data } = await getCart();
      setItems(data);
    } catch {
      setError("Could not load cart.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuantity(cartItemId, newQty, maxStock) {
    if (newQty < 0) return;
    if (newQty > maxStock) { setError(`Only ${maxStock} in stock.`); return; }
    setError("");
    try {
      if (newQty === 0) {
        await removeFromCart(cartItemId);
      } else {
        await updateCart(cartItemId, newQty);
      }
      loadCart();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  }

  async function handleCheckout() {
    setPlacing(true); setError("");
    try {
      await checkout();
      setSuccess(true);
      setItems([]);
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed.");
    } finally {
      setPlacing(false);
    }
  }

  // Items use DTO fields: productName, productImageUrl, price, lineTotal, stockAvailable
  const total     = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const fmt       = v => `$${Number(v).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-sand font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-5 mb-6 text-center">
            <p className="text-lg font-bold mb-1">Order placed successfully! 🎉</p>
            <p className="text-sm mb-4">Your order is now pending admin confirmation.</p>
            <div className="flex justify-center gap-3">
              <Link to="/orders"
                className="bg-brand text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">
                View My Orders
              </Link>
              <Link to="/shop"
                className="border border-border px-5 py-2 rounded-full text-sm font-semibold hover:border-brand transition-colors">
                Back to Shop
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24 text-muted">
            <div className="w-9 h-9 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        ) : items.length === 0 && !success ? (
          <div className="bg-white rounded-4xl p-16 text-center shadow-card flex flex-col items-center gap-5">
            <ShoppingBag size={48} strokeWidth={1} className="text-border" />
            <h2 className="font-display text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted text-sm">Add some products to get started.</p>
            <Link to="/shop"
              className="bg-brand text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Cart items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-5 shadow-card flex gap-4 items-center">
                  <img
                    src={item.productImageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-2xl shrink-0"
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"; }}
                  />
                  <div className="flex-1 min-w-0">
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-stone px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                    <h3 className="font-bold text-brand mt-1 truncate text-sm">{item.productName}</h3>
                    <p className="text-sm font-bold text-brand">{fmt(item.price)} each</p>
                    <p className="text-[11px] text-muted">{item.stockAvailable} in stock</p>
                  </div>

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleQuantity(item.id, item.quantity - 1, item.stockAvailable)}
                      className="w-8 h-8 flex items-center justify-center border border-border rounded-xl text-muted hover:bg-stone hover:border-brand transition-all">
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantity(item.id, item.quantity + 1, item.stockAvailable)}
                      disabled={item.quantity >= item.stockAvailable}
                      className="w-8 h-8 flex items-center justify-center border border-border rounded-xl text-muted hover:bg-stone hover:border-brand transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <Plus size={13} />
                    </button>
                  </div>

                  <span className="font-black text-brand text-base shrink-0 w-16 text-right">
                    {fmt(item.lineTotal)}
                  </span>

                  <button onClick={() => handleQuantity(item.id, 0, item.stockAvailable)}
                    className="text-muted hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button onClick={async () => { await clearCart(); loadCart(); }}
                className="text-xs text-red-400 hover:text-red-600 transition-colors self-start mt-1">
                Clear entire cart
              </button>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-3xl p-6 shadow-card h-fit sticky top-24">
              <h2 className="font-display text-xl font-bold text-brand mb-5">Order Summary</h2>

              <div className="flex flex-col gap-2.5 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted truncate max-w-[140px]">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-semibold shrink-0">{fmt(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand">Total</span>
                  <span className="font-black text-2xl text-brand">{fmt(total)}</span>
                </div>
                <p className="text-[11px] text-muted mt-1">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
              </div>

              <button onClick={handleCheckout} disabled={placing || items.length === 0}
                className="w-full bg-brand text-white py-3.5 rounded-2xl font-bold text-sm mt-4 hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {placing ? "Placing Order…" : `Place Order · ${fmt(total)}`}
              </button>

              <Link to="/shop" className="block text-center text-xs text-muted mt-4 hover:text-brand transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}