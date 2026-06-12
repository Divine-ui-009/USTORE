import axios from "axios";

const API = "http://localhost:8080/api";

const cartAxios = axios.create({ baseURL: API });

cartAxios.interceptors.request.use(config => {
  const stored = localStorage.getItem("store_user");
  if (stored) {
    const session = JSON.parse(stored);
    if (session?.token)
      config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

export const getCart          = ()                     => cartAxios.get("/cart");
export const getCartCount     = ()                     => cartAxios.get("/cart/count");
export const addToCart        = (productId, quantity)  => cartAxios.post("/cart", { productId, quantity });
export const updateCart       = (cartItemId, quantity) => cartAxios.put(`/cart/${cartItemId}`, { quantity });
export const removeFromCart   = (cartItemId)           => cartAxios.delete(`/cart/${cartItemId}`);
export const clearCart        = ()                     => cartAxios.delete("/cart");
export const checkout         = ()                     => cartAxios.post("/orders/checkout");
export const getMyOrders      = ()                     => cartAxios.get("/orders/my");
export const getAllOrders      = ()                     => cartAxios.get("/orders");
export const updateOrderStatus= (id, status)           => cartAxios.put(`/orders/${id}/status`, { status });
export const getRevenue       = ()                     => cartAxios.get("/orders/revenue");