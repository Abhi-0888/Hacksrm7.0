"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/providers/Web3Provider';
import * as contractService from '@/services/contractService';
import { EventDAOABI } from '@/services/contractService';
import { getEventDAOAddress as resolveContractAddress } from '@/web3';
import type { OnChainProposal } from '@/services/contractService';
import { ethers } from 'ethers';
import * as posterStore from '@/services/posterStore';

// ── Quai Network Configuration (from old frontend) ──
export const NETWORKS: Record<string, {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}> = {
  'quai-cyprus1': {
    chainId: '0x2328', // 9000 decimal
    chainName: 'Quai Network Cyprus-1',
    nativeCurrency: { name: 'QUAI', symbol: 'QUAI', decimals: 18 },
    rpcUrls: ['https://rpc.quai.network/cyprus1'],
    blockExplorerUrls: ['https://quaiscan.io'],
  },
  'quai-orchard': {
    chainId: '0x2329', // 9001 decimal
    chainName: 'Quai Orchard Testnet Cyprus-1',
    nativeCurrency: { name: 'QUAI', symbol: 'QUAI', decimals: 18 },
    rpcUrls: ['https://orchard.rpc.quai.network/cyprus1'],
    blockExplorerUrls: ['https://orchard.quaiscan.io'],
  },
  'sepolia': {
    chainId: '0xaa36a7', // 11155111 decimal
    chainName: 'Sepolia Test Network',
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  'localhost': {
    chainId: '0x3a98', // 15000 decimal
    chainName: 'Hardhat Localhost',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
  },
};

// ── Types ──
interface AppContextType {
  proposals: OnChainProposal[];
  isLoading: boolean;
  fetchProposals: () => Promise<void>;
  submitProposal: (title: string, ipfsCID: string, durationSeconds: number, posterDataUrl?: string) => Promise<boolean>;
  voteOnProposal: (proposalId: number, support: boolean) => Promise<boolean>;
  finalize: (proposalId: number) => Promise<boolean>;
  hasUserVoted: (proposalId: number) => Promise<boolean>;
  txPending: boolean;
  network: string;
  contractError: string | null;
  setNetwork: (network: string) => void;
  switchNetwork: (networkKey: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { account, getSigner } = useWeb3();
  const [proposals, setProposals] = useState<OnChainProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const initialNetwork = process.env.NEXT_PUBLIC_NETWORK || 'quai-orchard';
  const [network, setNetwork] = useState<string>(initialNetwork);
  const [contractError, setContractError] = useState<string | null>(null);

  const { chainId } = useWeb3();

  // ── Sync network and contract address ──
  useEffect(() => {
    if (chainId) {
      const lowerChain = chainId.toLowerCase();
      // Map chainId to our network keys
      const chainToKey: Record<string, string> = {
        '0x2328': 'quai-cyprus1',
        '0x2329': 'quai-orchard',
        '0x3a98': 'localhost',
      };

      const networkKey = chainToKey[lowerChain];
      if (networkKey) {
        setNetwork(networkKey);
        const addr = resolveContractAddress(networkKey);
        if (addr && addr !== '0x0000000000000000000000000000000000000000') {
          contractService.setEventDAOAddress(addr);
          setContractError(null);
        } else {
          setContractError(`No contract address found for network: ${networkKey}`);
        }
      }
    }
  }, [chainId]);

  // ── Switch network on wallet ──
  const switchNetwork = useCallback(async (networkKey: string) => {
    const ethereum = (window as any).ethereum || (window as any).pelagus;
    if (!ethereum) return;
    const net = NETWORKS[networkKey];
    if (!net) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: net.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added — try adding it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [net],
          });
        } catch (addError) {
          console.error('Failed to add network', addError);
        }
      }
    }
  }, []);

  // ── Fetch proposals ──
  const fetchProposals = useCallback(async () => {
    try {
      // Guard: only fetch if contract address is set
      if (!contractService.getEventDAOAddress()) {
        console.warn('Skipping proposal fetch: contract address not set.');
        return;
      }

      setContractError(null);
      setIsLoading(true);
      const data = await contractService.getAllProposals();
      // ── Enrich with posterUrl from localStorage (Layer 3: "API" enrichment) ──
      const enriched = data.map(p => ({
        ...p,
        posterUrl: posterStore.getPoster(p.title) ?? undefined,
      }));
      setProposals(enriched.sort((a, b) => b.id - a.id));
    } catch (err: any) {
      console.error('Failed to fetch proposals:', err);
      setContractError(err.message || 'Failed to connect to smart contract');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount + poll every 30s as backup
  useEffect(() => {
    fetchProposals();
    const interval = setInterval(fetchProposals, 30000);
    return () => clearInterval(interval);
  }, [fetchProposals]);

  // ── Real-time Event Listeners ──
  useEffect(() => {
    let contract: ethers.Contract | null = null;

    const setupListeners = async () => {
      try {
        const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://orchard.rpc.quai.network/cyprus1';
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contractAddr = resolveContractAddress(network as any);

        if (!contractAddr || contractAddr === '0x0000000000000000000000000000000000000000') {
          throw new Error("Contract address not found for this network");
        }

        contract = new ethers.Contract(contractAddr, EventDAOABI, provider);

        contract.on('ProposalCreated', (id: any) => {
          console.log(`Event: ProposalCreated ID=${id}`);
          fetchProposals();
        });

        contract.on('VoteCast', (proposalId: any) => {
          console.log(`Event: VoteCast ID=${proposalId}`);
          fetchProposals();
        });

        contract.on('ProposalFinalized', (proposalId: any) => {
          console.log(`Event: ProposalFinalized ID=${proposalId}`);
          fetchProposals();
        });

        console.log("Real-time event listeners active.");
      } catch (err) {
        console.warn("Failed to initialize event listeners (RPC may not support persistent filters):", err);
      }
    };

    setupListeners();

    return () => {
      if (contract) {
        try {
          contract.removeAllListeners();
        } catch (err) {
          console.error("Error cleaning up listeners:", err);
        }
      }
    };
  }, [network, fetchProposals]);

  // ── Create proposal ──
  const submitProposal = useCallback(async (
    title: string,
    ipfsCID: string,
    durationSeconds: number,
    posterDataUrl?: string  // base64 from canvas compression
  ): Promise<boolean> => {
    const signer = await getSigner();
    if (!signer) return false;
    try {
      setTxPending(true);

      // ── Save poster to localStorage BEFORE submitting (so re-fetches pick it up) ──
      if (posterDataUrl) {
        posterStore.savePoster(title, posterDataUrl);
      }

      // ── OPTIMISTIC UI: immediately add a pending card with the poster ──
      const optimisticId = Date.now();
      const optimisticProposal = {
        id: optimisticId,
        proposer: await signer.getAddress(),
        title,
        ipfsCID,
        yesVotes: 0,
        noVotes: 0,
        voteEndTime: Math.floor(Date.now() / 1000) + durationSeconds,
        finalized: false,
        status: 'Active' as const,
        posterUrl: posterDataUrl,
      };
      setProposals((prev: any) => [optimisticProposal, ...prev]);
      const addr = await signer.getAddress();
      const network = await signer.provider?.getNetwork();
      console.log("SubmitProposal Diagnostics:", {
        signer: addr,
        chainId: network?.chainId?.toString(),
        contractAddr: process.env.NEXT_PUBLIC_EVENT_DAO_ADDRESS,
        title,
        ipfsCID
      });

      const receipt = await contractService.createProposal(signer, title, ipfsCID, durationSeconds);
      if (receipt) {
        console.log("Proposal Created! Tx Hash:", receipt.hash);
        alert(`Proposal Created! Tx Hash: ${receipt.hash}`);
      }
      await fetchProposals();
      return true;
    } catch (err: any) {
      console.error('Create proposal failed:', err);
      return false;
    } finally {
      setTxPending(false);
    }
  }, [getSigner, fetchProposals]);

  // ── Vote ──
  const voteOnProposal = useCallback(async (
    proposalId: number,
    support: boolean
  ): Promise<boolean> => {
    const signer = await getSigner();
    if (!signer) return false;
    try {
      setTxPending(true);
      await contractService.vote(signer, proposalId, support);
      await fetchProposals();
      return true;
    } catch (err: any) {
      console.error('Vote failed:', err);
      return false;
    } finally {
      setTxPending(false);
    }
  }, [getSigner, fetchProposals]);

  // ── Finalize ──
  const finalize = useCallback(async (proposalId: number): Promise<boolean> => {
    const signer = await getSigner();
    if (!signer) return false;
    try {
      setTxPending(true);
      await contractService.finalizeProposal(signer, proposalId);
      await fetchProposals();
      return true;
    } catch (err: any) {
      console.error('Finalize failed:', err);
      return false;
    } finally {
      setTxPending(false);
    }
  }, [getSigner, fetchProposals]);

  // ── Check voted ──
  const hasUserVoted = useCallback(async (proposalId: number): Promise<boolean> => {
    if (!account) return false;
    try {
      return await contractService.hasVoted(proposalId, account);
    } catch {
      return false;
    }
  }, [account]);

  return (
    <AppContext.Provider value={{
      proposals,
      isLoading,
      fetchProposals,
      submitProposal,
      voteOnProposal,
      finalize,
      hasUserVoted,
      txPending,
      network,
      contractError,
      setNetwork,
      switchNetwork,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
