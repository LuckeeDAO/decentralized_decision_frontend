import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { configureStore } from '@reduxjs/toolkit'
import { vi } from 'vitest'

// 创建测试用的Redux store
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { isAuthenticated: false, user: null }, action) => state,
      voting: (state = { sessions: [], currentSession: null }, action) => state,
      nft: (state = { nfts: [], metadata: {} }, action) => state,
      token: (state = { balance: 0, staked: 0, locked: 0 }, action) => state,
      ui: (state = { theme: 'light', language: 'zh', notifications: [] }, action) => state,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// 创建测试用的主题
export const createTestTheme = () => {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  })
}

// 自定义渲染函数
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any
  store?: any
  theme?: any
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    theme = createTestTheme(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  )

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock组件
export const MockComponent = ({ children, ...props }: any) => <div {...props}>{children}</div>

// Mock hooks
export const mockUseNavigate = () => {
  const mockNavigate = vi.fn()
  vi.doMock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    }
  })
  return mockNavigate
}

export const mockUseSelector = (mockState: any) => {
  vi.doMock('react-redux', async () => {
    const actual = await vi.importActual('react-redux')
    return {
      ...actual,
      useSelector: (selector: any) => selector(mockState),
    }
  })
}

export const mockUseDispatch = () => {
  const mockDispatch = vi.fn()
  vi.doMock('react-redux', async () => {
    const actual = await vi.importActual('react-redux')
    return {
      ...actual,
      useDispatch: () => mockDispatch,
    }
  })
  return mockDispatch
}

// 测试数据
export const mockUser = {
  id: '1',
  address: 'cosmos1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
  balance: 1000000,
  staked: 500000,
  locked: 100000,
  permissions: ['basic', 'creator'],
}

export const mockVotingSession = {
  id: '1',
  title: '测试投票',
  description: '这是一个测试投票',
  status: 'active',
  startTime: new Date('2025-08-01T00:00:00Z'),
  endTime: new Date('2025-08-02T00:00:00Z'),
  participants: 100,
  totalVotes: 50,
}

export const mockNFT = {
  id: '1',
  tokenId: 'nft-001',
  owner: 'cosmos1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
  type: 'lottery',
  metadata: {
    name: '测试NFT',
    description: '这是一个测试NFT',
    image: 'https://example.com/image.png',
    attributes: [
      { trait_type: 'Rarity', value: 'Common' },
      { trait_type: 'Level', value: 1 },
    ],
  },
  createdAt: new Date('2025-08-01T00:00:00Z'),
}

export const mockProposal = {
  id: 1,
  title: '测试提案',
  description: '这是一个测试提案',
  proposer: 'cosmos1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
  status: 'voting',
  type: 'parameter_change',
  content: {
    module: 'fee',
    key: 'min_gas_price',
    value: '0.002',
  },
  deposit: 1000,
  votingStart: new Date('2025-08-01T00:00:00Z'),
  votingEnd: new Date('2025-08-02T00:00:00Z'),
  voteTally: {
    yes: 60,
    no: 20,
    abstain: 10,
    noWithVeto: 5,
    total: 95,
  },
}

// 等待异步操作完成
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟API响应
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
})

// 模拟API错误
export const mockApiError = (message: string, status = 500) => ({
  ok: false,
  status,
  json: () => Promise.reject(new Error(message)),
  text: () => Promise.reject(new Error(message)),
})
