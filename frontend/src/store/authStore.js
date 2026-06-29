import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api.js";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/login", { email, password });
          // 2FA required — don't set user yet
          if (res.data.requires2FA) {
            set({ isLoading: false });
            return { requires2FA: true, userId: res.data.userId };
          }
          const { token, user } = res.data;
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          set({ token, user, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.message || "Login failed");
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/register", data);
          set({ isLoading: false });
          return { success: true, email: res.data.email };
        } catch (err) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.message || "Registration failed");
        }
      },

      logout: () => {
        delete api.defaults.headers.common["Authorization"];
        set({ user: null, token: null });
        window.location.href = "/login";
      },

      updateUser: (updates) => set({ user: { ...get().user, ...updates } }),

      refreshUser: async () => {
        try {
          const res = await api.get("/auth/me");
          set({ user: res.data.user });
        } catch {}
      },

      initAuth: () => {
        const { token } = get();
        if (token)
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      },
    }),
    {
      name: "trackeet-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);

export default useAuthStore;
