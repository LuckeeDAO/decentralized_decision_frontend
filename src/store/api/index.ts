import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API基础配置
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  prepareHeaders: (headers, { getState }) => {
    // 从Redux状态获取认证信息
    const state = getState() as any;
    const token = state.wallet?.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // 设置其他通用头部
    headers.set('content-type', 'application/json');
    headers.set('x-api-version', 'v2');
    
    return headers;
  },
});

// 错误处理
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // 处理认证错误
    api.dispatch({ type: 'wallet/disconnectWallet' });
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Proposal', 
    'Vote', 
    'NFT', 
    'Token', 
    'Governance',
    'Auction',
    'Unlock',
    'Gas'
  ],
  endpoints: (builder) => ({
    // 投票相关API
    getProposals: builder.query({
      query: (params = {}) => ({
        url: '/v2/gov/proposals',
        params,
      }),
      providesTags: ['Proposal'],
    }),
    
    createProposal: builder.mutation({
      query: (data) => ({
        url: '/v2/gov/propose',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Proposal'],
    }),
    
    vote: builder.mutation({
      query: (data) => ({
        url: '/v2/gov/vote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Proposal', 'Vote'],
    }),
    
    executeProposal: builder.mutation({
      query: (data) => ({
        url: '/v2/gov/execute',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Proposal'],
    }),
    
    // NFT相关API
    getNFTs: builder.query({
      query: (params = {}) => ({
        url: '/nft/list',
        params,
      }),
      providesTags: ['NFT'],
    }),
    
    getNFTDetail: builder.query({
      query: (id) => `/nft/${id}`,
      providesTags: (result, error, id) => [{ type: 'NFT', id }],
    }),
    
    transferNFT: builder.mutation({
      query: (data) => ({
        url: '/nft/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NFT'],
    }),
    
    // 代币相关API
    getTokenBalance: builder.query({
      query: (address) => `/token/balance/${address}`,
      providesTags: ['Token'],
    }),
    
    stakeToken: builder.mutation({
      query: (data) => ({
        url: '/token/stake',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Token'],
    }),
    
    unstakeToken: builder.mutation({
      query: (data) => ({
        url: '/token/unstake',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Token'],
    }),
    
    // Gas费用相关API
    calculateGas: builder.mutation({
      query: (data) => ({
        url: '/v2/gas/calc',
        method: 'POST',
        body: data,
      }),
    }),
    
    payGas: builder.mutation({
      query: (data) => ({
        url: '/v2/gas/pay',
        method: 'POST',
        body: data,
      }),
    }),
    
    // 解锁相关API
    getUnlockBudget: builder.query({
      query: () => '/v2/unlock/budget',
      providesTags: ['Unlock'],
    }),
    
    recordRevenue: builder.mutation({
      query: (data) => ({
        url: '/v2/unlock/revenue',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Unlock'],
    }),
    
    claimUnlock: builder.mutation({
      query: (data) => ({
        url: '/v2/unlock/claim',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Unlock'],
    }),
    
    // 拍卖相关API
    getAuctionBatches: builder.query({
      query: (params = {}) => ({
        url: '/v2/auction/batches',
        params,
      }),
      providesTags: ['Auction'],
    }),
    
    submitSealedBid: builder.mutation({
      query: (data) => ({
        url: '/v2/auction/submit-sealed-bid',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auction'],
    }),
    
    revealBid: builder.mutation({
      query: (data) => ({
        url: '/v2/auction/reveal',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auction'],
    }),
    
    // 通用API
    getSystemStatus: builder.query({
      query: () => '/v2/common/status',
    }),
  }),
});

export const {
  // 投票相关
  useGetProposalsQuery,
  useCreateProposalMutation,
  useVoteMutation,
  useExecuteProposalMutation,
  
  // NFT相关
  useGetNFTsQuery,
  useGetNFTDetailQuery,
  useTransferNFTMutation,
  
  // 代币相关
  useGetTokenBalanceQuery,
  useStakeTokenMutation,
  useUnstakeTokenMutation,
  
  // Gas费用相关
  useCalculateGasMutation,
  usePayGasMutation,
  
  // 解锁相关
  useGetUnlockBudgetQuery,
  useRecordRevenueMutation,
  useClaimUnlockMutation,
  
  // 拍卖相关
  useGetAuctionBatchesQuery,
  useSubmitSealedBidMutation,
  useRevealBidMutation,
  
  // 通用
  useGetSystemStatusQuery,
} = api;
