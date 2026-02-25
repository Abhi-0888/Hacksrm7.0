import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Clock, User as UserIcon, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import { useWeb3 } from '@/providers/Web3Provider';
import { useApp } from '@/context/AppContext';
import type { OnChainProposal } from '@/services/contractService';

/** Deterministic gradient placeholder — same algorithm as Poster.tsx */
function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 120) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,35%), hsl(${h2},70%,25%))`;
}

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatTimeLeft(endTimeUnix: number): { text: string; expired: boolean } {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTimeUnix - now;
  if (diff <= 0) return { text: 'Ended', expired: true };
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return {
    text: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
    expired: false,
  };
}

interface Props {
  proposal: OnChainProposal;
  index?: number;
}

/** Poster image with skeleton loading, hover zoom, and gradient fallback */
function PosterImage({ posterUrl, title }: { posterUrl?: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const showImg = !!posterUrl && !hasError;

  return (
    <div
      className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 relative"
      style={{
        border: '1px solid rgba(168,85,247,0.22)',
        boxShadow: '0 0 16px rgba(168,85,247,0.12)',
        // Reserve space before image loads to prevent layout shift
        minWidth: '7rem',
        minHeight: '7rem',
      }}
    >
      {/* Shimmer skeleton — visible until image loads or when no poster */}
      {(!isLoaded || !showImg) && (
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: showImg
              ? 'rgba(22,22,38,0.9)'  // dark wait while image fetches
              : gradientFor(title),    // gradient fallback
          }}
        >
          {/* "EVENT" label only shown on gradient fallback */}
          {!showImg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[0.55rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>EVENT</span>
            </div>
          )}
          {/* Shimmer animation on the dark wait state */}
          {showImg && !isLoaded && (
            <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.08) 50%, transparent 100%)' }} />
          )}
        </div>
      )}

      {/* Real image */}
      {showImg && (
        <div
          className="absolute inset-0 transition-transform duration-200 ease-in-out"
          style={{ transform: 'scale(1)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
        >
          <img
            src={posterUrl}
            alt={`Poster for ${title}`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className="w-full h-full"
            style={{ objectFit: 'cover', opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
          />
        </div>
      )}
    </div>
  );
}

export default function ProposalCard({ proposal, index = 0 }: Props) {
  const { account } = useWeb3();
  const { voteOnProposal, finalize, hasUserVoted, txPending } = useApp();
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(proposal.voteEndTime));
  const [voted, setVoted] = useState(false);
  const [votingFor, setVotingFor] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    const tick = () => setTimeLeft(formatTimeLeft(proposal.voteEndTime));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [proposal.voteEndTime]);

  useEffect(() => {
    if (account && proposal.id) {
      hasUserVoted(proposal.id).then(setVoted);
    }
  }, [account, proposal.id, hasUserVoted]);

  const handleVote = async (support: boolean) => {
    if (!account || voted || timeLeft.expired || txPending) return;
    setVotingFor(support ? 'yes' : 'no');
    const ok = await voteOnProposal(proposal.id, support);
    if (ok) setVoted(true);
    setVotingFor(null);
  };

  const handleFinalize = async () => {
    if (txPending) return;
    await finalize(proposal.id);
  };

  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPct = totalVotes > 0 ? Math.round((proposal.yesVotes / totalVotes) * 100) : 0;

  const statusConfig = {
    Active:   { label: 'Vote Now', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.28)' },
    Approved: { label: 'Approved', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.28)' },
    Rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.28)' },
  };
  const st = statusConfig[proposal.status] || statusConfig.Active;

  return (
    <motion.article
      className="group w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      aria-label={`Event proposal: ${proposal.title}`}
    >
      <div
        className="flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: 'rgba(14,14,24,0.82)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168,85,247,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.35)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 32px rgba(168,85,247,0.1), 0 8px 32px rgba(0,0,0,0.4)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.15)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'; }}
      >
        {/* ── LEFT COLUMN: Poster ── */}
        <div
          className="flex items-center justify-center p-3 sm:p-4 shrink-0 sm:w-40"
          style={{ borderRight: 'none' }}
        >
          <PosterImage posterUrl={proposal.posterUrl} title={proposal.title} />
        </div>

        {/* ── RIGHT COLUMN: Details ── */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">

          {/* Top row: status badge + timer */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider"
              style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
            >
              {proposal.status === 'Active' && !timeLeft.expired && (
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
              )}
              {timeLeft.expired && proposal.status === 'Active' ? 'Ended' : st.label}
            </span>
            <span
              className="flex items-center gap-1.5 text-[0.68rem] font-mono px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(22,22,38,0.8)', border: '1px solid rgba(168,85,247,0.1)', color: timeLeft.expired ? '#f87171' : '#c084fc' }}
            >
              <Clock className="w-3 h-3" aria-hidden="true" />
              {timeLeft.text}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-base font-extrabold mb-2 leading-snug truncate group-hover:text-[#c084fc] transition-colors duration-200"
            style={{ fontFamily: "'Syne',sans-serif", color: '#fff' }}
            title={proposal.title}
          >
            {proposal.title}
          </h3>

          {/* Proposer */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-5 h-5 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }} aria-hidden="true" />
            <span className="text-xs font-mono truncate" style={{ color: '#6b7280' }}>
              <UserIcon className="w-3 h-3 inline mr-1" aria-hidden="true" />
              {formatAddress(proposal.proposer)}
            </span>
          </div>

          {/* Vote progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[0.68rem] mb-1.5" style={{ color: '#6b7280' }}>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" style={{ color: '#34d399' }} aria-hidden="true" />
                {proposal.yesVotes} Yes
              </span>
              <span className="flex items-center gap-1">
                {proposal.noVotes} No
                <ThumbsDown className="w-3 h-3" style={{ color: '#f87171' }} aria-hidden="true" />
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              role="meter"
              aria-valuenow={yesPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${yesPct}% yes votes`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${yesPct}%`,
                  background: 'linear-gradient(90deg,#34d399,#059669)',
                  boxShadow: yesPct > 0 ? '0 0 8px rgba(52,211,153,0.5)' : 'none',
                }}
              />
            </div>
            <p className="text-right text-[0.65rem] mt-1 font-bold" style={{ color: '#c084fc', fontFamily: "'Syne',sans-serif" }}>
              {totalVotes} total
            </p>
          </div>

          {/* ── Bottom row: Action buttons ── */}
          <div className="mt-auto flex flex-wrap gap-2">

            {/* YES button */}
            {proposal.status === 'Active' && !timeLeft.expired && account && !voted && (
              <>
                <button
                  onClick={() => handleVote(true)}
                  disabled={txPending}
                  aria-label={`Vote yes on "${proposal.title}"`}
                  className="flex-1 min-w-[72px] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 16px rgba(52,211,153,0.4)'; e.currentTarget.style.borderColor = 'transparent'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.1)'; e.currentTarget.style.color = '#34d399'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)'; }}
                >
                  {votingFor === 'yes' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                  Yes
                </button>

                {/* NO button */}
                <button
                  onClick={() => handleVote(false)}
                  disabled={txPending}
                  aria-label={`Vote no on "${proposal.title}"`}
                  className="flex-1 min-w-[72px] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 16px rgba(248,113,113,0.4)'; e.currentTarget.style.borderColor = 'transparent'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}
                >
                  {votingFor === 'no' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsDown className="w-3.5 h-3.5" />}
                  No
                </button>
              </>
            )}

            {voted && (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
                <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> Vote Recorded
              </div>
            )}

            {timeLeft.expired && !proposal.finalized && account && (
              <button
                onClick={handleFinalize}
                disabled={txPending}
                aria-label={`Finalize proposal "${proposal.title}"`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)', color: '#f472b6', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#7c3aed,#ec4899)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.1)'; e.currentTarget.style.color = '#f472b6'; }}
              >
                {txPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Finalize
              </button>
            )}

            {proposal.finalized && (
              <div className="flex-1 text-center py-2 rounded-xl text-[0.65rem] font-extrabold uppercase tracking-wider"
                style={{ background: 'rgba(22,22,38,0.6)', border: '1px solid rgba(168,85,247,0.08)', color: '#6b7280' }}>
                {proposal.status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
              </div>
            )}

            {/* ── DESCRIPTION BUTTON (always visible) ── */}
            <a
              href={`/events/${proposal.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View full description of "${proposal.title}" in a new tab`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
              style={{
                background: 'rgba(168,85,247,0.08)',
                border: '1px solid rgba(168,85,247,0.22)',
                color: '#a855f7',
                cursor: 'pointer',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(168,85,247,0.3)'; e.currentTarget.style.color = '#c084fc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = '#a855f7'; }}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              Description
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
