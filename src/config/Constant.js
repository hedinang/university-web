export const keyMenuItem = {
  DASHBOARD: {
    key: "DASHBOARD",
    name: "Thống kê",
  },
  SONG_LIST: {
    key: "SONG_LIST",
    name: "Danh sách nhạc",
  },
  AUTHOR_LIST: {
    key: "AUTHOR_LIST",
    name: "Danh sách tác giả",
  },
  SALE_LIST: {
    key: "SALE_LIST",
    name: "Danh sách đã bán",
  },
  CATEGORY_LIST: {
    key: "CATEGORY_LIST",
    name: "Danh mục thể loại",
  },
  PRESENT_LIST: {
    key: "PRESENT_LIST",
    name: "Danh sách quà tặng",
  },
  CUSTOMER_LIST: {
    key: "CUSTOMER_LIST",
    name: "Danh sách khách hàng",
  },
  CHAT: {
    key: "CHAT",
    name: "Inbox",
  },
  ADMIN_LIST: {
    key: "ADMIN_LIST",
    name: "Danh sách admin",
  },
  LOG_OUT: {
    key: "LOG_OUT",
    name: "Thoát",
  },
  FUNCTION: {
    key: "FUNCTION",
    name: "Tính năng",
  },
};

export const MESSAGE_STATUS = {
  CREATE_GROUP: "CREATE_GROUP",
  RENAME_GROUP: "RENAME_GROUP",
  NEW_MEMBER: "NEW_MEMBER",
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  FILE: "FILE",
  REMOVE_MEMBER: "REMOVE_MEMBER",
  EXIT_GROUP: "EXIT_GROUP",
  UPDATE_ROLE_ADMIN: "UPDATE_ROLE_ADMIN",
  DELETE_GROUP: "DELETE_GROUP",
};

export const role = {
  HOST: "HOST",
  MEMBER: "MEMBER",
  ADMIN: "ADMIN",
};

export const notificationMessage = {
  setMessage: (userName, newGroupName) => {
    const content = userName + " changed the group name to " + newGroupName;
    return content;
  },

  exitGroup: (userName) => {
    const content = userName + " has left the group";
    return content;
  },
};

export const organizationType = {
  PERSON: "PERSON",
  INSTITUTION: "INSTITUTION",
};

export const conversationType = {
  PERSONAL: "PERSONAL",
  GROUP: "GROUP",
  NOTIFICATION: "NOTIFICATION",
  CREATE_NOTIFICATION: "CREATE_NOTIFICATION",
};

export const filterConversationByType = {
  PERSONAL: "PERSONAL",
  GROUP: "GROUP",
  UNREAD: "UNREAD",
  NOTIFICATION: "NOTIFICATION",
};

export const CHATTING = {
  CONVERSATION_LIMIT: 15,
  MESSAGE_LIMIT: 15,
  MEMBER_LIMIT: 15,
};

export const tabSettings = {
  GENERAL_SETTINGS: "GENERAL_SETTINGS",
  PRIVACY: "PRIVACY",
  THEME: "THEME",
  NOTIFICATION: "NOTIFICATION",
  MESSAGE: "MESSAGE",
  UTILITIES: "UTILITIES",
};

export const UNREAD_COUNT_MAX = 10;

export const typeConfirms = {
  KICK_MEMBERS: "KICK_MEMBERS",
  UPDATE_ROLE_ADMIN: "UPDATE_ROLE_ADMIN",
};

export const MENU_WORK_MANAGEMENT = [
  {
    key: 'NEW_PROJECT',
    name: 'New Project +'
  },
  {
    key: 'DASHBOARD',
    name: 'Dashboard'
  },
  {
    key: 'TIMELINE',
    name: 'Time line'
  },
  {
    key: 'CALENDAR',
    name: 'Calendar'
  },
  {
    key: 'BOARD',
    name: 'Board'
  },
  {
    key: 'FILE',
    name: 'File'
  },
];

export const CODE_TYPE = {
  PROJECT_TYPE: "1001",
  PROGRESS_STEP: "1002",
  ROLE: "1003",
  AUTHORITY: "1004",
  PROPERTY: "1005",
  STAGE_WORKFLOW: "1006",


}
