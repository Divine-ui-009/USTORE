import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage    from "./pages/AuthPage";
import ShopPage    from "./pages/ShopPage";
import AdminPage   from "./pages/AdminPage";
import CartPage    from "./pages/CartPage";
import OrdersPage  from "./pages/OrdersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<LandingPage />} />
        <Route path="/auth"   element={<AuthPage />} />
        <Route path="/shop"   element={<ShopPage />} />
        <Route path="/admin"  element={<AdminPage />} />
        <Route path="/cart"   element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </BrowserRouter>
  );
}