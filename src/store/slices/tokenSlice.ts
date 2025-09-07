import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  denom: string;
}

export interface StakingInfo {
  stakedAmount: string;
  unstakingAmount: string;
  rewards: string;
  stakingPeriod: number;
  unstakingPeriod: number;
  lastStakeTime: number;
  lastUnstakeTime: number;
}

export interface LockingInfo {
  lockedAmount: string;
  unlockTime: number;
  lockReason: string;
  isLocked: boolean;
}

export interface TokenOperation {
  id: string;
  type: 'stake' | 'unstake' | 'lock' | 'unlock' | 'transfer' | 'mint' | 'burn';
  amount: string;
  from: string;
  to: string;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
  blockNumber?: number;
}

export interface TokenState {
  balances: TokenBalance[];
  stakingInfo: StakingInfo | null;
  lockingInfo: LockingInfo | null;
  operations: TokenOperation[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  selectedToken: string | null;
}

const initialState: TokenState = {
  balances: [],
  stakingInfo: null,
  lockingInfo: null,
  operations: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedToken: null,
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setBalances: (state, action: PayloadAction<TokenBalance[]>) => {
      state.balances = action.payload;
      state.lastUpdated = Date.now();
    },
    
    updateBalance: (state, action: PayloadAction<{ address: string; balance: string }>) => {
      const { address, balance } = action.payload;
      const tokenIndex = state.balances.findIndex(token => token.address === address);
      if (tokenIndex !== -1) {
        state.balances[tokenIndex].balance = balance;
      }
    },
    
    setStakingInfo: (state, action: PayloadAction<StakingInfo | null>) => {
      state.stakingInfo = action.payload;
    },
    
    updateStakingInfo: (state, action: PayloadAction<Partial<StakingInfo>>) => {
      if (state.stakingInfo) {
        state.stakingInfo = { ...state.stakingInfo, ...action.payload };
      }
    },
    
    setLockingInfo: (state, action: PayloadAction<LockingInfo | null>) => {
      state.lockingInfo = action.payload;
    },
    
    updateLockingInfo: (state, action: PayloadAction<Partial<LockingInfo>>) => {
      if (state.lockingInfo) {
        state.lockingInfo = { ...state.lockingInfo, ...action.payload };
      }
    },
    
    setOperations: (state, action: PayloadAction<TokenOperation[]>) => {
      state.operations = action.payload;
    },
    
    addOperation: (state, action: PayloadAction<TokenOperation>) => {
      state.operations.unshift(action.payload);
      // 保持最近1000条记录
      if (state.operations.length > 1000) {
        state.operations = state.operations.slice(0, 1000);
      }
    },
    
    updateOperation: (state, action: PayloadAction<{ id: string; updates: Partial<TokenOperation> }>) => {
      const { id, updates } = action.payload;
      const operationIndex = state.operations.findIndex(op => op.id === id);
      if (operationIndex !== -1) {
        state.operations[operationIndex] = { ...state.operations[operationIndex], ...updates };
      }
    },
    
    setSelectedToken: (state, action: PayloadAction<string | null>) => {
      state.selectedToken = action.payload;
    },
    
    clearTokenData: (state) => {
      state.balances = [];
      state.stakingInfo = null;
      state.lockingInfo = null;
      state.operations = [];
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
      state.selectedToken = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setBalances,
  updateBalance,
  setStakingInfo,
  updateStakingInfo,
  setLockingInfo,
  updateLockingInfo,
  setOperations,
  addOperation,
  updateOperation,
  setSelectedToken,
  clearTokenData,
} = tokenSlice.actions;

export default tokenSlice.reducer;
