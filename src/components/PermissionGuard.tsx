import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Box, Typography, Button, Alert, Card, CardContent, Chip, Stack } from '@mui/material';
import { Security, Lock, Upgrade, Info } from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';

type PermissionKey = 'basic' | 'creator' | 'admin';

interface PermissionGuardProps {
  required: PermissionKey | PermissionKey[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  showUpgrade?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  required, 
  fallback, 
  children, 
  showUpgrade = true 
}) => {
  const permissions = useSelector((state: RootState) => state.wallet.permissions);
  const { isConnected, balance } = useSelector((state: RootState) => state.wallet);
  const { connect } = useWallet();

  const requiredList = Array.isArray(required) ? required : [required];
  const hasAll = requiredList.every((key) => permissions[key]);

  const getPermissionInfo = (key: PermissionKey) => {
    switch (key) {
      case 'basic':
        return { name: '基础用户', description: '可以参与投票和查看信息', minBalance: '0' };
      case 'creator':
        return { name: '创建者', description: '可以创建提案和NFT类型', minBalance: '1000' };
      case 'admin':
        return { name: '管理员', description: '可以管理系统设置和参数', minBalance: '10000' };
      default:
        return { name: '未知', description: '', minBalance: '0' };
    }
  };

  const getCurrentPermissionLevel = () => {
    if (permissions.admin) return 'admin';
    if (permissions.creator) return 'creator';
    if (permissions.basic) return 'basic';
    return 'none';
  };

  const getPermissionColor = (level: string) => {
    switch (level) {
      case 'admin': return 'error';
      case 'creator': return 'warning';
      case 'basic': return 'success';
      default: return 'default';
    }
  };

  if (!isConnected) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CardContent>
          <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>请先连接钱包以继续操作</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            连接钱包后即可查看您的权限等级和可用功能
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={() => connect('keplr')}>
              连接 Keplr
            </Button>
            <Button variant="outlined" onClick={() => connect('metamask')}>
              连接 MetaMask
            </Button>
            <Button variant="outlined" onClick={() => connect('injective')}>
              连接 Injective
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (!hasAll) {
    const currentLevel = getCurrentPermissionLevel();
    const missingPermissions = requiredList.filter(key => !permissions[key]);
    
    return (
      <>
        {fallback || (
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Lock sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">权限不足</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                您当前的权限不足以访问该功能。需要以下权限：
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                {missingPermissions.map((permission) => {
                  const info = getPermissionInfo(permission);
                  return (
                    <Box key={permission} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={info.name} 
                        color={getPermissionColor(permission) as any}
                        size="small"
                      />
                      <Typography variant="body2">{info.description}</Typography>
                    </Box>
                  );
                })}
              </Stack>

              {showUpgrade && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      当前权限等级: {getPermissionInfo(currentLevel as PermissionKey).name}
                    </Typography>
                    <Typography variant="body2">
                      通过持有更多LUCKEE代币或参与治理活动可以提升权限等级
                    </Typography>
                  </Box>
                </Alert>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info color="primary" />
                <Typography variant="caption" color="text.secondary">
                  当前余额: {balance || '0'} LUCKEE
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;


