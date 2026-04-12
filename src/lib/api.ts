import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("yogiraj_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to admin login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("yogiraj_token");
      sessionStorage.removeItem("yogiraj_admin");
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { email: string; password: string; name: string; adminSecret: string }) =>
    api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params?: { category?: string; material?: string; search?: string }) =>
    api.get("/products", { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (formData: FormData) =>
    api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, formData: FormData) =>
    api.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: string) => api.delete(`/products/${id}`),
  uploadGallery: (id: string, formData: FormData) =>
    api.post(`/products/${id}/gallery`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteGalleryImage: (id: string, publicId: string) =>
    api.delete(`/products/${id}/gallery/${encodeURIComponent(publicId)}`),
  uploadSpecSheet: (id: string, formData: FormData) =>
    api.post(`/products/${id}/specsheet`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const servicesAPI = {
  getAll: () => api.get("/services"),
  getOne: (id: string) => api.get(`/services/${id}`),
  create: (formData: FormData) =>
    api.post("/services", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, formData: FormData) =>
    api.put(`/services/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// ─── Clients ──────────────────────────────────────────────────────────────────
export const clientsAPI = {
  getAll: () => api.get("/clients"),
  create: (formData: FormData) =>
    api.post("/clients", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, formData: FormData) =>
    api.put(`/clients/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// ─── Enquiries ────────────────────────────────────────────────────────────────
export const enquiriesAPI = {
  create: (formData: FormData) =>
    api.post("/enquiries", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getAll: (params?: { status?: string; page?: number; limit?: number; search?: string }) =>
    api.get("/enquiries", { params }),
  getOne: (id: string) => api.get(`/enquiries/${id}`),
  update: (id: string, data: { status?: string; adminNotes?: string; quotedPrice?: number }) =>
    api.put(`/enquiries/${id}`, data),
  delete: (id: string) => api.delete(`/enquiries/${id}`),
  reply: (id: string, replyMessage: string) =>
    api.post(`/enquiries/${id}/reply`, { replyMessage }),
};

// ─── Contact ──────────────────────────────────────────────────────────────────
export const contactAPI = {
  send: (data: { name: string; company?: string; email: string; phone?: string; message: string }) =>
    api.post("/contact", data),
  getAll: (params?: { isRead?: boolean; page?: number }) =>
    api.get("/contact", { params }),
  markAsRead: (id: string) => api.put(`/contact/${id}/read`),
  delete: (id: string) => api.delete(`/contact/${id}`),
  reply: (id: string, replyMessage: string) =>
    api.post(`/contact/${id}/reply`, { replyMessage }),
};

export default api;
