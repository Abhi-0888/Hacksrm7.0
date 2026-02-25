import { useState } from 'react';
import { quais } from 'quais';
import EventDAOJson from '@/web3/abi/EventDAO.json';

// IPFS hash extracted from compiled bytecode
const IPFS_HASH = 'QmZCDMvXoqjw6NMpBDSBiFA6icczAVn3eQLSEx1bFkdEax';

export default function DeployPage() {
  const [status, setStatus] = useState<string>('');
  const [contractAddr, setContractAddr] = useState<string>('');
  const [deploying, setDeploying] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const handleDeploy = async () => {
    setDeploying(true);
    setStatus('Connecting to Pelagus...');

    try {
      const w = window as any;
      const walletProvider = w.pelagus || w.ethereum;
      if (!walletProvider) throw new Error('No wallet detected. Install Pelagus.');

      await walletProvider.request({ method: 'eth_requestAccounts' });
      const provider = new quais.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setStatus(`Connected as ${address}. Deploying with address grinding...`);

      const factory = new quais.ContractFactory(
        EventDAOJson.abi,
        EventDAOJson.bytecode,
        signer,
        IPFS_HASH
      );

      const contract = await factory.deploy();
      const hash = contract.deploymentTransaction()?.hash || '';
      setTxHash(hash);
      setStatus(`Tx sent: ${hash.slice(0, 20)}... Waiting...`);

      await contract.waitForDeployment();
      const addr = await contract.getAddress();
      setContractAddr(addr);
      setStatus('✅ Deployed to Cyprus-1!');
    } catch (err: any) {
      console.error('Deploy error:', err);
      setStatus(`❌ Error: ${err.shortMessage || err.message}`);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div style={{
      maxWidth: 700, margin: '60px auto', padding: 32,
      background: '#1a1a2e', borderRadius: 16, color: '#e0e0e0',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#fff' }}>🚀 Deploy EventDAO</h1>
      <p style={{ color: '#aaa', marginBottom: 24 }}>
        Deploy with <strong>quais.js address grinding</strong> for Cyprus-1 zone compatibility.
      </p>

      <button
        onClick={handleDeploy}
        disabled={deploying}
        style={{
          padding: '14px 32px', fontSize: 16, fontWeight: 600,
          background: deploying ? '#555' : 'linear-gradient(135deg, #667eea, #764ba2)',
          color: '#fff', border: 'none', borderRadius: 10, cursor: deploying ? 'not-allowed' : 'pointer',
          width: '100%', marginBottom: 20
        }}
      >
        {deploying ? '⏳ Deploying...' : 'Deploy EventDAO to Cyprus-1'}
      </button>

      {status && (
        <div style={{
          padding: 16, background: '#0d0d1a', borderRadius: 8, marginBottom: 16,
          wordBreak: 'break-all', fontSize: 14, lineHeight: 1.6
        }}>
          <strong>Status:</strong> {status}
        </div>
      )}

      {txHash && (
        <div style={{ padding: 12, background: '#1a1a3e', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <strong>Tx:</strong>{' '}
          <a href={`https://orchard.quaiscan.io/tx/${txHash}`}
            target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
            {txHash}
          </a>
        </div>
      )}

      {contractAddr && (
        <div style={{
          padding: 16, background: '#0f3d0f', borderRadius: 8, border: '1px solid #2d8c2d'
        }}>
          <strong style={{ color: '#4caf50' }}>✅ Contract (Cyprus-1):</strong>
          <div style={{
            fontSize: 16, fontFamily: 'monospace', marginTop: 8,
            padding: 10, background: '#1a4d1a', borderRadius: 6, wordBreak: 'break-all'
          }}>
            {contractAddr}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: '#aaa' }}>
            Copy this and paste it in the chat.
          </p>
        </div>
      )}
    </div>
  );
}
