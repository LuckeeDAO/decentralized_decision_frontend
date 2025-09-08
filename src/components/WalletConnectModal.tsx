import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { closeModal, setLoading } from '../store/slices/uiSlice';
import { useWallet } from '../hooks/useWallet';

const WalletConnectModal: React.FC = () => {
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.ui.modals.walletConnect);
  const { connect } = useWallet();

  const handleClose = () => {
    dispatch(closeModal('walletConnect'));
  };

  const handleConnect = async (type: 'keplr' | 'metamask' | 'injective') => {
    try {
      dispatch(setLoading({ key: 'wallet', value: true }));
      await connect(type);
      handleClose();
    } catch (e) {
      // 错误交由 hook 内部处理及通知
    } finally {
      dispatch(setLoading({ key: 'wallet', value: false }));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>连接钱包</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Button variant="contained" onClick={() => handleConnect('keplr')}>连接 Keplr</Button>
          <Button variant="contained" onClick={() => handleConnect('metamask')}>连接 MetaMask</Button>
          <Button variant="contained" onClick={() => handleConnect('injective')}>连接 Injective</Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalletConnectModal;


