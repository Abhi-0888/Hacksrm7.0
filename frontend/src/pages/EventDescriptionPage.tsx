import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User as UserIcon, ThumbsUp, ThumbsDown, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useWeb3 } from '@/providers/Web3Provider';
import type { OnChainProposal } from '@/services/contractService';
import { getPoster } from '@/services/posterStore';

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatTimeLeft(endTimeUnix: number): { text: string; expired: boolean } {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTimeUnix - now;
  if (diff <= 0) return { text: 'Voting Ended', expired: true };
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return {
    text: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
    expired: false,
  };
}

function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 120) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,35%), hsl(${h2},70%,25%))`;
}

function EventPosterImage({ posterUrl, title }: { posterUrl?: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const showImg = !!posterUrl && !hasError;

  return (
    <div
      style={{
        width: 280, height: 280,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(168,85,247,0.25)',
        boxShadow: '0 0 40px rgba(168,85,247,0.15)',
        flexShrink: 0,
      }}
    >
      {/* Gradient fallback / skeleton */}
      {(!isLoaded || !showImg) && (
        <div style={{ position: 'absolute', inset: 0, background: showImg ? 'rgba(14,14,24,0.9)' : gradientFor(title) }}>
          {!showImg && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>EVENT</span>
            </div>
          )}
          {showImg && !isLoaded && (
            <div className="animate-pulse" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.1), transparent)' }} />
          )}
        </div>
      )}
      {/* Image with hover zoom */}
      {showImg && (
        <div
          style={{ position: 'absolute', inset: 0, transition: 'transform 0.2s ease', transform: 'scale(1)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
        >
          <img
            src={posterUrl}
            alt={`Poster for ${title}`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isLoaded ? 1 : 0, transition: 'opacity 0.35s ease' }}
          />
        </div>
      )}
    </div>
  );
}


export default function EventDescriptionPage() {
  const { id } = useParams<{ id: string }>();
  const { proposals, voteOnProposal, finalize, hasUserVoted, txPending } = useApp();
  const { account } = useWeb3();

  const [proposal, setProposal] = useState<OnChainProposal | null>(null);
  const [timeLeft, setTimeLeft] = useState({ text: '--:--:--', expired: false });
  const [voted, setVoted] = useState(false);
  const [votingFor, setVotingFor] = useState<'yes' | 'no' | null>(null);

  // Find proposal from context
  useEffect(() => {
    const found = proposals.find(p => String(p.id) === id);
    setProposal(found || null);
  }, [proposals, id]);

  // Countdown
  useEffect(() => {
    if (!proposal) return;
    const tick = () => setTimeLeft(formatTimeLeft(proposal.voteEndTime));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [proposal]);

  // Check voted status
  useEffect(() => {
    if (account && proposal) {
      hasUserVoted(proposal.id).then(setVoted);
    }
  }, [account, proposal, hasUserVoted]);

  const handleVote = async (support: boolean) => {
    if (!account || voted || timeLeft.expired || txPending || !proposal) return;
    setVotingFor(support ? 'yes' : 'no');
    const ok = await voteOnProposal(proposal.id, support);
    if (ok) setVoted(true);
    setVotingFor(null);
  };

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {proposals.length === 0 ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: '#a855f7' }} />
              <p style={{ color: '#6b7280' }}>Loading event…</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-bold mb-2" style={{ color: '#fff', fontFamily: "'Syne', sans-serif" }}>Event Not Found</p>
              <p className="text-sm mb-6" style={{ color: '#6b7280' }}>This event doesn't exist or hasn't loaded yet.</p>
              <Link to="/dashboard" className="btn-fancy text-sm px-5 py-2">← Back to Dashboard</Link>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPct = totalVotes > 0 ? Math.round((proposal.yesVotes / totalVotes) * 100) : 0;
  const noPct = 100 - yesPct;

  const statusConfig = {
    Active: { label: 'Active', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
    Approved: { label: 'Approved', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
    Rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  };
  const st = statusConfig[proposal.status] || statusConfig.Active;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob" style={{ width: 600, height: 600, background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', top: '-15%', left: '-15%', opacity: 0.12 }} />
        <div className="blob" style={{ width: 400, height: 400, background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', bottom: '10%', right: '-10%', opacity: 0.1 }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-24 pb-20">

        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium mb-10 transition-all duration-200 hover:gap-3"
            style={{ color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c084fc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proposals
          </Link>
        </motion.div>

        {/* Main card: two-column layout */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(14,14,24,0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(168,85,247,0.2)',
            boxShadow: '0 0 60px rgba(168,85,247,0.08), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex flex-col md:flex-row gap-0">

            {/* LEFT: Poster */}
            <div
              className="p-8 flex items-center justify-center md:w-[360px] shrink-0"
              style={{ borderRight: '1px solid rgba(168,85,247,0.1)', background: 'rgba(8,8,16,0.4)' }}
            >
              <EventPosterImage posterUrl={proposal.posterUrl ?? getPoster(proposal.title) ?? undefined} title={proposal.title} />
            </div>

            {/* RIGHT: Details */}
            <div className="flex-1 p-8 flex flex-col">

              {/* Status badge + timer row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                >
                  {proposal.status === 'Active' && !timeLeft.expired && (
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.color }} />
                  )}
                  {st.label}
                </span>
                <span
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold"
                  style={{ background: 'rgba(22,22,38,0.8)', border: '1px solid rgba(168,85,247,0.15)', color: timeLeft.expired ? '#f87171' : '#c084fc' }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {timeLeft.text}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight" style={{ fontFamily: "'Syne',sans-serif", color: '#fff' }}>
                {proposal.title}
              </h1>

              {/* Proposer */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-wider mb-0.5" style={{ color: '#4a4a6e' }}>Proposer</p>
                  <p className="text-sm font-mono" style={{ color: '#c084fc' }}>{formatAddress(proposal.proposer)}</p>
                </div>
              </div>

              {/* Description from IPFS CID */}
              <div
                className="rounded-2xl p-5 mb-6 flex-1"
                style={{ background: 'rgba(22,22,38,0.5)', border: '1px solid rgba(168,85,247,0.08)' }}
              >
                <p className="text-xs uppercase tracking-wider mb-2 font-bold" style={{ color: '#4a4a6e' }}>Description / IPFS Reference</p>
                <p className="text-sm leading-relaxed break-all" style={{ color: '#9ca3af', fontFamily: "'Inter',sans-serif" }}>
                  {proposal.ipfsCID || 'No description provided for this proposal.'}
                </p>
              </div>

              {/* Vote stats */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span style={{ color: '#34d399' }}>👍 {proposal.yesVotes} Yes ({yesPct}%)</span>
                  <span style={{ color: '#f87171' }}>👎 {proposal.noVotes} No ({noPct}%)</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${yesPct}%`,
                      background: 'linear-gradient(90deg,#34d399,#059669)',
                      boxShadow: '0 0 10px rgba(52,211,153,0.4)',
                    }}
                  />
                </div>
                <p className="text-right text-[0.7rem] mt-1.5 font-bold" style={{ color: '#6b7280' }}>{totalVotes} total votes</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-auto">
                {proposal.status === 'Active' && !timeLeft.expired && account && !voted && (
                  <>
                    <button
                      onClick={() => handleVote(true)}
                      disabled={txPending}
                      aria-label="Vote Yes"
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                      style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(52,211,153,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.12)'; e.currentTarget.style.color = '#34d399'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {votingFor === 'yes' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                      Vote Yes
                    </button>
                    <button
                      onClick={() => handleVote(false)}
                      disabled={txPending}
                      aria-label="Vote No"
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(248,113,113,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {votingFor === 'no' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                      Vote No
                    </button>
                  </>
                )}

                {voted && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
                    <CheckCircle className="w-4 h-4" /> Vote Recorded
                  </div>
                )}

                {timeLeft.expired && !proposal.finalized && account && (
                  <button
                    onClick={() => finalize(proposal.id)}
                    disabled={txPending}
                    aria-label="Finalize Proposal"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                    style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', color: '#f472b6' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#7c3aed,#ec4899)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.12)'; e.currentTarget.style.color = '#f472b6'; }}
                  >
                    {txPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Finalize Proposal
                  </button>
                )}

                {proposal.finalized && (
                  <div className="flex-1 text-center py-3 rounded-2xl text-sm font-extrabold uppercase tracking-wider"
                    style={{ background: 'rgba(22,22,38,0.8)', border: '1px solid rgba(168,85,247,0.1)', color: '#6b7280' }}>
                    {proposal.status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
