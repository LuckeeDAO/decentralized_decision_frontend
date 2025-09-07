import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: string | null;
  token: string | null;
  walletType: 'keplr' | 'metamask' | 'injective' | null;
  permissions: {
    basic: boolean;
    creator: boolean;
    admin: boolean;
  };
  lastConnected: number | null;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: null,
  chainId: null,
  token: null,
  walletType: null,
  permissions: {
    basic: false,
    creator: false,
    admin: false,
  },
  lastConnected: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectWallet: (state, action: PayloadAction<{
      address: string;
      chainId: string;
      walletType: 'keplr' | 'metamask' | 'injective';
      token?: string;
    }>) => {
      state.isConnected = true;
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.walletType = action.payload.walletType;
      state.token = action.payload.token || null;
      state.lastConnected = Date.now();
    },
    
    disconnectWallet: (state) => {
      state.isConnected = false;
      state.address = null;
      state.balance = null;
      state.chainId = null;
      state.token = null;
      state.walletType = null;
      state.permissions = {
        basic: false,
        creator: false,
        admin: false,
      };
      state.lastConnected = null;
    },
    
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    
    updatePermissions: (state, action: PayloadAction<{
      basic: boolean;
      creator: boolean;
      admin: boolean;
    }>) => {
      state.permissions = action.payload;
    },
    
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    
    setWalletError: (state, action: PayloadAction<string>) => {
      // 可以添加错误状态处理
      console.error('Wallet error:', action.payload);
    },
  },
});

export const {
  connectWallet,
  disconnectWallet,
  updateBalance,
  updatePermissions,
  updateToken,
  setWalletError,
} = walletSlice.actions;

export default walletSlice.reducer;
