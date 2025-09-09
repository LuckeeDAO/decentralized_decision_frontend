import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  HowToVote,
  Collections,
  AccountBalance,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleSidebar, openModal } from '../store/slices/uiSlice';
import { useWallet } from '../hooks/useWallet';
import { useResponsive } from '../hooks/useResponsive';
import WalletConnectModal from './WalletConnectModal';
import NotificationsMenu from './NotificationsMenu';
import BreadcrumbsBar from './BreadcrumbsBar';
import Footer from './Footer';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  
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
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  const handleWalletConnect = () => {
    dispatch(openModal('walletConnect'));
  };

  const drawerWidth = isMobile ? 280 : 240;
  const drawerVariant = isMobile ? 'temporary' : 'permanent';

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 顶部导航栏 */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 1,
        }}
      >
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
          
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            noWrap 
            component="div" 
            sx={{ flexGrow: 1 }}
          >
            {isMobile ? 'Luckee DAO' : 'Luckee DAO 去中心化决策系统'}
          </Typography>
          
          {isConnected ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: isMobile ? 1 : 2,
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <Typography variant={isMobile ? "caption" : "body2"}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Typography>
              {!isMobile && (
                <Typography variant="body2">
                  余额: {balance} LUCKEE
                </Typography>
              )}
              <NotificationsMenu />
              <Button 
                color="inherit" 
                onClick={disconnect}
                size={isMobile ? "small" : "medium"}
              >
                {isMobile ? '断开' : '断开连接'}
              </Button>
            </Box>
          ) : (
            <Button 
              color="inherit" 
              onClick={handleWalletConnect}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? '连接' : '连接钱包'}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* 侧边栏 */}
      <Drawer
        variant={drawerVariant}
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // 更好的移动端性能
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleMenuClick(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiListItemText-primary': {
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
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
          p: isMobile ? 2 : 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
          <BreadcrumbsBar />
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
          <Footer />
        </Box>
        <WalletConnectModal />
      </Box>
    </Box>
  );
};

export default ResponsiveLayout;
