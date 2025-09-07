import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  connectWallet, 
  disconnectWallet, 
  updateBalance, 
  updatePermissions,
  setWalletError 
} from '../store/slices/walletSlice';

export const useWallet = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: RootState) => state.wallet);

  const connect = useCallback(async (walletType: 'keplr' | 'metamask' | 'injective') => {
    try {
      dispatch(setWalletError(null));
      
      if (walletType === 'keplr') {
        await connectKeplr();
      } else if (walletType === 'metamask') {
        await connectMetamask();
      } else if (walletType === 'injective') {
        await connectInjective();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接钱包失败';
      dispatch(setWalletError(errorMessage));
      throw error;
    }
  }, [dispatch]);

  const connectKeplr = async () => {
    if (typeof window.keplr === 'undefined') {
      throw new Error('Keplr钱包未安装');
    }

    const chainId = 'luckee-dao-1';
    await window.keplr.enable(chainId);
    const offlineSigner = window.keplr.getOfflineSigner(chainId);
    const accounts = await offlineSigner.getAccounts();
    
    if (accounts.length > 0) {
      const address = accounts[0].address;
      const token = await generateToken(address);
      
      dispatch(connectWallet({
        address,
        chainId,
        walletType: 'keplr',
        token,
      }));
      
      // 获取余额和权限
      await updateWalletInfo(address);
    }
  };

  const connectMetamask = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Metamask钱包未安装');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length > 0) {
      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const token = await generateToken(address);
      
      dispatch(connectWallet({
        address,
        chainId: `0x${parseInt(chainId).toString(16)}`,
        walletType: 'metamask',
        token,
      }));
      
      // 获取余额和权限
      await updateWalletInfo(address);
    }
  };

  const connectInjective = async () => {
    // Injective钱包连接逻辑
    throw new Error('Injective钱包连接功能待实现');
  };

  const generateToken = async (address: string): Promise<string> => {
    // 生成JWT令牌的逻辑
    return `token_${address}_${Date.now()}`;
  };

  const updateWalletInfo = async (address: string) => {
    try {
      // 获取余额
      const balance = await getBalance(address);
      dispatch(updateBalance(balance));
      
      // 获取权限
      const permissions = await getPermissions(address);
      dispatch(updatePermissions(permissions));
    } catch (error) {
      console.error('更新钱包信息失败:', error);
    }
  };

  const getBalance = async (address: string): Promise<string> => {
    // 模拟获取余额
    return '1000.0';
  };

  const getPermissions = async (address: string) => {
    // 模拟获取权限
    return {
      basic: true,
      creator: false,
      admin: false,
    };
  };

  const disconnect = useCallback(() => {
    dispatch(disconnectWallet());
  }, [dispatch]);

  const refreshBalance = useCallback(async () => {
    if (wallet.address) {
      try {
        const balance = await getBalance(wallet.address);
        dispatch(updateBalance(balance));
      } catch (error) {
        console.error('刷新余额失败:', error);
      }
    }
  }, [wallet.address, dispatch]);

  const refreshPermissions = useCallback(async () => {
    if (wallet.address) {
      try {
        const permissions = await getPermissions(wallet.address);
        dispatch(updatePermissions(permissions));
      } catch (error) {
        console.error('刷新权限失败:', error);
      }
    }
  }, [wallet.address, dispatch]);

  return {
    ...wallet,
    connect,
    disconnect,
    refreshBalance,
    refreshPermissions,
  };
};
