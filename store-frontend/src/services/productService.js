import axios from "axios";

const API = "http://localhost:8080/api/products";

export const getProducts     = ()         => axios.get(API);
export const getProductById  = (id)       => axios.get(`${API}/${id}`);
export const addProduct      = (data)     => axios.post(API, data);
export const updateProduct   = (id, data) => axios.put(`${API}/${id}`, data);
export const deleteProduct   = (id)       => axios.delete(`${API}/${id}`);
export const searchProducts  = (kw)       => axios.get(`${API}/search?keyword=${kw}`);
export const getByCategory   = (cat)      => axios.get(`${API}/category/${cat}`);
export const getSorted       = (by, dir)  => axios.get(`${API}/sorted?by=${by}&dir=${dir}`);