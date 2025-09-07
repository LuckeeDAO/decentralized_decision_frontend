import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Layout from '../index'
import { renderWithProviders, mockUser, mockUseNavigate } from '../../../test/utils'

// Mock useWallet hook
const mockUseWallet = {
  isConnected: false,
  address: null,
  balance: 0,
  connect: vi.fn(),
  disconnect: vi.fn(),
}

vi.mock('../../../hooks/useWallet', () => ({
  useWallet: () => mockUseWallet,
}))

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Luckee DAO 去中心化决策系统')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('displays wallet connect button when not connected', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('连接钱包')).toBeInTheDocument()
    expect(screen.queryByText(/余额:/)).not.toBeInTheDocument()
  })

  it('displays wallet info when connected', () => {
    mockUseWallet.isConnected = true
    mockUseWallet.address = 'cosmos1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    mockUseWallet.balance = 1000000

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('cosmos1abc...vwx234yz')).toBeInTheDocument()
    expect(screen.getByText('余额: 1000000 LUCKEE')).toBeInTheDocument()
    expect(screen.getByText('断开连接')).toBeInTheDocument()
  })

  it('renders navigation menu items', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('仪表板')).toBeInTheDocument()
    expect(screen.getByText('投票管理')).toBeInTheDocument()
    expect(screen.getByText('NFT管理')).toBeInTheDocument()
    expect(screen.getByText('代币管理')).toBeInTheDocument()
    expect(screen.getByText('治理')).toBeInTheDocument()
    expect(screen.getByText('设置')).toBeInTheDocument()
  })

  it('handles menu item clicks', () => {
    const mockNavigate = mockUseNavigate()
    
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    fireEvent.click(screen.getByText('投票管理'))
    expect(mockNavigate).toHaveBeenCalledWith('/voting')
  })

  it('handles wallet connect button click', () => {
    const mockDispatch = vi.fn()
    vi.doMock('react-redux', async () => {
      const actual = await vi.importActual('react-redux')
      return {
        ...actual,
        useDispatch: () => mockDispatch,
      }
    })

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    fireEvent.click(screen.getByText('连接钱包'))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ui/openModal',
      payload: 'walletConnect',
    })
  })

  it('handles wallet disconnect button click', () => {
    mockUseWallet.isConnected = true
    mockUseWallet.address = 'cosmos1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
    mockUseWallet.balance = 1000000

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    fireEvent.click(screen.getByText('断开连接'))
    expect(mockUseWallet.disconnect).toHaveBeenCalled()
  })

  it('displays notification badge when there are unread notifications', () => {
    const preloadedState = {
      ui: {
        sidebarOpen: false,
        notifications: [
          { id: '1', message: 'Test notification', read: false, timestamp: new Date() },
          { id: '2', message: 'Another notification', read: true, timestamp: new Date() },
        ],
      },
    }

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { preloadedState }
    )
    
    expect(screen.getByText('1')).toBeInTheDocument() // Badge content
  })

  it('handles drawer toggle', () => {
    const mockDispatch = vi.fn()
    vi.doMock('react-redux', async () => {
      const actual = await vi.importActual('react-redux')
      return {
        ...actual,
        useDispatch: () => mockDispatch,
      }
    })

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    fireEvent.click(screen.getByLabelText('打开菜单'))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ui/toggleSidebar',
    })
  })

  it('highlights active menu item based on current path', () => {
    const mockLocation = {
      pathname: '/voting',
      search: '',
      hash: '',
      state: null,
    }

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useLocation: () => mockLocation,
      }
    })

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    const votingMenuItem = screen.getByText('投票管理').closest('[role="button"]')
    expect(votingMenuItem).toHaveClass('Mui-selected')
  })

  it('renders mobile drawer on small screens', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    })

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    // The mobile drawer should be present
    expect(screen.getByRole('presentation')).toBeInTheDocument()
  })

  it('renders desktop drawer on large screens', () => {
    // Mock window.innerWidth for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    })

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    // The desktop drawer should be present
    expect(screen.getByRole('presentation')).toBeInTheDocument()
  })
})
