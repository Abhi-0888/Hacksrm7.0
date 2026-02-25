// ── ABI imports ──
import EventDAOArtifact from '../artifacts/contracts/EventDAO.sol/EventDAO.json';

export const EventDAOABI = EventDAOArtifact.abi;

// ── Network addresses ──
import quaiTestnet from '../addresses/quai-testnet.json';
import quaiMainnet from '../addresses/quai-mainnet.json';
import localhost from '../addresses/localhost.json';

export const addresses = {
  'quai-testnet': quaiTestnet,
  'quai-mainnet': quaiMainnet,
  'localhost': localhost,
} as const;

export type NetworkName = keyof typeof addresses;

export function getEventDAOAddress(network: NetworkName): string {
  return addresses[network].EventDAO;
}
