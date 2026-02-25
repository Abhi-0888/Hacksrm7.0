import { X, Wallet, Globe } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useWeb3 } from '@/providers/Web3Provider';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletConnectModal() {
  const {
    isWalletModalOpen,
    setWalletModalOpen,
    connectPelagus,
    connectMetaMask,
    isPelagusInstalled,
    error,
  } = useWeb3();

  if (!isWalletModalOpen) return null;

  const handlePelagus = async () => {
    const addr = await connectPelagus();
    if (addr) setWalletModalOpen(false);
  };

  const handleMetaMask = async () => {
    const addr = await connectMetaMask();
    if (addr) setWalletModalOpen(false);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* backdrop */}
        <motion.div
          className="absolute inset-0 backdrop-blur-md"
          style={{ background: 'rgba(10,10,15,0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setWalletModalOpen(false)}
        />

        {/* modal card */}
        <motion.div
          className="relative glass-bright rounded-2xl max-w-sm w-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: [.4, 0, .2, 1] }}
        >
          {/* glow blobs */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(168,85,247,0.3)' }} />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(236,72,153,0.3)' }} />

          <div className="relative z-10 p-6">
            <button
              onClick={() => setWalletModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full transition-colors"
              style={{ color: '#6b7280' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
            >
              <X className="w-5 h-5" />
            </button>

            {/* header */}
            <div className="text-center mb-8 pt-2">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 anim-float"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
                  border: '1px solid rgba(168,85,247,0.3)',
                  boxShadow: '0 0 20px rgba(168,85,247,0.15)',
                }}
              >
                <Wallet className="w-8 h-8" style={{ color: '#c084fc' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Syne',sans-serif", color: '#fff' }}>
                Connect Wallet
              </h2>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Choose your preferred wallet to access CampusChoice
              </p>
            </div>

            {/* wallet options */}
            <div className="space-y-3 mb-4">
              <button
                onClick={handlePelagus}
                className="group relative w-full flex items-center p-4 rounded-xl transition-all duration-300 overflow-hidden"
                style={{
                  background: 'rgba(22,22,38,0.6)',
                  border: '1px solid rgba(168,85,247,0.15)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(168,85,247,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(22,22,38,0.6)';
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.15)';
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}
                >
                  <Wallet className="w-6 h-6" style={{ color: '#c084fc' }} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-base font-semibold" style={{ color: '#fff' }}>Pelagus Wallet</h3>
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    {isPelagusInstalled ? 'Recommended for Quai' : 'Click to install'}
                  </p>
                </div>
              </button>

              <button
                onClick={handleMetaMask}
                className="group relative w-full flex items-center p-4 rounded-xl transition-all duration-300 overflow-hidden"
                style={{
                  background: 'rgba(22,22,38,0.6)',
                  border: '1px solid rgba(236,72,153,0.15)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(236,72,153,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(236,72,153,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(22,22,38,0.6)';
                  e.currentTarget.style.borderColor = 'rgba(236,72,153,0.15)';
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.2)' }}
                >
                  <Globe className="w-6 h-6" style={{ color: '#f472b6' }} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-base font-semibold" style={{ color: '#fff' }}>MetaMask / Other</h3>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Standard EVM Wallets</p>
                </div>
              </button>
            </div>

            {/* error */}
            {error && (
              <p className="text-center text-xs mt-2" style={{ color: '#f87171' }}>{error}</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
