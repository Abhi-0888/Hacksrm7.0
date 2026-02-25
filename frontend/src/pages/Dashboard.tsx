import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProposalCard from '@/components/ProposalCard';
import WalletConnectModal from '@/components/WalletConnectModal';
import { useApp } from '@/context/AppContext';
import { useWeb3 } from '@/providers/Web3Provider';

const FILTERS = ['ALL', 'ACTIVE', 'APPROVED', 'REJECTED'] as const;
type Filter = typeof FILTERS[number];

export default function Dashboard() {
  const { proposals, isLoading } = useApp();
  const { account, setWalletModalOpen } = useWeb3();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const filtered = proposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    if (filter === 'ACTIVE') return matchesSearch && p.status === 'Active' && !p.finalized;
    if (filter === 'APPROVED') return matchesSearch && p.status === 'Approved';
    if (filter === 'REJECTED') return matchesSearch && p.status === 'Rejected';
    return matchesSearch;
  });

  if (!account) {
    return (
      <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
        <Header />
        <WalletConnectModal />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 pt-24 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 anim-float"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.2)' }}>
              <SlidersHorizontal className="w-10 h-10" style={{ color: '#c084fc' }} />
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Syne',sans-serif", color: '#fff' }}>
              Connect to <span className="grad-text">Vote</span>
            </h2>
            <p className="text-sm mb-8 max-w-md" style={{ color: '#6b7280' }}>
              Connect your wallet to browse, vote on proposals, and shape the community.
            </p>
            <button onClick={() => setWalletModalOpen(true)} className="btn-fancy">
              Connect Wallet
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <Header />
      <WalletConnectModal />

      <div className="relative overflow-hidden">
        {/* ambient blobs */}
        <div className="blob" style={{ width: 500, height: 500, background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', top: '-10%', left: '-10%', opacity: 0.15 }} />
        <div className="blob" style={{ width: 400, height: 400, background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', bottom: '10%', right: '-10%', opacity: 0.1 }} />

        <div className="relative z-10 max-w-7xl mx-auto px-5 pt-36 pb-12 space-y-10">
          {/* page header */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Syne',sans-serif", color: '#fff' }}>
                Event <span className="grad-text">Proposals</span>
              </h1>
              <p className="mt-2 text-base" style={{ color: '#6b7280' }}>
                Browse and vote on {filtered.length} community-driven initiatives.
              </p>
            </div>
            <button onClick={() => navigate('/create')} className="btn-fancy text-sm">
              + Create Proposal
            </button>
          </motion.div>

          {/* search & filters */}
          <motion.div
            className="glass rounded-2xl p-2 flex flex-col lg:flex-row gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6b7280' }} />
              <input
                type="text"
                placeholder="Search proposals by title..."
                className="w-full bg-transparent border-none rounded-xl pl-14 h-13 text-white placeholder:text-[#4a4a5e] focus:ring-0 text-base outline-none"
                style={{ fontFamily: "'Inter',sans-serif" }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 p-1 overflow-x-auto">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="whitespace-nowrap rounded-xl px-5 h-11 text-[0.7rem] font-semibold uppercase tracking-widest transition-all duration-300"
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    background: filter === f ? 'var(--grad-button)' : 'transparent',
                    color: filter === f ? '#fff' : '#6b7280',
                    boxShadow: filter === f ? 'var(--glow-primary)' : 'none',
                    border: filter === f ? 'none' : '1px solid rgba(168,85,247,0.1)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </motion.div>

          {/* proposal grid */}
          {isLoading && proposals.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#a855f7' }} />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <ProposalCard key={p.id} proposal={p} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              className="flex flex-col items-center text-center py-20 rounded-3xl"
              style={{ background: 'rgba(22,22,38,0.4)', border: '2px dashed rgba(168,85,247,0.15)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <Search className="w-10 h-10" style={{ color: '#6b7280' }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Syne',sans-serif", color: '#fff' }}>
                No Proposals Found
              </h3>
              <p className="text-sm max-w-md mb-6" style={{ color: '#6b7280' }}>
                No proposals match your criteria. Try widening your search or create a new one!
              </p>
              <button
                onClick={() => { setSearch(''); setFilter('ALL'); }}
                className="btn-outline-fancy text-sm"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
