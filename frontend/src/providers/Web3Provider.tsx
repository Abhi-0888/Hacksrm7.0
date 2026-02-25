import React, { createContext, useContext, useState } from 'react';
import { useWallet, WalletState } from '@/hooks/useWallet';

interface Web3ContextValue extends WalletState {
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
}

const Web3Context = createContext<Web3ContextValue | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <Web3Context.Provider value={{ ...wallet, isWalletModalOpen, setWalletModalOpen }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3(): Web3ContextValue {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within <Web3Provider>');
  return ctx;
}
