"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// ── Quai Network configuration ──
const QUAI_NETWORKS: Record<string, { name: string; rpcUrl: string; chainIdHex: string; blockExplorer: string }> = {
  '0x2328': {
    name: 'Quai Network (Cyprus-1)',
    rpcUrl: 'https://rpc.quai.network/cyprus1',
    chainIdHex: '0x2328',
    blockExplorer: 'https://quaiscan.io',
  },
  '0x2329': {
    name: 'Quai Testnet (Cyprus-1)',
    rpcUrl: 'https://orchard.rpc.quai.network/cyprus1',
    chainIdHex: '0x2329',
    blockExplorer: 'https://quaiscan.io',
  },
  '0x3a98': {
    name: 'DAO Local (15000)',
    rpcUrl: 'http://127.0.0.1:8545',
    chainIdHex: '0x3a98',
    blockExplorer: 'https://quaiscan.io', // Fallback
  },
};

const ENV_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '9001';
const EXPECTED_CHAIN_HEX = '0x' + parseInt(ENV_CHAIN_ID, 10).toString(16);
const EXPECTED_NETWORK = QUAI_NETWORKS[EXPECTED_CHAIN_HEX];

// ── Pelagus detection ──
function getPelagusProvider(): any | null {
  if (typeof window === 'undefined') return null;
  if ((window as any).pelagus) return (window as any).pelagus;
  if ((window as any).ethereum?.isPelagus) return (window as any).ethereum;
  return null;
}

export interface WalletState {
  account: string | null;
  chainId: string | null;
  isConnecting: boolean;
  walletType: 'pelagus' | 'metamask' | null;
  isPelagusInstalled: boolean;
  isMetaMaskInstalled: boolean;
  isCorrectNetwork: boolean;
  networkName: string | null;
  error: string | null;
  connectPelagus: () => Promise<string | null>;
  connectMetaMask: () => Promise<string | null>;
  disconnect: () => void;
  switchToQuai: () => Promise<boolean>;
  getSigner: () => Promise<ethers.Signer | null>;
}

export function useWallet(): WalletState {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'pelagus' | 'metamask' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPelagusInstalled = !!getPelagusProvider();
  const isMetaMaskInstalled = typeof window !== 'undefined' && !!(window as any).ethereum;

  // ── Derived network state ──
  const isCorrectNetwork = !!chainId && !!QUAI_NETWORKS[chainId.toLowerCase()];
  const networkName = chainId ? QUAI_NETWORKS[chainId.toLowerCase()]?.name || `Unknown (${chainId})` : null;

  // Enforce network check on every chainId update
  useEffect(() => {
    if (chainId) {
      const lowerChainId = chainId.toLowerCase();
      if (!QUAI_NETWORKS[lowerChainId]) {
        setError(`UNSUPPORTED NETWORK: Please switch your wallet to a supported Quai network. Current: ${chainId}`);
      } else {
        setError(null);
      }
    }
  }, [chainId]);

  // ── Restore session ──
  useEffect(() => {
    const savedWallet = localStorage.getItem('connected_wallet');
    const savedType = localStorage.getItem('wallet_type') as 'pelagus' | 'metamask' | null;
    if (savedWallet && savedType) {
      setAccount(savedWallet);
      setWalletType(savedType);
      checkExistingConnection(savedType);
    }
  }, []);

  async function checkExistingConnection(type: 'pelagus' | 'metamask') {
    try {
      let provider: any;
      if (type === 'pelagus') {
        provider = getPelagusProvider();
        if (!provider) return;
        const accounts = await provider.request({ method: 'quai_accounts' }).catch(() =>
          provider.request({ method: 'eth_accounts' })
        );
        if (accounts?.length > 0) {
          setAccount(accounts[0]);
          setWalletType('pelagus');
          try {
            const chain = await provider.request({ method: 'eth_chainId' });
            setChainId(chain);
          } catch { /* Pelagus may not support eth_chainId */ }
        } else {
          disconnect();
        }
      } else {
        provider = (window as any).ethereum;
        if (!provider) return;
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts?.length > 0) {
          setAccount(accounts[0]);
          setWalletType('metamask');
          const chain = await provider.request({ method: 'eth_chainId' });
          setChainId(chain);
        } else {
          disconnect();
        }
      }
    } catch {
      disconnect();
    }
  }

  // ── Pelagus connect ──
  const connectPelagus = useCallback(async (): Promise<string | null> => {
    setError(null);
    const provider = getPelagusProvider();
    if (!provider) {
      window.open('https://pelaguswallet.io/', '_blank');
      return null;
    }
    setIsConnecting(true);
    try {
      // Try eth_requestAccounts first as it is the EIP-1193 standard and often preferred by Pelagus/Quai bridges
      console.log('Attempting eth_requestAccounts...');
      let accounts: string[] = [];
      try {
        accounts = await provider.request({ method: 'eth_requestAccounts', params: [] });
      } catch (eErr) {
        console.warn('eth_requestAccounts failed, trying quai_requestAccounts...', eErr);
        // Fallback to Quai-specific quai_requestAccounts
        accounts = await provider.request({ method: 'quai_requestAccounts' });
      }

      if (accounts?.length > 0) {
        setAccount(accounts[0]);
        setWalletType('pelagus');
        localStorage.setItem('connected_wallet', accounts[0]);
        localStorage.setItem('wallet_type', 'pelagus');
        try {
          // Some Quai zones use different eth_chainId formats
          const chain = await provider.request({ method: 'eth_chainId' });
          setChainId(chain);
        } catch (cErr) {
          console.warn('Failed to fetch chainId after connection', cErr);
        }
        return accounts[0];
      }
    } catch (err: any) {
      console.error('Pelagus connection error:', err);
      setError(err.message || 'Pelagus connection failed');
    } finally {
      setIsConnecting(false);
    }
    return null;
  }, []);

  // ── MetaMask connect ──
  const connectMetaMask = useCallback(async (): Promise<string | null> => {
    setError(null);
    const provider = (window as any).ethereum;
    if (!provider) {
      window.open('https://metamask.io/', '_blank');
      return null;
    }
    setIsConnecting(true);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts?.length > 0) {
        setAccount(accounts[0]);
        setWalletType('metamask');
        const chain = await provider.request({ method: 'eth_chainId' });
        setChainId(chain);
        localStorage.setItem('connected_wallet', accounts[0]);
        localStorage.setItem('wallet_type', 'metamask');
        return accounts[0];
      }
    } catch (err: any) {
      console.error('MetaMask connection error:', err);
      setError(err.message || 'MetaMask connection failed');
    } finally {
      setIsConnecting(false);
    }
    return null;
  }, []);

  // ── Switch to Quai Network ──
  const switchToQuai = useCallback(async (): Promise<boolean> => {
    const provider = walletType === 'pelagus' ? getPelagusProvider() : (window as any).ethereum;
    if (!provider) return false;

    try {
      // Try switching first
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EXPECTED_CHAIN_HEX }],
      });
      setChainId(EXPECTED_CHAIN_HEX);
      return true;
    } catch (switchError: any) {
      // Chain doesn't exist (4902) or Provider not connected (4901) — try adding it
      if ((switchError.code === 4902 || switchError.code === 4901) && EXPECTED_NETWORK) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: EXPECTED_NETWORK.chainIdHex,
              chainName: EXPECTED_NETWORK.name,
              nativeCurrency: { name: 'QUAI', symbol: 'QUAI', decimals: 18 },
              rpcUrls: [EXPECTED_NETWORK.rpcUrl],
              blockExplorerUrls: [EXPECTED_NETWORK.blockExplorer],
            }],
          });
          setChainId(EXPECTED_CHAIN_HEX);
          return true;
        } catch (addError: any) {
          console.error('Failed to add Quai network:', addError);
          setError('Failed to add Quai network');
        }
      } else {
        console.error('Failed to switch to Quai:', switchError);
        setError(`Failed to switch network: ${switchError.message}`);
      }
    }
    return false;
  }, [walletType]);

  // ── Disconnect ──
  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setWalletType(null);
    setError(null);
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('wallet_type');
  }, []);

  // ── Get signer ──
  const getSigner = useCallback(async (): Promise<ethers.Signer | null> => {
    const provider = walletType === 'pelagus' ? getPelagusProvider() : (window as any).ethereum;
    if (!provider || !account) return null;
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      return await ethersProvider.getSigner();
    } catch {
      return null;
    }
  }, [account, walletType]);

  // ── Listen for account/chain changes ──
  useEffect(() => {
    const provider = walletType === 'pelagus' ? getPelagusProvider() : (window as any).ethereum;
    if (!provider || !account) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        localStorage.setItem('connected_wallet', accounts[0]);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId);
    };

    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [account, walletType, disconnect]);

  // ── Idle timeout (15 min) ──
  useEffect(() => {
    if (!account) return;
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => disconnect(), 15 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [account, disconnect]);

  return {
    account,
    chainId,
    isConnecting,
    walletType,
    isPelagusInstalled,
    isMetaMaskInstalled,
    isCorrectNetwork,
    networkName,
    error,
    connectPelagus,
    connectMetaMask,
    disconnect,
    switchToQuai,
    getSigner,
  };
}
