// ── ABI imports ──
import EventDAOArtifact from './abi/EventDAO.json';

export const EventDAOABI = EventDAOArtifact.abi;

// ── Network addresses ──
import quaiTestnet from './addresses/quai-testnet.json';
import quaiMainnet from './addresses/quai-mainnet.json';
import localhost from './addresses/localhost.json';

export const addresses = {
  'quai-testnet': quaiTestnet,
  'quai-cyprus1': quaiTestnet,
  'quai-orchard': quaiTestnet,
  'quai-mainnet': quaiMainnet,
  'localhost': localhost,
} as const;

export type NetworkName = keyof typeof addresses;

export function getEventDAOAddress(network: string): string {
  const addr = addresses[network as NetworkName];
  if (!addr) {
    console.warn(`No address found for network: ${network}, falling back to quai-testnet`);
    return addresses['quai-testnet'].EventDAO;
  }
  return addr.EventDAO;
}
