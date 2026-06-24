import { create } from 'zustand';
import { api } from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: api.auth.getCurrentUser(),
  token: api.auth.getToken(),
  sessions: [],
  isLoading: false,
  error: null,

  login: async (emailOrStudentId, password, role, otp = '') => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.auth.login(emailOrStudentId, password, role, otp);
      if (data.twoFactorRequired) {
        set({ isLoading: false });
        return { twoFactorRequired: true };
      }
      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    api.auth.logout();
    set({ user: null, token: null, sessions: [] });
  },

  fetchSessions: async () => {
    set({ isLoading: true });
    try {
      const sessions = await api.auth.sessions.list();
      set({ sessions, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  terminateSession: async (tokenToTerminate) => {
    try {
      const res = await api.auth.sessions.terminate(tokenToTerminate);
      set({ sessions: res.sessions });
    } catch (err) {
      set({ error: err.message });
    }
  }
}));
