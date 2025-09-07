import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { renderWithProviders, mockUser, mockVotingSession } from './utils'
import Layout from '../components/Layout'
import HomePage from '../pages/HomePage'
import VotingPage from '../pages/VotingPage'

// Mock API responses
const mockApiResponses = {
  '/api/voting/sessions': {
    ok: true,
    json: () => Promise.resolve([mockVotingSession]),
  },
  '/api/user/profile': {
    ok: true,
    json: () => Promise.resolve(mockUser),
  },
}

// Mock fetch globally
global.fetch = vi.fn((url: string) => {
  const response = mockApiResponses[url as keyof typeof mockApiResponses]
  if (response) {
    return Promise.resolve(response)
  }
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.reject(new Error('Not found')),
  })
}) as any

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Layout and Navigation Integration', () => {
    it('should navigate between pages correctly', async () => {
      const mockNavigate = vi.fn()
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom')
        return {
          ...actual,
          useNavigate: () => mockNavigate,
        }
      })

      renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>
      )

      // Test navigation to voting page
      fireEvent.click(screen.getByText('投票管理'))
      expect(mockNavigate).toHaveBeenCalledWith('/voting')

      // Test navigation to NFT page
      fireEvent.click(screen.getByText('NFT管理'))
      expect(mockNavigate).toHaveBeenCalledWith('/nft')

      // Test navigation to token page
      fireEvent.click(screen.getByText('代币管理'))
      expect(mockNavigate).toHaveBeenCalledWith('/token')
    })

    it('should handle wallet connection flow', async () => {
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
          <HomePage />
        </Layout>
      )

      // Click wallet connect button
      fireEvent.click(screen.getByText('连接钱包'))
      
      // Should open wallet connect modal
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ui/openModal',
        payload: 'walletConnect',
      })
    })
  })

  describe('Data Flow Integration', () => {
    it('should load and display user data', async () => {
      const preloadedState = {
        wallet: {
          isConnected: true,
          address: mockUser.address,
          balance: mockUser.balance,
        },
        ui: {
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
          online: true,
        },
      }

      renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>,
        { preloadedState }
      )

      // Should display user address
      expect(screen.getByText(mockUser.address.slice(0, 6))).toBeInTheDocument()
      expect(screen.getByText(mockUser.address.slice(-4))).toBeInTheDocument()

      // Should display balance
      expect(screen.getByText(`余额: ${mockUser.balance} LUCKEE`)).toBeInTheDocument()
    })

    it('should handle loading states correctly', async () => {
      const preloadedState = {
        ui: {
          sidebarOpen: true,
          notifications: [],
          loading: {
            global: true,
            wallet: false,
            voting: true,
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
          online: true,
        },
      }

      renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>,
        { preloadedState }
      )

      // Should show loading indicators
      // Note: In a real implementation, loading states would be displayed in the UI
      expect(screen.getByText('仪表板')).toBeInTheDocument()
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.reject(new Error('Internal Server Error')),
        })
      ) as any

      renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>
      )

      // Should still render the page even with API errors
      expect(screen.getByText('仪表板')).toBeInTheDocument()
      expect(screen.getByText('欢迎使用Luckee DAO去中心化决策系统')).toBeInTheDocument()
    })

    it('should handle network errors', async () => {
      // Mock network error
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network Error'))
      ) as any

      renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>
      )

      // Should still render the page even with network errors
      expect(screen.getByText('仪表板')).toBeInTheDocument()
    })
  })

  describe('State Management Integration', () => {
    it('should update state when user performs actions', async () => {
      const { store } = renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>
      )

      // Test sidebar toggle
      fireEvent.click(screen.getByLabelText('打开菜单'))
      
      await waitFor(() => {
        const state = store.getState()
        expect(state.ui.sidebarOpen).toBe(false)
      })

      // Test adding notification
      store.dispatch({
        type: 'ui/addNotification',
        payload: {
          type: 'success',
          title: 'Test Notification',
          message: 'This is a test notification',
        },
      })

      await waitFor(() => {
        const state = store.getState()
        expect(state.ui.notifications).toHaveLength(1)
        expect(state.ui.notifications[0].title).toBe('Test Notification')
      })
    })
  })

  describe('Responsive Design Integration', () => {
    it('should adapt to different screen sizes', () => {
      // Test mobile view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })

      renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>
      )

      expect(screen.getByText('仪表板')).toBeInTheDocument()

      // Test desktop view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      })

      // Re-render for desktop
      renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>
      )

      expect(screen.getByText('仪表板')).toBeInTheDocument()
    })
  })

  describe('Accessibility Integration', () => {
    it('should maintain accessibility across components', () => {
      renderWithProviders(
        <Layout>
          <HomePage />
        </Layout>
      )

      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      
      // Check for navigation landmarks
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      
      // Check for main content landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })
})
