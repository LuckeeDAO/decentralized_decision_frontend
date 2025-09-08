# Luckee DAO 前端 Vercel 迁移实施方案

## 概述

本文档详细描述了将 Luckee DAO 前端项目从 GitHub Pages 迁移到 Vercel 的完整实施方案，包括迁移步骤、配置优化、功能增强和后续维护。

## 迁移目标

### 1. 主要目标
- 从 GitHub Pages 迁移到 Vercel
- 提升部署性能和开发体验
- 为 Injective 区块链集成做准备
- 支持服务器端功能和 API 路由

### 2. 预期收益
- **性能提升**: 边缘计算和全球 CDN
- **开发效率**: 自动预览部署和 CI/CD
- **功能扩展**: 支持 API 路由和服务器端功能
- **成本优化**: 更好的免费额度和按需付费

## 迁移前准备

### 1. 环境检查
```bash
# 检查 Node.js 版本
node --version  # 需要 18.0.0+

# 检查 npm 版本
npm --version   # 需要 8.0.0+

# 检查 Git 状态
git status
git log --oneline -5
```

### 2. 依赖安装
```bash
# 安装 Vercel CLI
npm install -g vercel

# 验证安装
vercel --version
```

### 3. 项目备份
```bash
# 创建迁移分支
git checkout -b migration/vercel-deployment

# 备份当前配置
cp package.json package.json.backup
cp vite.config.ts vite.config.ts.backup
```

## 阶段 1: 基础迁移 (第1-2天)

### 1.1 Vercel 项目初始化

#### 步骤 1: 登录 Vercel
```bash
# 登录 Vercel 账户
vercel login

# 选择团队（如果有）
vercel teams list
vercel teams switch [team-id]
```

#### 步骤 2: 项目初始化
```bash
# 在项目根目录执行
cd /home/lc/luckee_dao/decentralized_decision_frontend

# 初始化 Vercel 项目
vercel

# 按照提示配置：
# - Set up and deploy? [Y/n] Y
# - Which scope? [个人账户或团队]
# - Link to existing project? [N] N
# - What's your project's name? decentralized-decision-frontend
# - In which directory is your code located? ./
# - Want to override the settings? [y/N] N
```

#### 步骤 3: 验证初始部署
```bash
# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod

# 检查部署状态
vercel ls
```

### 1.2 基础配置优化

#### 创建 Vercel 配置文件
```json
// vercel.json
{
  "version": 2,
  "name": "luckee-dao-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

#### 更新 Vite 配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 移除 GitHub Pages 的 base 配置
  // base: '/decentralized_decision_frontend/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          router: ['react-router-dom'],
          state: ['@reduxjs/toolkit', '@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
});
```

#### 更新路由配置
```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 改回 BrowserRouter
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter> {/* 改回 BrowserRouter */}
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 1.3 环境变量配置

#### 创建环境变量文件
```bash
# .env.local (本地开发)
VITE_API_BASE_URL=http://localhost:8080/api/v2
VITE_APP_NAME=Luckee DAO
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# .env.production (生产环境)
VITE_API_BASE_URL=https://api.luckeedao.com/api/v2
VITE_APP_NAME=Luckee DAO
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

#### 在 Vercel 中配置环境变量
```bash
# 设置生产环境变量
vercel env add VITE_API_BASE_URL production
vercel env add VITE_APP_NAME production
vercel env add VITE_APP_VERSION production
vercel env add VITE_APP_ENV production

# 设置预览环境变量
vercel env add VITE_API_BASE_URL preview
vercel env add VITE_APP_NAME preview
vercel env add VITE_APP_VERSION preview
vercel env add VITE_APP_ENV preview

# 查看环境变量
vercel env ls
```

## 阶段 2: 功能增强 (第3-4天)

### 2.1 API 路由支持

#### 创建 API 目录结构
```bash
mkdir -p api/injective
mkdir -p api/utils
```

#### 创建 Injective API 代理
```typescript
// api/injective/proxy.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

const INJECTIVE_REST_URL = process.env.VITE_INJECTIVE_REST_URL || 'https://testnet.lcd.injective.network';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { path, ...queryParams } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path || '';
    
    // 构建目标 URL
    const targetUrl = `${INJECTIVE_REST_URL}/${apiPath}`;
    const url = new URL(targetUrl);
    
    // 添加查询参数
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, Array.isArray(value) ? value[0] : value);
      }
    });

    // 发起请求
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

#### 创建 NFT 数据 API
```typescript
// api/nft/data.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

interface NFTQuery {
  owner?: string;
  collection?: string;
  limit?: number;
  offset?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { owner, collection, limit = 20, offset = 0 } = req.query as NFTQuery;

    // 模拟 NFT 数据（实际项目中应该从区块链获取）
    const mockNFTs = [
      {
        id: '1',
        tokenId: '1',
        name: 'Luckee DAO NFT #1',
        description: 'A unique NFT from Luckee DAO collection',
        image: 'https://via.placeholder.com/300x300',
        collection: 'Luckee DAO',
        owner: owner || '0x123...',
        attributes: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Power', value: 95 },
        ],
      },
      // ... 更多模拟数据
    ];

    // 应用筛选
    let filteredNFTs = mockNFTs;
    if (collection) {
      filteredNFTs = filteredNFTs.filter(nft => nft.collection === collection);
    }
    if (owner) {
      filteredNFTs = filteredNFTs.filter(nft => nft.owner === owner);
    }

    // 应用分页
    const paginatedNFTs = filteredNFTs.slice(offset, offset + limit);

    res.status(200).json({
      success: true,
      data: paginatedNFTs,
      pagination: {
        total: filteredNFTs.length,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: offset + limit < filteredNFTs.length,
      },
    });
  } catch (error) {
    console.error('NFT API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NFT data',
    });
  }
}
```

#### 创建健康检查 API
```typescript
// api/health.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION || '1.0.0',
    environment: process.env.VITE_APP_ENV || 'production',
  });
}
```

### 2.2 更新 API 客户端

#### 修改 API 客户端配置
```typescript
// src/utils/api.ts
import axios from 'axios';

// 检测环境并设置基础 URL
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // 客户端环境
    return import.meta.env.VITE_API_BASE_URL || '/api';
  } else {
    // 服务器环境
    return process.env.VITE_API_BASE_URL || '/api';
  }
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证头
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加幂等性键
    if (config.method !== 'get') {
      config.headers['Idempotency-Key'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 处理认证错误
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API 方法
export const api = {
  // 健康检查
  health: () => apiClient.get('/health'),
  
  // Injective 代理
  injective: {
    get: (path: string, params?: any) => apiClient.get(`/injective/proxy?path=${path}`, { params }),
    post: (path: string, data?: any) => apiClient.post(`/injective/proxy?path=${path}`, data),
  },
  
  // NFT 数据
  nft: {
    getNFTs: (params?: any) => apiClient.get('/nft/data', { params }),
    getNFT: (id: string) => apiClient.get(`/nft/data/${id}`),
  },
};
```

### 2.3 更新组件以使用新的 API

#### 修改 NFT 页面
```typescript
// src/pages/NFTPage.tsx
import React, { useEffect, useState } from 'react';
import { Grid, Box, CircularProgress, Alert, Typography } from '@mui/material';
import { api } from '../utils/api';

interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  owner: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}

const NFTPage: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const response = await api.nft.getNFTs();
        setNfts(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        NFT Gallery
      </Typography>
      <Grid container spacing={2}>
        {nfts.map((nft) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={nft.id}>
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            >
              <img
                src={nft.image}
                alt={nft.name}
                style={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {nft.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {nft.collection}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NFTPage;
```

## 阶段 3: 性能优化 (第5天)

### 3.1 缓存策略优化

#### 更新 Vercel 配置
```json
// vercel.json - 添加缓存策略
{
  "version": 2,
  "name": "luckee-dao-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=60"
        }
      ]
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  }
}
```

### 3.2 图片优化

#### 添加图片优化组件
```typescript
// src/components/common/OptimizedImage.tsx
import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 200,
  style,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Box sx={{ position: 'relative', width, height }}>
      {loading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
      {error ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            color: 'text.secondary',
          }}
        >
          Image not available
        </Box>
      ) : (
        <img
          src={src}
          alt={alt}
          style={{
            ...style,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: loading ? 'none' : 'block',
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </Box>
  );
};

export default OptimizedImage;
```

### 3.3 代码分割优化

#### 更新路由配置
```typescript
// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'));
const VotingPage = lazy(() => import('./pages/VotingPage'));
const NFTPage = lazy(() => import('./pages/NFTPage'));
const GovernancePage = lazy(() => import('./pages/GovernancePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// 加载组件
const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
  >
    <CircularProgress />
  </Box>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/voting" element={<VotingPage />} />
        <Route path="/nft" element={<NFTPage />} />
        <Route path="/governance" element={<GovernancePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
```

## 阶段 4: 监控和分析 (第6天)

### 4.1 添加性能监控

#### 安装分析工具
```bash
npm install @vercel/analytics
npm install web-vitals
```

#### 配置 Vercel Analytics
```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
          }}
        />
      </BrowserRouter>
      <Analytics />
    </QueryClientProvider>
  </React.StrictMode>
);
```

#### 添加 Web Vitals 监控
```typescript
// src/utils/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // 发送到 Vercel Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
  
  // 发送到控制台（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
};

// 初始化 Web Vitals 监控
export const initAnalytics = () => {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
};
```

### 4.2 错误监控

#### 添加错误边界
```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // 发送错误到监控服务
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## 阶段 5: 测试和验证 (第7天)

### 5.1 功能测试

#### 创建测试脚本
```bash
# scripts/test-deployment.sh
#!/bin/bash

echo "Testing Vercel deployment..."

# 1. 健康检查
echo "Testing health endpoint..."
curl -f https://luckee-dao-frontend.vercel.app/api/health || exit 1

# 2. 主页测试
echo "Testing homepage..."
curl -f https://luckee-dao-frontend.vercel.app/ || exit 1

# 3. NFT API 测试
echo "Testing NFT API..."
curl -f https://luckee-dao-frontend.vercel.app/api/nft/data || exit 1

# 4. 路由测试
echo "Testing routes..."
curl -f https://luckee-dao-frontend.vercel.app/voting || exit 1
curl -f https://luckee-dao-frontend.vercel.app/nft || exit 1
curl -f https://luckee-dao-frontend.vercel.app/governance || exit 1
curl -f https://luckee-dao-frontend.vercel.app/settings || exit 1

echo "All tests passed!"
```

#### 性能测试
```bash
# 使用 Lighthouse 进行性能测试
npm install -g lighthouse
lighthouse https://luckee-dao-frontend.vercel.app --output=html --output-path=./lighthouse-report.html
```

### 5.2 部署验证清单

#### 功能验证
- [ ] 主页正常加载
- [ ] 所有路由正常工作
- [ ] API 端点响应正常
- [ ] 环境变量正确加载
- [ ] 图片和资源正常加载
- [ ] 响应式设计正常

#### 性能验证
- [ ] 页面加载速度 < 3秒
- [ ] Lighthouse 性能分数 > 90
- [ ] 移动端性能良好
- [ ] 缓存策略生效

#### 安全验证
- [ ] HTTPS 正常工作
- [ ] 安全头正确设置
- [ ] CORS 配置正确
- [ ] 环境变量安全

## 阶段 6: 域名和 DNS 配置 (第8天)

### 6.1 自定义域名设置

#### 在 Vercel 中添加域名
```bash
# 添加自定义域名
vercel domains add luckeedao.com

# 配置域名
vercel domains inspect luckeedao.com
```

#### 配置 DNS 记录
```dns
# DNS 配置示例
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

### 6.2 SSL 证书配置

#### 自动 SSL 配置
```bash
# Vercel 会自动配置 SSL 证书
# 验证 SSL 配置
curl -I https://luckeedao.com
```

## 阶段 7: 文档更新和团队培训 (第9天)

### 7.1 更新项目文档

#### 更新 README
```markdown
# Luckee DAO 前端

## 部署

### Vercel 部署
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 环境变量
- `VITE_API_BASE_URL`: API 基础 URL
- `VITE_APP_NAME`: 应用名称
- `VITE_APP_VERSION`: 应用版本
- `VITE_APP_ENV`: 环境标识
```

#### 更新部署文档
```markdown
# 部署指南

## Vercel 部署流程

1. 代码推送到 GitHub
2. Vercel 自动构建和部署
3. 预览环境自动创建
4. 生产环境手动部署

## 环境管理

- 生产环境: `vercel --prod`
- 预览环境: `vercel`
- 开发环境: `npm run dev`
```

### 7.2 团队培训

#### 创建培训材料
```markdown
# Vercel 使用指南

## 基本操作
1. 查看部署状态: `vercel ls`
2. 查看日志: `vercel logs`
3. 回滚部署: `vercel rollback`
4. 删除部署: `vercel remove`

## 环境变量管理
1. 添加变量: `vercel env add`
2. 查看变量: `vercel env ls`
3. 删除变量: `vercel env rm`

## 监控和分析
1. 访问 Vercel Dashboard
2. 查看性能指标
3. 分析用户行为
```

## 后续维护和优化

### 1. 定期维护任务

#### 每周任务
- [ ] 检查部署状态
- [ ] 查看性能指标
- [ ] 检查错误日志
- [ ] 更新依赖包

#### 每月任务
- [ ] 性能优化审查
- [ ] 安全更新检查
- [ ] 成本分析
- [ ] 功能使用统计

### 2. 监控和告警

#### 设置监控告警
```typescript
// 监控配置
const monitoringConfig = {
  uptime: "99.9%",
  responseTime: "< 2s",
  errorRate: "< 1%",
  alerts: [
    "部署失败",
    "API 错误率过高",
    "响应时间过长",
    "资源使用率过高"
  ]
};
```

### 3. 持续优化

#### 性能优化
- 定期分析 Lighthouse 报告
- 优化图片和资源加载
- 实施更精细的缓存策略
- 监控 Core Web Vitals

#### 功能扩展
- 添加更多 API 端点
- 实施 A/B 测试
- 添加用户分析
- 集成更多第三方服务

## 故障排除

### 常见问题

#### 1. 部署失败
```bash
# 检查构建日志
vercel logs [deployment-url]

# 本地构建测试
npm run build

# 检查环境变量
vercel env ls
```

#### 2. API 路由不工作
```bash
# 检查函数日志
vercel logs --follow

# 本地测试 API
vercel dev
```

#### 3. 环境变量问题
```bash
# 重新设置环境变量
vercel env add VARIABLE_NAME production

# 重新部署
vercel --prod
```

## 总结

本迁移方案提供了从 GitHub Pages 到 Vercel 的完整迁移路径，包括：

1. **基础迁移**: 项目初始化和基础配置
2. **功能增强**: API 路由和服务器端功能
3. **性能优化**: 缓存策略和代码分割
4. **监控分析**: 性能监控和错误追踪
5. **测试验证**: 功能测试和性能测试
6. **域名配置**: 自定义域名和 SSL 证书
7. **文档更新**: 团队培训和文档维护

通过这个方案，Luckee DAO 前端项目将获得更好的性能、更强的功能和更优的开发体验，为后续的 Injective 区块链集成奠定坚实基础。

---

*文档版本: 1.0.0*  
*创建日期: 2024年12月*  
*维护者: Luckee DAO 开发团队*
