import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { getMyOrders } from "../services/cartService";
import { getSession }  from "../services/authService";
import Navbar from "../components/Navbar";

const STATUS_STYLES = {
  PENDING:   "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED:   "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_DESCRIPTIONS = {
  PENDING:   "Waiting for admin confirmation",
  CONFIRMED: "Order confirmed — preparing for shipment",
  SHIPPED:   "On the way to you",
  DELIVERED: "Delivered successfully",
  CANCELLED: "This order was cancelled",
};

export default function OrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const session               = getSession();

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt     = v  => `$${Number(v).toFixed(2)}`;
  const fmtDate = dt => new Date(dt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-sand font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-brand">Order History</h1>
            <p className="text-sm text-muted mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
          </div>
          <Link to="/cart"
            className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-neutral-800 transition-colors">
            View Cart
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24 text-muted">
            <div className="w-9 h-9 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-4xl p-16 text-center shadow-card flex flex-col items-center gap-5">
            <Package size={48} strokeWidth={1} className="text-border" />
            <h2 className="font-display text-2xl font-bold">No orders yet</h2>
            <p className="text-muted text-sm">Your orders will appear here after checkout.</p>
            <Link to="/shop"
              className="bg-brand text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl p-6 shadow-card">

                {/* Order header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-brand text-sm">Order #{order.id}</p>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || "bg-stone text-muted"}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{fmtDate(order.createdAt)}</p>
                    <p className="text-xs text-muted mt-0.5 italic">
                      {STATUS_DESCRIPTIONS[order.status]}
                    </p>
                  </div>
                  <span className="font-black text-2xl text-brand">{fmt(order.totalPrice)}</span>
                </div>

                {/* Order items */}
                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.productImageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80"}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-xl shrink-0"
                        onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-brand truncate">{item.productName}</p>
                        <p className="text-xs text-muted">
                          {item.quantity} × {fmt(item.priceAtPurchase)}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-brand shrink-0">{fmt(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}