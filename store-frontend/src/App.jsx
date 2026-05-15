import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage    from "./pages/AuthPage";
import ShopPage    from "./pages/ShopPage";
import AdminPage   from "./pages/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<LandingPage />} />
        <Route path="/auth"  element={<AuthPage />} />
        <Route path="/shop"  element={<ShopPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;