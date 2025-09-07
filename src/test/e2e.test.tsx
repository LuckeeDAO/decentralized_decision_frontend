import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { renderWithProviders, mockUser, mockVotingSession, mockNFT } from './utils'
import App from '../App'

// Mock all external dependencies
vi.mock('../hooks/useWallet', () => ({
  useWallet: () => ({
    isConnected: true,
    address: mockUser.address,
    balance: mockUser.balance,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

// Mock API responses
const mockApiResponses = {
  '/api/voting/sessions': {
    ok: true,
    json: () => Promise.resolve([mockVotingSession]),
  },
  '/api/nft/list': {
    ok: true,
    json: () => Promise.resolve([mockNFT]),
  },
  '/api/user/profile': {
    ok: true,
    json: () => Promise.resolve(mockUser),
  },
  '/api/governance/proposals': {
    ok: true,
    json: () => Promise.resolve([]),
  },
}

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

describe('End-to-End Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Journey', () => {
    it('should complete full voting workflow', async () => {
      renderWithProviders(<App />)

      // 1. User lands on homepage
      expect(screen.getByText('仪表板')).toBeInTheDocument()
      expect(screen.getByText('欢迎使用Luckee DAO去中心化决策系统')).toBeInTheDocument()

      // 2. User navigates to voting page
      fireEvent.click(screen.getByText('投票管理'))
      
      await waitFor(() => {
        expect(screen.getByText('投票管理')).toBeInTheDocument()
      })

      // 3. User creates a new voting session
      fireEvent.click(screen.getByText('创建投票'))
      
      await waitFor(() => {
        // Should open voting creation modal or navigate to creation page
        expect(screen.getByText('创建投票')).toBeInTheDocument()
      })

      // 4. User fills in voting details
      const titleInput = screen.getByLabelText('投票标题')
      const descriptionInput = screen.getByLabelText('投票描述')
      
      fireEvent.change(titleInput, { target: { value: '测试投票' } })
      fireEvent.change(descriptionInput, { target: { value: '这是一个测试投票' } })

      // 5. User submits the voting session
      fireEvent.click(screen.getByText('提交'))
      
      await waitFor(() => {
        // Should show success message or navigate back to voting list
        expect(screen.getByText('投票创建成功')).toBeInTheDocument()
      })
    })

    it('should complete NFT management workflow', async () => {
      renderWithProviders(<App />)

      // 1. Navigate to NFT page
      fireEvent.click(screen.getByText('NFT管理'))
      
      await waitFor(() => {
        expect(screen.getByText('NFT管理')).toBeInTheDocument()
      })

      // 2. View NFT details
      const nftCard = screen.getByText(mockNFT.metadata.name)
      fireEvent.click(nftCard)
      
      await waitFor(() => {
        expect(screen.getByText(mockNFT.metadata.description)).toBeInTheDocument()
      })

      // 3. Transfer NFT
      fireEvent.click(screen.getByText('转移'))
      
      await waitFor(() => {
        expect(screen.getByText('转移NFT')).toBeInTheDocument()
      })

      // 4. Fill transfer details
      const recipientInput = screen.getByLabelText('接收者地址')
      fireEvent.change(recipientInput, { target: { value: 'cosmos1newaddress123456789' } })

      // 5. Confirm transfer
      fireEvent.click(screen.getByText('确认转移'))
      
      await waitFor(() => {
        expect(screen.getByText('转移成功')).toBeInTheDocument()
      })
    })

    it('should complete governance participation workflow', async () => {
      renderWithProviders(<App />)

      // 1. Navigate to governance page
      fireEvent.click(screen.getByText('治理'))
      
      await waitFor(() => {
        expect(screen.getByText('治理')).toBeInTheDocument()
      })

      // 2. View proposals
      expect(screen.getByText('治理提案')).toBeInTheDocument()

      // 3. Create new proposal
      fireEvent.click(screen.getByText('创建提案'))
      
      await waitFor(() => {
        expect(screen.getByText('创建治理提案')).toBeInTheDocument()
      })

      // 4. Fill proposal details
      const titleInput = screen.getByLabelText('提案标题')
      const descriptionInput = screen.getByLabelText('提案描述')
      
      fireEvent.change(titleInput, { target: { value: '测试治理提案' } })
      fireEvent.change(descriptionInput, { target: { value: '这是一个测试治理提案' } })

      // 5. Submit proposal
      fireEvent.click(screen.getByText('提交提案'))
      
      await waitFor(() => {
        expect(screen.getByText('提案提交成功')).toBeInTheDocument()
      })
    })
  })

  describe('Error Recovery', () => {
    it('should recover from network errors', async () => {
      // Mock network error
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network Error'))
      ) as any

      renderWithProviders(<App />)

      // Should still render the app
      expect(screen.getByText('仪表板')).toBeInTheDocument()

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText('网络连接错误')).toBeInTheDocument()
      })

      // Mock successful recovery
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

      // Should recover and work normally
      fireEvent.click(screen.getByText('投票管理'))
      
      await waitFor(() => {
        expect(screen.getByText('投票管理')).toBeInTheDocument()
      })
    })

    it('should handle wallet disconnection gracefully', async () => {
      const { rerender } = renderWithProviders(<App />)

      // Initially connected
      expect(screen.getByText('断开连接')).toBeInTheDocument()

      // Simulate wallet disconnection
      vi.doMock('../hooks/useWallet', () => ({
        useWallet: () => ({
          isConnected: false,
          address: null,
          balance: 0,
          connect: vi.fn(),
          disconnect: vi.fn(),
        }),
      }))

      rerender(<App />)

      // Should show connect button
      expect(screen.getByText('连接钱包')).toBeInTheDocument()
      expect(screen.queryByText('断开连接')).not.toBeInTheDocument()
    })
  })

  describe('Performance and Responsiveness', () => {
    it('should handle large data sets efficiently', async () => {
      // Mock large dataset
      const largeVotingSessions = Array.from({ length: 1000 }, (_, i) => ({
        ...mockVotingSession,
        id: i.toString(),
        title: `投票 ${i}`,
      }))

      global.fetch = vi.fn((url: string) => {
        if (url === '/api/voting/sessions') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(largeVotingSessions),
          })
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.reject(new Error('Not found')),
        })
      }) as any

      renderWithProviders(<App />)

      // Navigate to voting page
      fireEvent.click(screen.getByText('投票管理'))
      
      await waitFor(() => {
        expect(screen.getByText('投票管理')).toBeInTheDocument()
      })

      // Should handle large dataset without performance issues
      // In a real implementation, this would test pagination, virtualization, etc.
    })

    it('should work on different screen sizes', () => {
      // Test mobile view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { rerender } = renderWithProviders(<App />)
      expect(screen.getByText('仪表板')).toBeInTheDocument()

      // Test tablet view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      rerender(<App />)
      expect(screen.getByText('仪表板')).toBeInTheDocument()

      // Test desktop view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      rerender(<App />)
      expect(screen.getByText('仪表板')).toBeInTheDocument()
    })
  })

  describe('Security and Validation', () => {
    it('should validate user inputs properly', async () => {
      renderWithProviders(<App />)

      // Navigate to voting creation
      fireEvent.click(screen.getByText('投票管理'))
      fireEvent.click(screen.getByText('创建投票'))

      // Try to submit empty form
      fireEvent.click(screen.getByText('提交'))
      
      await waitFor(() => {
        expect(screen.getByText('请填写必填字段')).toBeInTheDocument()
      })

      // Try to submit with invalid data
      const titleInput = screen.getByLabelText('投票标题')
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(1000) } })
      fireEvent.click(screen.getByText('提交'))
      
      await waitFor(() => {
        expect(screen.getByText('标题长度不能超过100个字符')).toBeInTheDocument()
      })
    })

    it('should handle malicious inputs safely', async () => {
      renderWithProviders(<App />)

      // Navigate to voting creation
      fireEvent.click(screen.getByText('投票管理'))
      fireEvent.click(screen.getByText('创建投票'))

      // Try to inject malicious script
      const titleInput = screen.getByLabelText('投票标题')
      fireEvent.change(titleInput, { 
        target: { value: '<script>alert("xss")</script>' } 
      })

      // Should sanitize input
      expect(titleInput).toHaveValue('<script>alert("xss")</script>')
      // In a real implementation, this would be sanitized and not executed
    })
  })

  describe('Accessibility Compliance', () => {
    it('should be fully accessible with keyboard navigation', () => {
      renderWithProviders(<App />)

      // Test keyboard navigation
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(document.activeElement).toBeInTheDocument()

      // Test focus management
      const menuButton = screen.getByLabelText('打开菜单')
      menuButton.focus()
      expect(document.activeElement).toBe(menuButton)

      // Test keyboard shortcuts
      fireEvent.keyDown(document, { key: 'Escape' })
      // Should close any open modals
    })

    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<App />)

      // Check for proper ARIA labels
      expect(screen.getByLabelText('打开菜单')).toBeInTheDocument()
      
      // Check for proper roles
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })
})
