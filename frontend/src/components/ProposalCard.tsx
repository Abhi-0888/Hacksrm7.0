import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Clock, User as UserIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/providers/Web3Provider';
import { useApp } from '@/context/AppContext';
import type { OnChainProposal } from '@/services/contractService';

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatTimeLeft(endTimeUnix: number): { text: string; expired: boolean } {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTimeUnix - now;
  if (diff <= 0) return { text: 'Ended', expired: true };

  const hours = Math.floor(diff / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;
  return {
    text: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
    expired: false,
  };
}

interface Props {
  proposal: OnChainProposal;
  index?: number;
}

export default function ProposalCard({ proposal, index = 0 }: Props) {
  const { account } = useWeb3();
  const { voteOnProposal, finalize, hasUserVoted, txPending } = useApp();
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(proposal.voteEndTime));
  const [voted, setVoted] = useState(false);
  const [votingFor, setVotingFor] = useState<'yes' | 'no' | null>(null);

  // Countdown timer
  useEffect(() => {
    const tick = () => setTimeLeft(formatTimeLeft(proposal.voteEndTime));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [proposal.voteEndTime]);

  // Check if user has voted
  useEffect(() => {
    if (account && proposal.id) {
      hasUserVoted(proposal.id).then(setVoted);
    }
  }, [account, proposal.id, hasUserVoted]);

  const handleVote = async (support: boolean) => {
    if (!account || voted || timeLeft.expired || txPending) return;
    setVotingFor(support ? 'yes' : 'no');
    const success = await voteOnProposal(proposal.id, support);
    if (success) setVoted(true);
    setVotingFor(null);
  };

  const handleFinalize = async () => {
    if (txPending) return;
    await finalize(proposal.id);
  };

  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPct = totalVotes > 0 ? Math.round((proposal.yesVotes / totalVotes) * 100) : 0;

  const statusConfig = {
    Active: { label: 'Active', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
    Approved: { label: 'Approved', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
    Rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  };
  const st = statusConfig[proposal.status] || statusConfig.Active;

  return (
    <motion.div
      className="card-fancy group flex flex-col h-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [.4, 0, .2, 1] }}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* header row */}
        <div className="flex justify-between items-start mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.68rem] font-semibold uppercase"
            style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, letterSpacing: '0.06em' }}
          >
            {!timeLeft.expired && proposal.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.color, boxShadow: `0 0 6px ${st.color}` }} />}
            {proposal.status === 'Active' && !timeLeft.expired ? 'Vote Now' : st.label}
          </span>

          <span
            className="flex items-center gap-1.5 text-[0.7rem] font-mono px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(22,22,38,0.8)', border: '1px solid rgba(168,85,247,0.1)', color: timeLeft.expired ? '#f87171' : '#c084fc' }}
          >
            <Clock className="w-3 h-3" />
            {timeLeft.text}
          </span>
        </div>

        {/* title */}
        <h3
          className="text-lg font-bold mb-2 transition-colors duration-300 group-hover:text-[#c084fc]"
          style={{ fontFamily: "'Syne',sans-serif", color: '#fff' }}
        >
          {proposal.title}
        </h3>

        {/* IPFS CID */}
        <p className="text-xs mb-4 line-clamp-2" style={{ color: '#6b7280' }}>
          IPFS: {proposal.ipfsCID.length > 30 ? `${proposal.ipfsCID.slice(0, 30)}…` : proposal.ipfsCID}
        </p>

        {/* proposer */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }} />
          <span className="text-xs font-medium" style={{ color: '#6b7280' }}>
            <UserIcon className="w-3 h-3 inline mr-1" />
            {formatAddress(proposal.proposer)}
          </span>
        </div>

        {/* vote bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#6b7280' }}>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
              {proposal.yesVotes} Yes
            </span>
            <span className="flex items-center gap-1.5">
              {proposal.noVotes} No
              <ThumbsDown className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${yesPct}%` }} />
          </div>
          <p className="text-right text-[0.7rem] mt-1 font-bold" style={{ color: '#c084fc', fontFamily: "'Syne',sans-serif" }}>
            {totalVotes} total
          </p>
        </div>

        {/* actions */}
        <div className="mt-auto space-y-2">
          {proposal.status === 'Active' && !timeLeft.expired && account && !voted && (
            <div className="flex gap-2">
              <button
                onClick={() => handleVote(true)}
                disabled={txPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                style={{
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  color: '#34d399',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.1)'; e.currentTarget.style.color = '#34d399'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)'; }}
              >
                {votingFor === 'yes' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                Yes
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={txPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                style={{
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  color: '#f87171',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}
              >
                {votingFor === 'no' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                No
              </button>
            </div>
          )}

          {voted && (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
              <CheckCircle className="w-4 h-4" /> Vote Recorded
            </div>
          )}

          {timeLeft.expired && !proposal.finalized && account && (
            <button
              onClick={handleFinalize}
              disabled={txPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)', color: '#f472b6' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#7c3aed,#a855f7)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.1)'; e.currentTarget.style.color = '#f472b6'; }}
            >
              {txPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Finalize Proposal
            </button>
          )}

          {proposal.finalized && (
            <div className="text-center py-2.5 rounded-xl text-[0.7rem] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(22,22,38,0.6)', border: '1px solid rgba(168,85,247,0.1)', color: '#6b7280' }}>
              {proposal.status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
