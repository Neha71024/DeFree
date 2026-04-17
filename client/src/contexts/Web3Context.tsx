import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Web3State } from '@/types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType extends Web3State {
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [web3State, setWeb3State] = useState<Web3State>({
    account: null,
    isConnected: false,
    chainId: null,
    balance: null,
    isLoading: true, // Start as true to handle initial check
    error: null,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        // In Ethers v6, listAccounts is preferred and more robust
        const accounts = await browserProvider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = accounts[0];
          setSigner(signer);

          const address = await signer.getAddress();
          const balance = await browserProvider.getBalance(address);
          const network = await browserProvider.getNetwork();

          setWeb3State({
            isConnected: true,
            account: address,
            balance: ethers.formatEther(balance),
            chainId: Number(network.chainId),
            isLoading: false,
            error: null,
          });
        } else {
          // No accounts found, but check is done
          setWeb3State(prev => ({ ...prev, isLoading: false, isConnected: false }));
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setWeb3State(prev => ({
          ...prev,
          error: 'Failed to check connection',
          isLoading: false,
          isConnected: false,
        }));
      }
    } else {
      // No ethereum provider found
      setWeb3State(prev => ({ ...prev, isLoading: false, isConnected: false }));
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setWeb3State(prev => ({
        ...prev,
        error: 'MetaMask not installed',
        isLoading: false,
      }));
      return;
    }

    setWeb3State(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      await browserProvider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        const signer = await browserProvider.getSigner();
        setSigner(signer);

        const address = await signer.getAddress();
        const balance = await browserProvider.getBalance(address);
        const network = await browserProvider.getNetwork();

        setWeb3State({
          isConnected: true,
          account: address,
          balance: ethers.formatEther(balance),
          chainId: Number(network.chainId),
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      setWeb3State({
        account: null,
        isConnected: false,
        chainId: null,
        balance: null,
        isLoading: false,
        error: error.message || 'Failed to connect',
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setWeb3State({
      account: null,
      isConnected: false,
      chainId: null,
      balance: null,
      isLoading: false,
      error: null,
    });
    setSigner(null);
    setProvider(null);
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkConnection();
    };

    init();

    // Some providers might take a moment to inject
    const handleEthereumInitialized = () => {
      checkConnection();
    };

    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = () => {
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    } else {
      // If not yet available, listen for it
      window.addEventListener('ethereum#initialized', handleEthereumInitialized, { once: true });
      
      // Also a small fallback poll
      const timeoutId = setTimeout(() => {
        if (typeof window.ethereum !== 'undefined') {
          checkConnection();
        }
      }, 2000);

      return () => {
        window.removeEventListener('ethereum#initialized', handleEthereumInitialized);
        clearTimeout(timeoutId);
      };
    }
  }, [checkConnection, disconnect]);

  return (
    <Web3Context.Provider
      value={{
        ...web3State,
        connect,
        disconnect,
        provider,
        signer,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3Context = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3Context must be used within a Web3Provider');
  }
  return context;
};
