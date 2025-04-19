import { create } from "zustand";

export const useInfoUser = create((set, get) => ({
  user: null,
  languageMap: null,
  updateUser: (value) => set((state) => ({ ...state, user: value })),
  updateLanguageMap: (value) =>
    set((state) => ({ ...state, languageMap: value })),
}));
