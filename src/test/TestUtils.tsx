import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../store';

// 创建测试用的主题
const testTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

// 创建测试用的QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={testTheme}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// 测试工具函数
export const testUtils = {
  // 模拟钱包连接
  mockWalletConnection: (address: string = 'test-address') => {
    return {
      isConnected: true,
      address,
      balance: '1000',
      chainId: 'test-chain',
      token: 'test-token',
      walletType: 'keplr' as const,
      permissions: {
        basic: true,
        creator: false,
        admin: false,
      },
    };
  },

  // 模拟投票数据
  mockVotingData: () => ({
    id: '1',
    title: '测试投票',
    description: '这是一个测试投票',
    status: 'active' as const,
    startTime: Date.now(),
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    revealTime: Date.now() + 6 * 24 * 60 * 60 * 1000,
    participants: ['test-address'],
    totalParticipants: 1,
  }),

  // 模拟NFT数据
  mockNFTData: () => ({
    id: '1',
    tokenId: 'NFT-001',
    name: '测试NFT',
    type: 'lottery',
    owner: 'test-address',
    status: 'active',
    createdAt: '2025-08-10',
    image: '/placeholder-nft.png',
  }),

  // 模拟API响应
  mockApiResponse: <T>(data: T) => ({
    data,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),

  // 等待异步操作
  waitFor: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
};

// 重新导出所有内容
export * from '@testing-library/react';
export { customRender as render };
export { AllTheProviders };
