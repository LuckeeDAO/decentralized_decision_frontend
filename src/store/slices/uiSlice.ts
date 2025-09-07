import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
  read: boolean;
}

export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  customColors?: Record<string, string>;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface UIState {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: {
    global: boolean;
    wallet: boolean;
    voting: boolean;
    nft: boolean;
    token: boolean;
  };
  modals: {
    walletConnect: boolean;
    nftTransfer: boolean;
    tokenStake: boolean;
    votingCreate: boolean;
    settings: boolean;
  };
  breadcrumbs: Array<{
    label: string;
    path: string;
  }>;
  lastActivity: number;
  online: boolean;
}

const initialState: UIState = {
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#ff9800',
  },
  language: {
    code: 'zh-CN',
    name: '中文',
    flag: '🇨🇳',
  },
  sidebarOpen: true,
  notifications: [],
  loading: {
    global: false,
    wallet: false,
    voting: false,
    nft: false,
    token: false,
  },
  modals: {
    walletConnect: false,
    nftTransfer: false,
    tokenStake: false,
    votingCreate: false,
    settings: false,
  },
  breadcrumbs: [],
  lastActivity: Date.now(),
  online: navigator.onLine,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light';
    },
    
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      // 保持最近100条通知
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    
    setBreadcrumbs: (state, action: PayloadAction<UIState['breadcrumbs']>) => {
      state.breadcrumbs = action.payload;
    },
    
    addBreadcrumb: (state, action: PayloadAction<UIState['breadcrumbs'][0]>) => {
      state.breadcrumbs.push(action.payload);
    },
    
    removeBreadcrumb: (state, action: PayloadAction<number>) => {
      state.breadcrumbs.splice(action.payload, 1);
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.online = action.payload;
    },
    
    resetUI: (state) => {
      state.sidebarOpen = true;
      state.notifications = [];
      state.loading = {
        global: false,
        wallet: false,
        voting: false,
        nft: false,
        token: false,
      };
      state.modals = {
        walletConnect: false,
        nftTransfer: false,
        tokenStake: false,
        votingCreate: false,
        settings: false,
      };
      state.breadcrumbs = [];
      state.lastActivity = Date.now();
      state.online = navigator.onLine;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  setLoading,
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  updateLastActivity,
  setOnlineStatus,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
