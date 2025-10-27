import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { 
  CardGiftcard, 
  OpenInNew, 
  Refresh,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';

interface BlindBoxStatus {
  isOnline: boolean;
  status: 'online' | 'offline' | 'error' | 'loading';
  lastChecked: Date;
  responseTime?: number;
  error?: string;
  stats?: {
    totalBoxes?: number;
    openedBoxes?: number;
    activeUsers?: number;
  };
}

const BlindBoxStatus: React.FC = () => {
  const [status, setStatus] = useState<BlindBoxStatus>({
    isOnline: false,
    status: 'loading',
    lastChecked: new Date(),
  });

  const checkBlindBoxStatus = async () => {
    setStatus(prev => ({ ...prev, status: 'loading' }));
    const startTime = Date.now();
    
    try {
      // 首先尝试健康检查接口
      let response;
      let isHealthCheck = false;
      
      try {
        response = await fetch('https://blindbox.cdao.online/api/health', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
          },
        });
        isHealthCheck = true;
      } catch (healthError) {
        // 如果健康检查失败，尝试访问主页
        response = await fetch('https://blindbox.cdao.online/', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
        });
        isHealthCheck = false;
      }
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        // 如果是健康检查接口且返回200，说明系统完全正常
        if (isHealthCheck) {
          setStatus({
            isOnline: true,
            status: 'online',
            lastChecked: new Date(),
            responseTime,
          });
        } else {
          // 如果只是主页可以访问，说明系统基本正常但API可能有问题
          setStatus({
            isOnline: true,
            status: 'online',
            lastChecked: new Date(),
            responseTime,
            error: 'API接口暂不可用，但系统运行正常',
          });
        }
      } else {
        setStatus({
          isOnline: false,
          status: 'error',
          lastChecked: new Date(),
          responseTime,
          error: `HTTP ${response.status}`,
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setStatus({
        isOnline: false,
        status: 'offline',
        lastChecked: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : 'Network error',
      });
    }
  };

  useEffect(() => {
    checkBlindBoxStatus();
    
    // 每30秒检查一次状态
    const interval = setInterval(checkBlindBoxStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status.status) {
      case 'online':
        return <CheckCircle color="success" />;
      case 'offline':
        return <Error color="error" />;
      case 'error':
        return <Warning color="warning" />;
      case 'loading':
        return <CircularProgress size={20} />;
      default:
        return <Error color="error" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'error':
        return 'warning';
      case 'loading':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'online':
        return '盲盒系统运行正常';
      case 'offline':
        return '盲盒系统离线';
      case 'error':
        return '盲盒系统异常';
      case 'loading':
        return '检查盲盒状态...';
      default:
        return '未知状态';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CardGiftcard sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            盲盒系统状态
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getStatusIcon()}
          <Typography variant="body1" sx={{ ml: 1, mr: 2 }}>
            {getStatusText()}
          </Typography>
          <Chip
            label={status.status}
            color={getStatusColor() as any}
            size="small"
            variant="outlined"
          />
        </Box>

        {status.responseTime && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            响应时间: {status.responseTime}ms
          </Typography>
        )}

        {status.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {status.error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          最后检查: {status.lastChecked.toLocaleTimeString()}
        </Typography>

        {status.stats && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              盲盒统计
            </Typography>
            <Grid container spacing={1}>
              {status.stats.totalBoxes && (
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {status.stats.totalBoxes}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      总盲盒
                    </Typography>
                  </Box>
                </Grid>
              )}
              {status.stats.openedBoxes && (
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {status.stats.openedBoxes}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      已开启
                    </Typography>
                  </Box>
                </Grid>
              )}
              {status.stats.activeUsers && (
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main">
                      {status.stats.activeUsers}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      活跃用户
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<Refresh />}
              onClick={checkBlindBoxStatus}
              disabled={status.status === 'loading'}
            >
              刷新状态
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<OpenInNew />}
              component={Link}
              href="https://blindbox.cdao.online"
              target="_blank"
              rel="noopener noreferrer"
            >
              访问盲盒
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BlindBoxStatus;
