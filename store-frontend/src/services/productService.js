import axios from "axios";

const API = "http://localhost:8080/api/products";

const authAxios = axios.create({ baseURL: API });

authAxios.interceptors.request.use(config => {
  const stored = localStorage.getItem("store_user");
  if (stored) {
    const session = JSON.parse(stored);
    if (session?.token)
      config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

authAxios.interceptors.response.use(
  response => response,
  error => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message;
    if (status === 401) throw new Error("You are not logged in. Please sign in.");
    if (status === 403) throw new Error("Access denied. Admin account required.");
    if (status === 400) throw new Error(`Bad request: ${message}`);
    if (status === 404) throw new Error("Product not found.");
    if (status === 500) throw new Error("Server error. Check Spring Boot logs.");
    throw new Error(message || "Request failed.");
  }
);

// Public — no token needed
export const getProducts = () =>
  axios.get(API);

export const getProductById = (id) =>
  axios.get(`${API}/${id}`);

export const searchProducts = (kw) =>
  axios.get(`${API}/search?keyword=${kw}`);

export const getByCategory = (cat) =>
  axios.get(`${API}/category/${cat}`);

export const getSorted = (by, dir) =>
  axios.get(`${API}/sorted?by=${by}&dir=${dir}`);

export const getProductsNewestFirst = () =>
  axios.get(`${API}/sorted?by=id&dir=desc`);

export const getProductsPaged = (page = 0, size = 9, sortBy = "id", dir = "desc", category = "") => {
  const categoryParam = category && category !== "ALL" ? `&category=${category}` : "";
  return axios.get(`${API}/paged?page=${page}&size=${size}&sortBy=${sortBy}&dir=${dir}${categoryParam}`);
};

// Admin only — token attached automatically
export const addProduct    = (data)     => authAxios.post("", data);
export const updateProduct = (id, data) => authAxios.put(`/${id}`, data);
export const deleteProduct = (id)       => authAxios.delete(`/${id}`);