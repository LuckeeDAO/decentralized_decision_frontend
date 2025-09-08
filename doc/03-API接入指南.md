# Luckee DAO 前端 API 接入指南

## 概述

本文档详细介绍了 Luckee DAO 前端应用与后端 API 的集成方式、认证机制、错误处理和最佳实践。

## API 架构

### 版本管理
- **当前版本**: v2
- **基础路径**: `/api/v2`
- **兼容性**: 支持 v1 到 v2 的平滑迁移

### 核心模块
- **Gas 模块**: 费用计算和支付
- **Unlock 模块**: 代币解锁管理
- **Auction 模块**: 密封投标拍卖
- **Governance 模块**: 治理提案和投票

## 认证机制

### 1. 钱包签名认证

#### 认证流程
```typescript
// 1. 获取挑战串
const challengeResponse = await fetch('/api/v2/auth/challenge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: userAddress })
});

const { challenge } = await challengeResponse.json();

// 2. 使用钱包签名
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [challenge, userAddress]
});

// 3. 交换访问令牌
const authResponse = await fetch('/api/v2/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: userAddress,
    signature: signature,
    challenge: challenge
  })
});

const { token, expires_in } = await authResponse.json();
```

#### 请求头配置
```typescript
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证信息
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加地址和签名（用于直接签名认证）
    const { address, signature, nonce } = getWalletAuth();
    if (address && signature) {
      config.headers.Address = address;
      config.headers.Signature = signature;
      config.headers.Nonce = nonce;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 2. 会话管理

#### Token 存储
```typescript
// Token 存储管理
class AuthManager {
  private static TOKEN_KEY = 'luckee_auth_token';
  private static REFRESH_KEY = 'luckee_refresh_token';
  
  static setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }
  
  static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }
  
  static clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }
  
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
```

#### 自动刷新
```typescript
// 响应拦截器 - 处理 Token 刷新
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = AuthManager.getRefreshToken();
        const refreshResponse = await fetch('/api/v2/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        const { access_token } = await refreshResponse.json();
        AuthManager.setAccessToken(access_token);
        
        // 重试原始请求
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败，跳转到登录页
        AuthManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 限流和重试机制

### 1. 限流配置
```typescript
// 限流配置
const RATE_LIMITS = {
  READ: 1000, // 1000 requests per minute
  WRITE: 100, // 100 requests per minute
};

// 限流检测和重试
const handleRateLimit = async (error: any, retryCount: number = 0) => {
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000;
    
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryCount + 1;
    }
  }
  
  throw error;
};
```

### 2. 幂等性处理
```typescript
// 幂等性键生成
const generateIdempotencyKey = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 幂等性键存储（24小时窗口）
class IdempotencyManager {
  private static STORAGE_KEY = 'luckee_idempotency_keys';
  private static WINDOW_MS = 24 * 60 * 60 * 1000; // 24小时
  
  static setKey(key: string) {
    const keys = this.getKeys();
    keys[key] = Date.now();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
  }
  
  static hasKey(key: string): boolean {
    const keys = this.getKeys();
    const timestamp = keys[key];
    if (!timestamp) return false;
    
    // 清理过期键
    if (Date.now() - timestamp > this.WINDOW_MS) {
      delete keys[key];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
      return false;
    }
    
    return true;
  }
  
  private static getKeys(): Record<string, number> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }
}
```

## 错误处理

### 1. 统一错误码映射
```typescript
// 错误码映射
const ERROR_MAPPINGS = {
  // 参数错误
  1001: {
    message: '参数错误',
    action: 'form_validation',
    severity: 'warning'
  },
  
  // 认证错误
  1002: {
    message: '认证失败',
    action: 're_auth',
    severity: 'error'
  },
  1003: {
    message: '令牌过期',
    action: 'refresh_token',
    severity: 'error'
  },
  
  // 限流错误
  2002: {
    message: '请求过于频繁',
    action: 'retry_later',
    severity: 'warning'
  },
  
  // 业务错误
  3001: {
    message: '余额不足',
    action: 'check_balance',
    severity: 'error'
  },
  3002: {
    message: '价格超出范围',
    action: 'adjust_price',
    severity: 'warning'
  },
  
  // 治理错误
  4001: {
    message: '提案不存在',
    action: 'refresh_data',
    severity: 'error'
  },
  4002: {
    message: '投票已结束',
    action: 'check_status',
    severity: 'warning'
  }
};

// 错误处理 Hook
const useErrorHandler = () => {
  const showToast = useToast();
  
  const handleError = (error: any) => {
    const errorCode = error.response?.data?.code || error.code;
    const errorMapping = ERROR_MAPPINGS[errorCode];
    
    if (errorMapping) {
      showToast(errorMapping.message, {
        type: errorMapping.severity,
        action: errorMapping.action
      });
    } else {
      showToast('未知错误，请稍后重试', { type: 'error' });
    }
    
    // 记录错误日志
    console.error('API Error:', {
      code: errorCode,
      message: error.response?.data?.message || error.message,
      trace_id: error.response?.data?.trace_id,
      timestamp: new Date().toISOString()
    });
  };
  
  return { handleError };
};
```

### 2. 网络错误处理
```typescript
// 网络状态检测
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// 离线处理
const useOfflineHandler = () => {
  const isOnline = useNetworkStatus();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  
  const queueRequest = (request: any) => {
    if (!isOnline) {
      setPendingRequests(prev => [...prev, request]);
      return Promise.reject(new Error('网络离线，请求已加入队列'));
    }
    return request;
  };
  
  const processPendingRequests = async () => {
    if (isOnline && pendingRequests.length > 0) {
      const requests = [...pendingRequests];
      setPendingRequests([]);
      
      for (const request of requests) {
        try {
          await request();
        } catch (error) {
          console.error('重试请求失败:', error);
        }
      }
    }
  };
  
  useEffect(() => {
    processPendingRequests();
  }, [isOnline]);
  
  return { queueRequest, pendingCount: pendingRequests.length };
};
```

## API 模块集成

### 1. Gas 模块
```typescript
// Gas 费用计算
export const useGasCalculation = () => {
  return useMutation({
    mutationFn: async (data: GasCalculationRequest) => {
      const response = await apiClient.post('/gas/calc', data);
      return response.data;
    },
    onError: (error) => {
      console.error('Gas calculation failed:', error);
    }
  });
};

// Gas 费用支付
export const useGasPayment = () => {
  return useMutation({
    mutationFn: async (data: GasPaymentRequest) => {
      const idempotencyKey = generateIdempotencyKey();
      IdempotencyManager.setKey(idempotencyKey);
      
      const response = await apiClient.post('/gas/pay', data, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Gas payment successful:', data);
    }
  });
};
```

### 2. Unlock 模块
```typescript
// 解锁预算查询
export const useUnlockBudget = () => {
  return useQuery({
    queryKey: ['unlock', 'budget'],
    queryFn: async () => {
      const response = await apiClient.get('/unlock/budget');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
  });
};

// 解锁代币
export const useUnlockClaim = () => {
  return useMutation({
    mutationFn: async (data: UnlockClaimRequest) => {
      const idempotencyKey = generateIdempotencyKey();
      IdempotencyManager.setKey(idempotencyKey);
      
      const response = await apiClient.post('/unlock/claim', data, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    }
  });
};
```

### 3. Auction 模块
```typescript
// 密封投标提交
export const useAuctionSubmitBid = () => {
  return useMutation({
    mutationFn: async (data: AuctionBidRequest) => {
      const idempotencyKey = generateIdempotencyKey();
      IdempotencyManager.setKey(idempotencyKey);
      
      const response = await apiClient.post('/auction/submit-sealed-bid', data, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    }
  });
};

// 投标揭示
export const useAuctionRevealBid = () => {
  return useMutation({
    mutationFn: async (data: AuctionRevealRequest) => {
      const idempotencyKey = generateIdempotencyKey();
      IdempotencyManager.setKey(idempotencyKey);
      
      const response = await apiClient.post('/auction/reveal', data, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    }
  });
};
```

### 4. Governance 模块
```typescript
// 治理提案查询
export const useGovernanceProposals = (params?: ProposalQueryParams) => {
  return useQuery({
    queryKey: ['governance', 'proposals', params],
    queryFn: async () => {
      const response = await apiClient.get('/gov/proposals', { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2分钟
  });
};

// 创建提案
export const useCreateProposal = () => {
  return useMutation({
    mutationFn: async (data: CreateProposalRequest) => {
      const idempotencyKey = generateIdempotencyKey();
      IdempotencyManager.setKey(idempotencyKey);
      
      const response = await apiClient.post('/gov/propose', data, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    }
  });
};

// 投票
export const useVote = () => {
  return useMutation({
    mutationFn: async (data: VoteRequest) => {
      const idempotencyKey = generateIdempotencyKey();
      IdempotencyManager.setKey(idempotencyKey);
      
      const response = await apiClient.post('/gov/vote', data, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    }
  });
};
```

## 数据缓存策略

### 1. React Query 配置
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟内数据新鲜
      cacheTime: 10 * 60 * 1000, // 10分钟缓存
      retry: (failureCount, error) => {
        // 根据错误类型决定是否重试
        if (error.response?.status === 401) return false;
        if (error.response?.status === 403) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // 写操作不自动重试
    },
  },
});
```

### 2. 缓存失效策略
```typescript
// 乐观更新
const useOptimisticVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: voteProposal,
    onMutate: async (newVote) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries(['proposals']);
      
      // 保存之前的数据
      const previousProposals = queryClient.getQueryData(['proposals']);
      
      // 乐观更新
      queryClient.setQueryData(['proposals'], (old: any) => ({
        ...old,
        proposals: old.proposals.map((proposal: any) =>
          proposal.id === newVote.proposalId
            ? { ...proposal, userVote: newVote.option }
            : proposal
        )
      }));
      
      return { previousProposals };
    },
    onError: (err, newVote, context) => {
      // 回滚到之前的状态
      queryClient.setQueryData(['proposals'], context?.previousProposals);
    },
    onSettled: () => {
      // 重新获取数据
      queryClient.invalidateQueries(['proposals']);
    },
  });
};
```

## 监控和分析

### 1. API 性能监控
```typescript
// API 性能监控
const useApiMonitoring = () => {
  const trackApiCall = (endpoint: string, duration: number, success: boolean) => {
    // 发送到监控服务
    if (window.gtag) {
      window.gtag('event', 'api_call', {
        event_category: 'API',
        event_label: endpoint,
        value: duration,
        custom_parameter_success: success
      });
    }
  };
  
  return { trackApiCall };
};
```

### 2. 错误追踪
```typescript
// 错误追踪
const useErrorTracking = () => {
  const trackError = (error: any, context: any) => {
    // 发送到错误监控服务
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };
  
  return { trackError };
};
```

## 最佳实践

### 1. 请求优化
- 使用适当的缓存策略
- 实现请求去重
- 合理使用乐观更新
- 避免不必要的重复请求

### 2. 错误处理
- 提供用户友好的错误信息
- 实现自动重试机制
- 记录详细的错误日志
- 处理网络异常情况

### 3. 安全性
- 验证所有输入数据
- 使用 HTTPS 连接
- 实现 CSRF 防护
- 定期更新依赖包

### 4. 性能优化
- 使用代码分割
- 实现懒加载
- 优化图片和资源
- 监控性能指标

---

*文档版本: 1.0.0*  
*最后更新: 2024年12月*  
*维护者: Luckee DAO 开发团队*
