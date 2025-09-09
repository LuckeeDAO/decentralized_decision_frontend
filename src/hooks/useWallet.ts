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

  const connect = useCallback(async (walletType: 'keplr' | 'metamask' | 'injective'): Promise<string | null> => {
    try {
      dispatch(setWalletError(null));
      
      if (walletType === 'keplr') {
        return await connectKeplr();
      } else if (walletType === 'metamask') {
        return await connectMetamask();
      } else if (walletType === 'injective') {
        return await connectInjective();
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接钱包失败';
      dispatch(setWalletError(errorMessage));
      throw error;
    }
  }, [dispatch]);

  const connectKeplr = async (): Promise<string | null> => {
    if (typeof window.keplr === 'undefined') {
      throw new Error('Keplr钱包未安装，请先安装Keplr扩展');
    }

    try {
      const chainId = 'luckee-dao-1';
      
      // 检查是否支持该链
      if (!window.keplr.getChainInfosWithoutEndpoints().find(chain => chain.chainId === chainId)) {
        // 添加自定义链
        await window.keplr.experimentalSuggestChain({
          chainId: chainId,
          chainName: 'Luckee DAO',
          rpc: 'https://rpc.luckee-dao.com',
          rest: 'https://rest.luckee-dao.com',
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: 'luckee',
            bech32PrefixAccPub: 'luckee' + 'pub',
            bech32PrefixValAddr: 'luckee' + 'valoper',
            bech32PrefixValPub: 'luckee' + 'valoperpub',
            bech32PrefixConsAddr: 'luckee' + 'valcons',
            bech32PrefixConsPub: 'luckee' + 'valconspub',
          },
          currencies: [
            {
              coinDenom: 'LUCKEE',
              coinMinimalDenom: 'uluckee',
              coinDecimals: 6,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: 'LUCKEE',
              coinMinimalDenom: 'uluckee',
              coinDecimals: 6,
            },
          ],
          stakeCurrency: {
            coinDenom: 'LUCKEE',
            coinMinimalDenom: 'uluckee',
            coinDecimals: 6,
          },
        });
      }

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
        return address;
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          throw new Error('用户取消了连接请求');
        } else if (error.message.includes('No accounts')) {
          throw new Error('Keplr钱包中没有账户，请先创建账户');
        }
      }
      throw error;
    }
  };

  const connectMetamask = async (): Promise<string | null> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask钱包未安装，请先安装MetaMask扩展');
    }

    try {
      // 检查是否已连接
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        // 请求连接
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }

      // 获取当前账户
      const currentAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (currentAccounts.length > 0) {
        const address = currentAccounts[0];
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
        return address;
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          throw new Error('用户取消了连接请求');
        } else if (error.message.includes('Already processing')) {
          throw new Error('MetaMask正在处理其他请求，请稍后再试');
        }
      }
      throw error;
    }
  };

  const connectInjective = async (): Promise<string | null> => {
    try {
      const injective = (window as any).injective;
      if (!injective) {
        throw new Error('Injective钱包未安装，请先安装Injective扩展');
      }

      // 检查Injective钱包是否可用
      if (!injective.requestAccounts) {
        throw new Error('Injective钱包未正确初始化');
      }

      // 请求连接账户
      const accounts = await injective.requestAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('Injective钱包中没有可用账户');
      }

      const address = accounts[0];
      const chainId = injective.chainId || 'injective-1';
      const token = await generateToken(address);

      dispatch(connectWallet({
        address,
        chainId,
        walletType: 'injective',
        token,
      }));

      await updateWalletInfo(address);
      return address;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          throw new Error('用户取消了连接请求');
        } else if (error.message.includes('No accounts')) {
          throw new Error('Injective钱包中没有账户，请先创建账户');
        }
      }
      throw error;
    }
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
