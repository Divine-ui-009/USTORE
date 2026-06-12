import axios from "axios";

const API = "http://localhost:8080/api/scheduler";

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

export const getSchedulerConfig    = ()       => authAxios.get("/config");
export const updateSchedulerConfig = (config) => authAxios.put("/config", config);