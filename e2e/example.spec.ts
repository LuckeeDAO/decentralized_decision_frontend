import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check if the main title is visible
  await expect(page.getByText('仪表板')).toBeVisible();
  
  // Check if navigation elements are present
  await expect(page.getByText('Luckee DAO 去中心化决策系统')).toBeVisible();
  
  // Check if wallet connect button is present
  await expect(page.getByText('连接钱包')).toBeVisible();
});

test('navigation works correctly', async ({ page }) => {
  await page.goto('/');
  
  // Test navigation to voting page
  await page.getByText('投票管理').click();
  await expect(page).toHaveURL('/voting');
  await expect(page.getByText('投票管理')).toBeVisible();
  
  // Test navigation to NFT page
  await page.getByText('NFT管理').click();
  await expect(page).toHaveURL('/nft');
  await expect(page.getByText('NFT管理')).toBeVisible();
  
  // Test navigation to token page
  await page.getByText('代币管理').click();
  await expect(page).toHaveURL('/token');
  await expect(page.getByText('治理代币管理')).toBeVisible();
});

test('wallet connect modal opens', async ({ page }) => {
  await page.goto('/');
  
  // Click wallet connect button
  await page.getByText('连接钱包').click();
  
  // Check if modal opens
  await expect(page.getByText('连接钱包')).toBeVisible();
  await expect(page.getByText('连接 Keplr')).toBeVisible();
  await expect(page.getByText('连接 MetaMask')).toBeVisible();
  await expect(page.getByText('连接 Injective')).toBeVisible();
});

test('help page loads and search works', async ({ page }) => {
  await page.goto('/help');
  
  // Check if help page loads
  await expect(page.getByText('帮助中心')).toBeVisible();
  
  // Test search functionality
  await page.getByPlaceholder('搜索帮助内容...').fill('钱包');
  
  // Check if FAQ sections are visible
  await expect(page.getByText('常见问题')).toBeVisible();
});

test('responsive design works on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Check if mobile navigation works
  await page.getByRole('button', { name: '打开菜单' }).click();
  
  // Check if sidebar opens
  await expect(page.getByText('投票管理')).toBeVisible();
});
