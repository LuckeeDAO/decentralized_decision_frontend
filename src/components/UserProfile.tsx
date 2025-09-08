import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Avatar,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import { Edit, Person, Security, History, TrendingUp } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  useGetUserProfileQuery, 
  useUpdateUserProfileMutation,
  useGetUserStatsQuery,
  useGetUserActivityQuery 
} from '../store/api';
import Input from './Input';
import Button from './Button';

interface UserProfileProps {
  address: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ address }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    avatar: '',
    preferences: {
      notifications: true,
      privacy: 'public',
    },
  });

  const { data: profile, isLoading: profileLoading } = useGetUserProfileQuery(address);
  const { data: stats, isLoading: statsLoading } = useGetUserStatsQuery(address);
  const { data: activity, isLoading: activityLoading } = useGetUserActivityQuery({ address });
  const [updateProfile, { isLoading: updating }] = useUpdateUserProfileMutation();

  const handleEditProfile = () => {
    if (profile) {
      setProfileData({
        username: profile.username || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        preferences: profile.preferences || {
          notifications: true,
          privacy: 'public',
        },
      });
    }
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        address,
        ...profileData,
      }).unwrap();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('更新用户资料失败:', error);
    }
  };

  const getPermissionLevel = (permissions: any) => {
    if (permissions?.admin) return { level: '管理员', color: 'error' as const };
    if (permissions?.creator) return { level: '创建者', color: 'warning' as const };
    if (permissions?.basic) return { level: '基础用户', color: 'success' as const };
    return { level: '访客', color: 'default' as const };
  };

  if (profileLoading || statsLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>加载中...</Typography>
        </CardContent>
      </Card>
    );
  }

  const permissionInfo = getPermissionLevel(profile?.permissions);

  return (
    <Box>
      <Card>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={profile?.avatar}
                sx={{ width: 80, height: 80 }}
              >
                <Person />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" gutterBottom>
                {profile?.username || '未设置用户名'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {address}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={permissionInfo.level}
                  color={permissionInfo.color}
                  size="small"
                  icon={<Security />}
                />
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="outline"
                startIcon={<Edit />}
                onClick={handleEditProfile}
              >
                编辑资料
              </Button>
            </Grid>
          </Grid>

          {profile?.bio && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1">{profile.bio}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* 用户统计 */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats?.totalVotes || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  总投票数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats?.proposalsCreated || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  创建提案
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {stats?.nftsOwned || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  拥有NFT
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 最近活动 */}
      {activity && activity.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              最近活动
            </Typography>
            <Box sx={{ mt: 2 }}>
              {activity.slice(0, 5).map((item: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: index < activity.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    {item.type === 'vote' && <TrendingUp color="primary" />}
                    {item.type === 'proposal' && <Person color="success" />}
                    {item.type === 'nft' && <History color="info" />}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">{item.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 编辑资料对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑用户资料</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Input
              fullWidth
              label="用户名"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              margin="normal"
            />
            <Input
              fullWidth
              label="个人简介"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <Input
              fullWidth
              label="头像URL"
              value={profileData.avatar}
              onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
              margin="normal"
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              修改资料后需要重新连接钱包才能生效
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveProfile}
            loading={updating}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
