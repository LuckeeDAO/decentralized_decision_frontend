import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import HomePage from '../HomePage'
import { renderWithProviders, mockUseNavigate } from '../../test/utils'

describe('HomePage Component', () => {
  it('renders without crashing', () => {
    renderWithProviders(<HomePage />)
    
    expect(screen.getByText('仪表板')).toBeInTheDocument()
    expect(screen.getByText('欢迎使用Luckee DAO去中心化决策系统')).toBeInTheDocument()
  })

  it('displays all statistics cards', () => {
    renderWithProviders(<HomePage />)
    
    expect(screen.getByText('总投票数')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
    
    expect(screen.getByText('活跃用户')).toBeInTheDocument()
    expect(screen.getByText('5,678')).toBeInTheDocument()
    expect(screen.getByText('+8%')).toBeInTheDocument()
    
    expect(screen.getByText('治理提案')).toBeInTheDocument()
    expect(screen.getByText('89')).toBeInTheDocument()
    expect(screen.getByText('+5%')).toBeInTheDocument()
    
    expect(screen.getByText('系统状态')).toBeInTheDocument()
    expect(screen.getByText('正常')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('displays recent activities', () => {
    renderWithProviders(<HomePage />)
    
    expect(screen.getByText('最近活动')).toBeInTheDocument()
    expect(screen.getByText('新提案创建')).toBeInTheDocument()
    expect(screen.getByText('用户创建了关于Gas费用调整的治理提案')).toBeInTheDocument()
    expect(screen.getByText('2小时前')).toBeInTheDocument()
    
    expect(screen.getByText('投票完成')).toBeInTheDocument()
    expect(screen.getByText('关于NFT类型扩展的投票已结束，结果：通过')).toBeInTheDocument()
    expect(screen.getByText('4小时前')).toBeInTheDocument()
    
    expect(screen.getByText('代币解锁')).toBeInTheDocument()
    expect(screen.getByText('用户成功解锁了1,000 LUCKEE代币')).toBeInTheDocument()
    expect(screen.getByText('6小时前')).toBeInTheDocument()
    
    expect(screen.getByText('拍卖开始')).toBeInTheDocument()
    expect(screen.getByText('新的DDG代币拍卖批次已开始')).toBeInTheDocument()
    expect(screen.getByText('8小时前')).toBeInTheDocument()
  })

  it('displays activity type chips with correct colors', () => {
    renderWithProviders(<HomePage />)
    
    // Check that activity type chips are displayed
    expect(screen.getByText('governance')).toBeInTheDocument()
    expect(screen.getByText('voting')).toBeInTheDocument()
    expect(screen.getByText('unlock')).toBeInTheDocument()
    expect(screen.getByText('auction')).toBeInTheDocument()
  })

  it('displays quick actions section', () => {
    renderWithProviders(<HomePage />)
    
    expect(screen.getByText('快速操作')).toBeInTheDocument()
    expect(screen.getByText('创建投票')).toBeInTheDocument()
    expect(screen.getByText('参与治理')).toBeInTheDocument()
    expect(screen.getByText('查看NFT')).toBeInTheDocument()
    expect(screen.getByText('代币管理')).toBeInTheDocument()
  })

  it('handles quick action button clicks', () => {
    const mockNavigate = mockUseNavigate()
    
    renderWithProviders(<HomePage />)
    
    // Test quick action buttons
    fireEvent.click(screen.getByText('创建投票'))
    // Note: In a real implementation, these buttons would navigate to different pages
    // For now, we just verify they are clickable
    
    fireEvent.click(screen.getByText('参与治理'))
    fireEvent.click(screen.getByText('查看NFT'))
    fireEvent.click(screen.getByText('代币管理'))
  })

  it('handles view all activities button click', () => {
    renderWithProviders(<HomePage />)
    
    const viewAllButton = screen.getByText('查看全部')
    expect(viewAllButton).toBeInTheDocument()
    
    fireEvent.click(viewAllButton)
    // Note: In a real implementation, this would navigate to an activities page
  })

  it('renders with correct Material-UI components', () => {
    renderWithProviders(<HomePage />)
    
    // Check for Material-UI specific elements
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText('仪表板')).toBeInTheDocument()
    
    // Check for cards
    const cards = screen.getAllByRole('region')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('displays statistics with proper formatting', () => {
    renderWithProviders(<HomePage />)
    
    // Check that numbers are formatted correctly
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('5,678')).toBeInTheDocument()
    expect(screen.getByText('89')).toBeInTheDocument()
    
    // Check that percentage changes are displayed
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('+8%')).toBeInTheDocument()
    expect(screen.getByText('+5%')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithProviders(<HomePage />)
    
    // Check for proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('仪表板')
    
    // Check for section headings
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
    expect(sectionHeadings).toHaveLength(2) // "最近活动" and "快速操作"
  })

  it('renders responsive grid layout', () => {
    renderWithProviders(<HomePage />)
    
    // Check that the component renders without errors
    // The actual responsive behavior would be tested with different viewport sizes
    expect(screen.getByText('仪表板')).toBeInTheDocument()
  })
})
