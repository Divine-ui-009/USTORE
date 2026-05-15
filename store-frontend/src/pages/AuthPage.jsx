import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const navigate              = useNavigate();

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const body = mode === "login"
        ? { username: form.username, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const res  = await fetch(`http://localhost:8080/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      localStorage.setItem("store_user", JSON.stringify(data));
      navigate("/shop");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-brand p-12 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <span className="text-xl font-bold tracking-widest text-white relative z-10">USTORE</span>

        <div className="relative z-10">
          <h2 className="font-display text-5xl font-black text-white leading-[1.1] mb-5">
            Your style,<br />your store.
          </h2>
          <p className="text-white/65 text-base leading-relaxed max-w-sm">
            Manage and explore products across all categories from one clean dashboard.
          </p>
        </div>

        <p className="text-white/30 text-xs relative z-10">© 2026 USTORE</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center bg-sand px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Tab toggle */}
          <div className="inline-flex bg-white border border-border rounded-full p-1 mb-8">
            {["login", "register"].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all capitalize
                  ${mode === m ? "bg-brand text-white shadow-sm" : "text-muted hover:text-brand"}`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold text-brand mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-muted mb-6">
            {mode === "login" ? "Sign in to access the store." : "Fill in your details to get started."}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted">Username</label>
              <input
                name="username" type="text" required
                placeholder="e.g. john_doe"
                value={form.username} onChange={handle}
                className="bg-white border border-border rounded-xl px-4 py-3 text-sm text-brand placeholder-muted focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted">Email</label>
                <input
                  name="email" type="email" required
                  placeholder="you@example.com"
                  value={form.email} onChange={handle}
                  className="bg-white border border-border rounded-xl px-4 py-3 text-sm text-brand placeholder-muted focus:outline-none focus:border-brand transition-colors"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted">Password</label>
              <input
                name="password" type="password" required
                placeholder="Enter password"
                value={form.password} onChange={handle}
                className="bg-white border border-border rounded-xl px-4 py-3 text-sm text-brand placeholder-muted focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="bg-brand text-white py-3 rounded-xl font-semibold text-sm mt-1 hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[11px] text-muted bg-stone rounded-xl px-4 py-2.5 mt-5">
            <strong>Dev mode:</strong> the backend stub accepts any credentials.
          </p>

          <Link to="/" className="block text-center text-sm text-muted mt-5 hover:text-brand transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}