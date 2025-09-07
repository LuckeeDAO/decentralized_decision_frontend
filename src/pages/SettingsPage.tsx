import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Settings, Security, Notifications, Language, Palette, Save } from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    privacy: {
      profilePublic: true,
      showBalance: false,
      allowAnalytics: true,
    },
    appearance: {
      theme: 'light',
      language: 'zh-CN',
      fontSize: 'medium',
    },
    security: {
      twoFactor: false,
      autoLock: true,
      sessionTimeout: 30,
    },
  });

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // 这里应该调用API保存设置
    console.log('保存设置:', settings);
    setSaveDialogOpen(true);
  };

  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        设置
      </Typography>

      <Grid container spacing={3}>
        {/* 通知设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  通知设置
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="邮件通知"
                    secondary="接收重要事件的邮件通知"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="推送通知"
                    secondary="接收浏览器推送通知"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="短信通知"
                    secondary="接收紧急事件的短信通知"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 隐私设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  隐私设置
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="公开个人资料"
                    secondary="允许其他用户查看您的个人资料"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.privacy.profilePublic}
                      onChange={(e) => handleSettingChange('privacy', 'profilePublic', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="显示余额"
                    secondary="在个人资料中显示代币余额"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.privacy.showBalance}
                      onChange={(e) => handleSettingChange('privacy', 'showBalance', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="允许分析"
                    secondary="帮助改进产品体验"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.privacy.allowAnalytics}
                      onChange={(e) => handleSettingChange('privacy', 'allowAnalytics', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 外观设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  外观设置
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  select
                  label="主题"
                  value={settings.appearance.theme}
                  onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="light">浅色主题</option>
                  <option value="dark">深色主题</option>
                  <option value="auto">跟随系统</option>
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="语言"
                  value={settings.appearance.language}
                  onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="字体大小"
                  value={settings.appearance.fontSize}
                  onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </TextField>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 安全设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  安全设置
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="双因素认证"
                    secondary="为您的账户添加额外的安全保护"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.security.twoFactor}
                      onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="自动锁定"
                    secondary="空闲时自动锁定账户"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.security.autoLock}
                      onChange={(e) => handleSettingChange('security', 'autoLock', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="会话超时（分钟）"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  margin="normal"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 系统信息 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                系统信息
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    应用版本
                  </Typography>
                  <Typography variant="body1">
                    v1.0.0
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    最后更新
                  </Typography>
                  <Typography variant="body1">
                    2025-08-10
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    网络状态
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    已连接
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    同步状态
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    已同步
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
                保存设置
              </Button>
              <Button variant="outlined">
                重置为默认
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* 保存确认对话框 */}
      <Dialog open={saveDialogOpen} onClose={handleCloseSaveDialog}>
        <DialogTitle>设置已保存</DialogTitle>
        <DialogContent>
          <Alert severity="success">
            您的设置已成功保存。
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog} variant="contained">
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
