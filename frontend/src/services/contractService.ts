import { quais } from 'quais';
import EventDAOJson from '@/web3/abi/EventDAO.json';

// ── Types ──
export interface OnChainProposal {
  id: number;
  proposer: string;
  title: string;
  ipfsCID: string;
  yesVotes: number;
  noVotes: number;
  voteEndTime: number;
  finalized: boolean;
  status: 'Active' | 'Approved' | 'Rejected';
}

// ── Config ──
let ACTIVE_CONTRACT_ADDRESS = import.meta.env.VITE_EVENT_DAO_ADDRESS || '';
const ABI = EventDAOJson.abi;

export const EventDAOABI = ABI;
export function setEventDAOAddress(addr: string) { ACTIVE_CONTRACT_ADDRESS = addr; }
export function getEventDAOAddress(): string { return ACTIVE_CONTRACT_ADDRESS; }

// ── Provider via Pelagus ──
function getBrowserProvider(): any {
  const w = window as any;
  if (w.pelagus) return new quais.BrowserProvider(w.pelagus);
  if (w.ethereum) return new quais.BrowserProvider(w.ethereum);
  throw new Error('No wallet detected. Please install Pelagus.');
}

async function getReadContract(): Promise<any> {
  const provider = getBrowserProvider();
  if (!ACTIVE_CONTRACT_ADDRESS) throw new Error('Contract address not set for this network');
  return new quais.Contract(ACTIVE_CONTRACT_ADDRESS, ABI, provider);
}

async function getWriteContract(): Promise<any> {
  const provider = getBrowserProvider();
  const signer = await provider.getSigner();
  if (!ACTIVE_CONTRACT_ADDRESS) throw new Error('Contract address not set for this network');
  return new quais.Contract(ACTIVE_CONTRACT_ADDRESS, ABI, signer);
}

// ═══════════════════════════════════════
//  READ FUNCTIONS
// ═══════════════════════════════════════

export async function getProposalCount(): Promise<number> {
  const contract = await getReadContract();
  const count = await contract.getProposalCount();
  return Number(count);
}

export async function getProposal(id: number): Promise<OnChainProposal> {
  const contract = await getReadContract();
  const p = await contract.getProposal(id);
  const statusMap = ['Active', 'Approved', 'Rejected'] as const;
  return {
    id: Number(p.id),
    proposer: p.proposer,
    title: p.title,
    ipfsCID: p.ipfsCID,
    yesVotes: Number(p.yesVotes),
    noVotes: Number(p.noVotes),
    voteEndTime: Number(p.voteEndTime),
    finalized: p.finalized,
    status: statusMap[Number(p.status)] || 'Active',
  };
}

export async function getAllProposals(): Promise<OnChainProposal[]> {
  const count = await getProposalCount();
  if (count === 0) return [];
  const promises: Promise<OnChainProposal>[] = [];
  for (let i = 1; i <= count; i++) {
    promises.push(getProposal(i));
  }
  return Promise.all(promises);
}

export async function hasVoted(proposalId: number, voterAddress: string): Promise<boolean> {
  const contract = await getReadContract();
  return contract.hasVoted(proposalId, voterAddress);
}

// ═══════════════════════════════════════
//  WRITE FUNCTIONS (ignore ethers signer, use quais + Pelagus)
// ═══════════════════════════════════════

export async function createProposal(
  _signer: any,
  title: string,
  ipfsCID: string,
  votingDurationSeconds: number
): Promise<any> {
  const contract = await getWriteContract();
  const tx = await contract.createProposal(title, ipfsCID, votingDurationSeconds, {
    gasLimit: 3000000
  });
  return await tx.wait();
}

export async function vote(
  _signer: any,
  proposalId: number,
  support: boolean
): Promise<any> {
  const contract = await getWriteContract();
  const tx = await contract.vote(proposalId, support, { gasLimit: 500000 });
  return await tx.wait();
}

export async function finalizeProposal(
  _signer: any,
  proposalId: number
): Promise<any> {
  const contract = await getWriteContract();
  const tx = await contract.finalizeProposal(proposalId, { gasLimit: 1000000 });
  return await tx.wait();
}
