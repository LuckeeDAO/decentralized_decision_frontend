import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface NFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  owner: string;
  metadata: NFTMetadata;
  metadataUri: string;
  type: 'lottery' | 'governance' | 'allocation' | 'custom';
  status: 'active' | 'locked' | 'transferred' | 'burned';
  createdAt: number;
  updatedAt: number;
  transferHistory: Array<{
    from: string;
    to: string;
    timestamp: number;
    txHash: string;
  }>;
}

export interface NFTType {
  id: string;
  name: string;
  description: string;
  schema: any;
  permissions: {
    canCreate: boolean;
    canTransfer: boolean;
    canBurn: boolean;
    canUpdate: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

export interface NFTState {
  userNFTs: NFT[];
  allNFTs: NFT[];
  nftTypes: NFTType[];
  selectedNFT: NFT | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  filters: {
    type?: string;
    status?: string;
    owner?: string;
  };
  sortBy: 'createdAt' | 'updatedAt' | 'tokenId' | 'name';
  sortOrder: 'asc' | 'desc';
}

const initialState: NFTState = {
  userNFTs: [],
  allNFTs: [],
  nftTypes: [],
  selectedNFT: null,
  loading: false,
  error: null,
  lastUpdated: null,
  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setUserNFTs: (state, action: PayloadAction<NFT[]>) => {
      state.userNFTs = action.payload;
      state.lastUpdated = Date.now();
    },
    
    setAllNFTs: (state, action: PayloadAction<NFT[]>) => {
      state.allNFTs = action.payload;
      state.lastUpdated = Date.now();
    },
    
    setNFTTypes: (state, action: PayloadAction<NFTType[]>) => {
      state.nftTypes = action.payload;
    },
    
    setSelectedNFT: (state, action: PayloadAction<NFT | null>) => {
      state.selectedNFT = action.payload;
    },
    
    addNFT: (state, action: PayloadAction<NFT>) => {
      state.allNFTs.push(action.payload);
      if (action.payload.owner === state.userNFTs[0]?.owner) {
        state.userNFTs.push(action.payload);
      }
    },
    
    updateNFT: (state, action: PayloadAction<{ id: string; updates: Partial<NFT> }>) => {
      const { id, updates } = action.payload;
      
      // 更新所有NFT列表
      const nftIndex = state.allNFTs.findIndex(nft => nft.id === id);
      if (nftIndex !== -1) {
        state.allNFTs[nftIndex] = { ...state.allNFTs[nftIndex], ...updates };
      }
      
      // 更新用户NFT列表
      const userNftIndex = state.userNFTs.findIndex(nft => nft.id === id);
      if (userNftIndex !== -1) {
        state.userNFTs[userNftIndex] = { ...state.userNFTs[userNftIndex], ...updates };
      }
      
      // 更新选中的NFT
      if (state.selectedNFT?.id === id) {
        state.selectedNFT = { ...state.selectedNFT, ...updates };
      }
    },
    
    removeNFT: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.allNFTs = state.allNFTs.filter(nft => nft.id !== id);
      state.userNFTs = state.userNFTs.filter(nft => nft.id !== id);
      if (state.selectedNFT?.id === id) {
        state.selectedNFT = null;
      }
    },
    
    addTransferRecord: (state, action: PayloadAction<{
      nftId: string;
      transfer: {
        from: string;
        to: string;
        timestamp: number;
        txHash: string;
      };
    }>) => {
      const { nftId, transfer } = action.payload;
      
      // 更新所有NFT列表
      const nftIndex = state.allNFTs.findIndex(nft => nft.id === nftId);
      if (nftIndex !== -1) {
        state.allNFTs[nftIndex].transferHistory.push(transfer);
        state.allNFTs[nftIndex].updatedAt = Date.now();
      }
      
      // 更新用户NFT列表
      const userNftIndex = state.userNFTs.findIndex(nft => nft.id === nftId);
      if (userNftIndex !== -1) {
        state.userNFTs[userNftIndex].transferHistory.push(transfer);
        state.userNFTs[userNftIndex].updatedAt = Date.now();
      }
      
      // 更新选中的NFT
      if (state.selectedNFT?.id === nftId) {
        state.selectedNFT.transferHistory.push(transfer);
        state.selectedNFT.updatedAt = Date.now();
      }
    },
    
    setFilters: (state, action: PayloadAction<Partial<NFTState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setSortBy: (state, action: PayloadAction<NFTState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<NFTState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    
    clearNFTData: (state) => {
      state.userNFTs = [];
      state.allNFTs = [];
      state.nftTypes = [];
      state.selectedNFT = null;
      state.loading = false;
      state.error = null;
      state.lastUpdated = null;
      state.filters = {};
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
    },
  },
});

export const {
  setLoading,
  setError,
  setUserNFTs,
  setAllNFTs,
  setNFTTypes,
  setSelectedNFT,
  addNFT,
  updateNFT,
  removeNFT,
  addTransferRecord,
  setFilters,
  setSortBy,
  setSortOrder,
  clearNFTData,
} = nftSlice.actions;

export default nftSlice.reducer;
