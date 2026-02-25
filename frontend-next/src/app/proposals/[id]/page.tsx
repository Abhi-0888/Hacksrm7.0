"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, User as UserIcon, CheckCircle, Loader2, XCircle, Shield, Share2, ExternalLink } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useWeb3 } from "@/providers/Web3Provider";
import { formatAddress, cn } from "@/lib/utils";
import { Poster } from "@/components/ui/Poster";
import { Footer } from "@/components/layout/Footer";

export default function ProposalDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { proposals, voteOnProposal, finalize, hasUserVoted, txPending } = useApp();
    const { account, isConnected } = useWeb3();

    const [proposal, setProposal] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState({ text: "--:--:--", expired: false });
    const [hasVoted, setHasVoted] = useState(false);
    const [isVoting, setIsVoting] = useState<"yes" | "no" | null>(null);

    // Sync proposal from context
    useEffect(() => {
        const found = proposals.find((p) => String(p.id) === id);
        if (found) setProposal(found);
    }, [proposals, id]);

    // Countdown logic
    useEffect(() => {
        if (!proposal) return;

        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const diff = proposal.voteEndTime - now;

            if (diff <= 0) {
                return { text: "VOTING EXPIRED", expired: true };
            }

            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            return {
                text: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
                expired: false,
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());
        return () => clearInterval(timer);
    }, [proposal]);

    // Check if user has voted
    useEffect(() => {
        if (id && account) {
            hasUserVoted(parseInt(id)).then(setHasVoted);
        }
    }, [id, account, hasUserVoted]); // Re-check when account changes

    const handleVote = async (support: boolean) => {
        if (!isConnected || hasVoted || timeLeft.expired || txPending) return;

        setIsVoting(support ? "yes" : "no");
        const success = await voteOnProposal(parseInt(id), support);
        if (success) setHasVoted(true);
        setIsVoting(null);
    };

    if (!proposal) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="font-mono text-sm text-primary tracking-[0.3em] uppercase animate-pulse">
                    Accessing Governance Ledger...
                </div>
            </div>
        );
    }

    const totalVotes = proposal.yesVotes + proposal.noVotes;
    const yesPct = totalVotes > 0 ? Math.round((proposal.yesVotes / totalVotes) * 100) : 0;
    const noPct = totalVotes > 0 ? 100 - yesPct : 0;

    return (
        <div className="min-h-screen bg-background pt-12">
            {/* Nav Header */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 font-mono text-[0.65rem] text-muted hover:text-primary transition-colors uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Proposals
                </button>
            </div>

            <main className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">

                    {/* LEFT CONTENT: Hero & Description */}
                    <div className="space-y-12">
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="font-mono text-[0.6rem] px-3 py-1 border border-primary/30 text-primary uppercase tracking-widest bg-primary/5">
                                    Governance Proposal
                                </span>
                                <span className="font-mono text-[0.6rem] text-muted tracking-widest uppercase">
                                    ID #{proposal.id}
                                </span>
                            </div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-[0.9] mb-8"
                            >
                                {proposal.title.split(" ").map((word: string, i: number) => (
                                    <span key={i} className={cn("block", i % 2 !== 0 && "text-primary")}>{word} </span>
                                ))}
                            </motion.h1>

                            <div className="flex flex-wrap items-center gap-8 py-8 border-y border-border">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <UserIcon size={18} />
                                    </div>
                                    <div>
                                        <div className="font-mono text-[0.55rem] text-muted uppercase tracking-widest mb-1">PROPOSER</div>
                                        <div className="font-mono text-xs text-foreground">{formatAddress(proposal.proposer)}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <div className="font-mono text-[0.55rem] text-muted uppercase tracking-widest mb-1">VOTING TIME</div>
                                        <div className={cn("font-mono text-xs", timeLeft.expired ? "text-danger" : "text-secondary")}>
                                            {timeLeft.text}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <div className="font-mono text-[0.55rem] text-muted uppercase tracking-widest mb-1">NETWORK</div>
                                        <div className="font-mono text-xs text-foreground uppercase tracking-widest">Quai Cyprus-1</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-mono text-sm text-primary uppercase tracking-[0.2em]">/ Description</h3>
                                <div className="flex items-center gap-2 font-mono text-[0.6rem] text-muted cursor-pointer hover:text-primary transition-colors">
                                    <Share2 size={12} /> SHARE
                                </div>
                            </div>
                            <div className="bg-bg2/50 border border-border p-8 rounded-sm relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -rotate-45 translate-x-8 -translate-y-8" />
                                <p className="font-ui text-lg text-foreground/80 leading-relaxed font-light">
                                    {proposal.ipfsCID || "This proposal was deployed to the Quai Network without a supplementary description payload. The title and on-chain parameters constitute the legal bounds of this governance action."}
                                </p>
                                <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-between font-mono text-[0.6rem] text-muted uppercase tracking-[0.2em]">
                                    <span>Payload Hash: {proposal.ipfsCID ? proposal.ipfsCID.slice(0, 16) + "..." : "NONE"}</span>
                                    <a href="#" className="flex items-center gap-1 hover:text-primary transition-colors">
                                        VIEW RAW <ExternalLink size={10} />
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT CONTENT: Voting & Stats */}
                    <aside className="sticky top-24 space-y-8">
                        {/* Poster Visualization */}
                        <Poster alt={proposal.title} size="lg" className="w-full" />

                        {/* Voting Panel */}
                        <div className="bg-panel border border-border p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                            <h3 className="font-display text-2xl tracking-widest uppercase mb-8">Cast Your <span className="text-primary">Vote</span></h3>

                            <div className="space-y-8 mb-10">
                                <div className="space-y-3">
                                    <div className="flex justify-between font-mono text-[0.65rem] uppercase tracking-widest">
                                        <span className="text-primary">Support</span>
                                        <span className="text-foreground">{yesPct}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-dim overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${yesPct}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-primary shadow-[0_0_10px_rgba(180,245,0,0.3)]"
                                        />
                                    </div>
                                    <div className="text-[0.6rem] font-mono text-muted text-right uppercase">
                                        {proposal.yesVotes} QUAI VOTES
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between font-mono text-[0.65rem] uppercase tracking-widest">
                                        <span className="text-danger">Against</span>
                                        <span className="text-foreground">{noPct}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-dim overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${noPct}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-danger shadow-[0_0_10px_rgba(245,0,61,0.3)]"
                                        />
                                    </div>
                                    <div className="text-[0.6rem] font-mono text-muted text-right uppercase">
                                        {proposal.noVotes} QUAI VOTES
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {proposal.finalized ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={cn(
                                            "w-full text-center py-4 font-mono text-[0.7rem] uppercase tracking-[0.3em] border",
                                            proposal.status === 'Approved' ? "text-primary border-primary/20 bg-primary/5" : "text-danger border-danger/20 bg-danger/5"
                                        )}
                                    >
                                        PROPOSAL {proposal.status === 'Approved' ? 'PASSED' : 'REJECTED'}
                                    </motion.div>
                                ) : !isConnected ? (
                                    <button
                                        onClick={() => { }} // Handle wallet connect
                                        className="btn-accent w-full py-4 text-center"
                                    >
                                        Connect Wallet to Vote
                                    </button>
                                ) : hasVoted ? (
                                    <div className="w-full text-center py-4 font-mono text-[0.7rem] text-primary uppercase tracking-[0.3em] bg-primary/5 border border-primary/20 flex items-center justify-center gap-2">
                                        <CheckCircle size={14} /> VOTE RECORDED
                                    </div>
                                ) : timeLeft.expired ? (
                                    <button
                                        onClick={() => finalize(parseInt(id))}
                                        disabled={txPending}
                                        className="w-full py-4 font-mono text-[0.7rem] text-accent uppercase tracking-[0.3em] bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {txPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Finalize Result
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleVote(true)}
                                            disabled={txPending}
                                            className="font-mono text-[0.65rem] py-4 bg-transparent border border-primary text-primary hover:bg-primary hover:text-background transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isVoting === "yes" ? <Loader2 size={12} className="animate-spin" /> : "SUPPORT"}
                                        </button>
                                        <button
                                            onClick={() => handleVote(false)}
                                            disabled={txPending}
                                            className="font-mono text-[0.65rem] py-4 bg-transparent border border-danger text-danger hover:bg-danger hover:text-background transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isVoting === "no" ? <Loader2 size={12} className="animate-spin" /> : "REJECT"}
                                        </button>
                                    </div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 text-center font-mono text-[0.55rem] text-muted uppercase tracking-widest">
                                TOTAL WEIGHT: {totalVotes} QUAI CONSENSUS
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}
