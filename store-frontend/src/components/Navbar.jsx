import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Package, LogOut, User } from "lucide-react";
import { getSession, logout } from "../services/authService";

export default function Navbar({ cartCount = 0 }) {
  const session  = getSession();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-widest text-brand">
          USTORE
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
          <Link to="/shop"   className="hover:text-brand transition-colors">Shop</Link>
          {session && (
            <Link to="/orders" className="hover:text-brand transition-colors">My Orders</Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Username chip */}
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-muted">
                <User size={15} />
                <span className="font-semibold text-brand">{session.username}</span>
              </span>

              {/* Cart */}
              <Link to="/cart" className="relative text-brand p-1">
                <ShoppingCart size={21} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Orders (mobile) */}
              <Link to="/orders" className="md:hidden text-brand p-1">
                <Package size={21} />
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted border border-border px-3 py-1.5 rounded-full hover:border-brand hover:text-brand transition-all"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/auth"
              className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}