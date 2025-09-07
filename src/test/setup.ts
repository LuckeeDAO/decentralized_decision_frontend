import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { vi } from 'vitest'

// 配置测试库
configure({ testIdAttribute: 'data-testid' })

// Mock Web3相关模块
vi.mock('web3', () => ({
  default: vi.fn(() => ({
    eth: {
      getAccounts: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      getBalance: vi.fn().mockResolvedValue('1000000000000000000'),
      requestAccounts: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    },
  })),
}))

// Mock WalletConnect
vi.mock('@walletconnect/web3-provider', () => ({
  default: vi.fn(() => ({
    enable: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    disconnect: vi.fn().mockResolvedValue(undefined),
  })),
}))

// Mock Keplr
vi.mock('keplr-wallet', () => ({
  default: vi.fn(() => ({
    enable: vi.fn().mockResolvedValue(undefined),
    getKey: vi.fn().mockResolvedValue({
      address: 'cosmos1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
      algo: 'secp256k1',
      pubKey: new Uint8Array(33),
    }),
    signAmino: vi.fn().mockResolvedValue({
      signature: {
        signature: 'mock_signature',
        pub_key: {
          type: 'tendermint/PubKeySecp256k1',
          value: 'mock_pubkey',
        },
      },
      signed: {
        account_number: '1',
        chain_id: 'test-chain',
        fee: {
          amount: [{ denom: 'uluckee', amount: '1000' }],
          gas: '200000',
        },
        memo: '',
        msgs: [],
        sequence: '0',
      },
    }),
  })),
}))

// Mock Cosmos相关模块
vi.mock('@cosmjs/stargate', () => ({
  SigningStargateClient: vi.fn(() => ({
    connectWithSigner: vi.fn().mockResolvedValue({
      sendTokens: vi.fn().mockResolvedValue({
        transactionHash: 'mock_tx_hash',
        code: 0,
      }),
      signAndBroadcast: vi.fn().mockResolvedValue({
        transactionHash: 'mock_tx_hash',
        code: 0,
      }),
    }),
  })),
  GasPrice: vi.fn(() => ({
    fromString: vi.fn().mockReturnValue({
      denom: 'uluckee',
      amount: '0.001',
    }),
  })),
}))

// Mock API调用
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as any

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.REACT_APP_API_URL = 'http://localhost:8080'
process.env.REACT_APP_CHAIN_ID = 'test-chain'
process.env.REACT_APP_RPC_URL = 'http://localhost:26657'
