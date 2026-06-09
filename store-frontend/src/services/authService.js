const API = "http://localhost:8080/api/auth";

export async function login(username, password) {
  const res  = await fetch(`${API}/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed.");
  return data; // { token, username, role }
}

export async function register(username, email, password) {
  const res  = await fetch(`${API}/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed.");
  return data; // { token, username, role }
}

export function saveSession(data) {
  localStorage.setItem("store_user", JSON.stringify(data));
}

export function getSession() {
  const s = localStorage.getItem("store_user");
  return s ? JSON.parse(s) : null;
}

export function clearSession() {
  localStorage.removeItem("store_user");
}

export function isAdmin() {
  const s = getSession();
  return s?.role === "ADMIN";
}