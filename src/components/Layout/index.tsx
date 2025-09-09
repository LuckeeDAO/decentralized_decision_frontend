import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Button } from '@mui/material';
import { Menu as MenuIcon, Dashboard, HowToVote, Collections, AccountBalance, Settings } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar, openModal } from '../../store/slices/uiSlice';
import { useWallet } from '../../hooks/useWallet';
import WalletConnectModal from '../WalletConnectModal';
import NotificationsMenu from '../NotificationsMenu';
import BreadcrumbsBar from '../BreadcrumbsBar';
import Footer from '../Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen, notifications } = useSelector((state: RootState) => state.ui);
  const { isConnected, address, balance, connect, disconnect } = useWallet();

  const menuItems = [
    { text: '仪表板', icon: <Dashboard />, path: '/' },
    { text: 'NFT管理', icon: <Collections />, path: '/nft' },
    { text: '投票管理', icon: <HowToVote />, path: '/voting' },
    { text: '代币管理', icon: <AccountBalance />, path: '/token' },
    { text: '治理', icon: <HowToVote />, path: '/governance' },
    { text: '设置', icon: <Settings />, path: '/settings' },
  ];

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleWalletConnect = () => {
    dispatch(openModal('walletConnect'));
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 顶部导航栏 */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="打开菜单"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Luckee DAO 去中心化决策系统
          </Typography>
          
          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Typography>
              <Typography variant="body2">
                余额: {balance} LUCKEE
              </Typography>
              <NotificationsMenu />
              <Button color="inherit" onClick={disconnect}>
                断开连接
              </Button>
            </Box>
          ) : (
            <Button color="inherit" onClick={handleWalletConnect}>
              连接钱包
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* 侧边栏 */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // 更好的移动端性能
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleMenuClick(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* 桌面端侧边栏 */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
        open
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleMenuClick(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* 主内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <BreadcrumbsBar />
          {children}
          <Footer />
        </Container>
        <WalletConnectModal />
      </Box>
    </Box>
  );
};

export default Layout;
