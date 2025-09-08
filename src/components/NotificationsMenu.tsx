import React from 'react';
import { IconButton, Menu, MenuItem, ListItemText, Badge } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { markAllNotificationsAsRead } from '../store/slices/uiSlice';

const NotificationsMenu: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    dispatch(markAllNotificationsAsRead());
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} aria-controls={open ? 'notif-menu' : undefined}>
        <Badge badgeContent={unread} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu id="notif-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
        {notifications.length === 0 && <MenuItem disabled>暂无通知</MenuItem>}
        {notifications.slice(0, 10).map((n) => (
          <MenuItem key={n.id} onClick={handleClose}>
            <ListItemText primary={n.title} secondary={n.message} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default NotificationsMenu;


