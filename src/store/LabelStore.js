import { create } from "zustand";

export const useLabelStore = create((set) => ({
  labelList: [],

  setLabelList: (value) => set((state) => ({ ...state, labelList: value })),
}));
