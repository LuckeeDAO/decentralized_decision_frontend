import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from '@mui/material';
import { TrendingUp, People, HowToVote, AccountBalance } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const stats = [
    {
      title: '总投票数',
      value: '1,234',
      icon: <HowToVote />,
      color: 'primary',
      change: '+12%',
    },
    {
      title: '活跃用户',
      value: '5,678',
      icon: <People />,
      color: 'success',
      change: '+8%',
    },
    {
      title: '治理提案',
      value: '89',
      icon: <AccountBalance />,
      color: 'info',
      change: '+5%',
    },
    {
      title: '系统状态',
      value: '正常',
      icon: <TrendingUp />,
      color: 'success',
      change: '100%',
    },
  ];

  const recentActivities = [
    {
      title: '新提案创建',
      description: '用户创建了关于Gas费用调整的治理提案',
      time: '2小时前',
      type: 'governance',
    },
    {
      title: '投票完成',
      description: '关于NFT类型扩展的投票已结束，结果：通过',
      time: '4小时前',
      type: 'voting',
    },
    {
      title: '代币解锁',
      description: '用户成功解锁了1,000 LUCKEE代币',
      time: '6小时前',
      type: 'unlock',
    },
    {
      title: '拍卖开始',
      description: '新的DDG代币拍卖批次已开始',
      time: '8小时前',
      type: 'auction',
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'governance':
        return 'primary';
      case 'voting':
        return 'success';
      case 'unlock':
        return 'warning';
      case 'auction':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        仪表板
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        欢迎使用Luckee DAO去中心化决策系统
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: `${stat.color}.main`, mr: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stat.value}
                </Typography>
                <Chip
                  label={stat.change}
                  color={stat.color as any}
                  size="small"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 最近活动 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                最近活动
              </Typography>
              <Box sx={{ mt: 2 }}>
                {recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: index < recentActivities.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <Chip
                      label={activity.type}
                      color={getActivityColor(activity.type) as any}
                      size="small"
                      sx={{ mr: 2, minWidth: 80 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" component="div">
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small">查看全部</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                快速操作
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth>
                  查看NFT
                </Button>
                <Button variant="contained" fullWidth>
                  创建投票
                </Button>
                <Button variant="outlined" fullWidth>
                  参与治理
                </Button>
                <Button variant="outlined" fullWidth>
                  代币管理
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
