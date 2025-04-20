import { create } from "zustand";

export const useSideBarStore = create((set) => ({
  isSelectedConversation: false,
  isMsgDetail: false,
  isWorkManagement: false,
  isProfileDetail: false,
  isMenuOrganizationBook: true,
  isNotification: false,
  isWorkManagementOptions: true,

  setIsSelectedConversation: (value) =>
    set((state) => ({ isSelectedConversation: value })),

  switchIsMsgDetail: (value) =>
    set((state) => ({
      isMsgDetail: state.isMsgDetail === value ? value : !state.isMsgDetail,
    })),

  switchIsProfileDetail: () =>
    set((state) => ({ isProfileDetail: !state.isProfileDetail })),

  switchIsMenuOrganizationBook: () =>
    set((state) => ({ isMenuOrganizationBook: !state.isMenuOrganizationBook })),

  switchIsWorkManagement: () => set((state) => ({ isWorkManagement: !state.isWorkManagement })),

  setIsNotification: (value) => set((state) => ({ isNotification: value })),

  switchIsWorkManagementOptions: () =>
    set((state) => ({
      isWorkManagementOptions: !state.isWorkManagementOptions,
    })),
}));
