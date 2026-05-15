import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Search, ShoppingCart, User,
  ShieldCheck, Truck, Leaf, Globe,
} from "lucide-react";
import { getProducts } from "../services/productService";

const features = [
  { icon: Leaf,        title: "Sustainable Materials", desc: "We believe great style shouldn't come at the planet's expense." },
  { icon: ShieldCheck, title: "Warranty Included",     desc: "Every purchase comes with a hassle-free 6-month warranty." },
  { icon: Truck,       title: "Delivery & Shipping",   desc: "Orders dispatched within 1–2 business days." },
  { icon: Globe,       title: "Eco-Friendly Fabrics",  desc: "Crafted with sustainability in mind using eco-friendly fabrics." },
];

const promos = [
  {
    label: "20% OFF",
    title: "Explore All Formal Wear",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b984b?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "25% OFF",
    title: "Grab The Latest Sportswear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
];

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getProducts()
      .then(r => setProducts(r.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-sand font-sans">

      {/* ── Navbar ── */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-widest text-brand">USTORE</span>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand">
            <Link to="/shop" className="hover:text-accent transition-colors">Categories</Link>
            <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
            <a href="#about"   className="hover:text-accent transition-colors">About</a>
            <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-5 text-brand">
            <Link to="/shop"  aria-label="Search"><Search  size={20} className="hover:text-accent transition-colors cursor-pointer" /></Link>
            <button           aria-label="Cart">  <ShoppingCart size={20} className="hover:text-accent transition-colors" /></button>
            <Link to="/auth"  aria-label="Account"><User   size={20} className="hover:text-accent transition-colors" /></Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <div className="relative rounded-4xl overflow-hidden min-h-[580px]">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80"
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

          {/* Text */}
          <div className="relative z-10 flex flex-col justify-center px-10 md:px-16 py-20 text-white max-w-xl min-h-[580px]">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4 opacity-90">
              New Collection
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.08] mb-5">
              Explore Premium Products
            </h1>
            <p className="text-lg text-white/85 mb-8 leading-relaxed">
              Buy classic, modern, and vintage products with ease. Quality guaranteed.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="px-6 py-3 rounded-full font-semibold text-sm border border-white/50 bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
              >
                Get Started
              </Link>
              <Link
                to="/shop"
                className="px-6 py-3 rounded-full font-semibold text-sm bg-white text-brand flex items-center gap-2 hover:bg-stone transition-colors"
              >
                Visit Shop <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Floating card */}
          <div className="hidden lg:block absolute top-8 right-8 z-10 bg-white rounded-2xl p-4 w-56 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
              alt="Featured"
              className="w-full h-36 object-cover rounded-xl mb-3"
            />
            <p className="text-sm font-semibold text-brand">Explore New Arrivals →</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-3xl p-6 shadow-card">
              <Icon size={26} strokeWidth={1.5} className="mb-4 text-brand" />
              <h3 className="font-bold text-sm mb-2 text-brand">{title}</h3>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Promo Categories ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
        <div className="grid md:grid-cols-2 gap-5">
          {promos.map(({ label, title, image }) => (
            <div key={title} className="relative h-72 rounded-4xl overflow-hidden group cursor-pointer">
              <img
                src={image} alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 text-white">
                <span className="inline-block bg-white text-brand text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit mb-3">
                  {label}
                </span>
                <h3 className="font-display text-3xl font-bold leading-tight mb-4">{title}</h3>
                <Link
                  to="/shop"
                  className="bg-white text-brand text-sm font-semibold px-5 py-2 rounded-full w-fit hover:bg-stone transition-colors"
                >
                  Shop Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20" id="about">
        <h2 className="font-display text-4xl font-bold text-center mb-10 text-brand">
          Best Sellers
        </h2>

        {loading ? (
          <p className="text-center text-muted py-16">Loading…</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <p className="text-muted">No products yet.</p>
            <Link to="/admin" className="bg-brand text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">
              Add Products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <Link
                key={p.id} to="/shop"
                className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 block"
              >
                <div className="overflow-hidden">
                  <img
                    src={p.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"}
                    alt={p.name}
                    className="w-full h-52 object-cover transition-transform duration-500 hover:scale-105"
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"; }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-brand mb-1">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand">${Number(p.price).toFixed(2)}</span>
                    {p.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-stone px-2 py-1 rounded-full">
                        {p.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-border py-8" id="contact">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xl font-bold tracking-widest text-brand">USTORE</span>
          <p className="text-sm text-muted">© 2026 USTORE. Built with React & Spring Boot.</p>
          <div className="flex gap-6 text-sm text-muted">
            <a href="#about"   className="hover:text-brand transition-colors">About</a>
            <a href="#contact" className="hover:text-brand transition-colors">Contact</a>
            <Link to="/shop"   className="hover:text-brand transition-colors">Shop</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}