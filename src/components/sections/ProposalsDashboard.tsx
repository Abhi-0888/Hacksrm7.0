"use client";

import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Vote, Timer, User, Check, X } from "lucide-react";

export const ProposalsDashboard = () => {
    const { proposals, isLoading, voteOnProposal, txPending, contractError } = useApp();

    if (isLoading && proposals.length === 0) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-quai-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <section className="py-24 px-6 max-w-7xl mx-auto w-full" id="voting">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <span className="text-xs font-mono text-quai-blue uppercase tracking-[0.3em] mb-4 block">Active Governance</span>
                    <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Live <span className="text-quai-blue text-glow">Proposals</span></h2>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-muted">
                        Total: {proposals.length}
                    </div>
                    {contractError && (
                        <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-mono uppercase tracking-widest text-red-400">
                            Connection Error
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {proposals.length === 0 ? (
                    <Card className="col-span-full py-20 text-center opacity-50">
                        <p className="text-lg font-display uppercase tracking-widest italic">No active proposals found on the ledger.</p>
                    </Card>
                ) : (
                    proposals.map((proposal) => (
                        <motion.div
                            key={proposal.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full border border-white/5 hover:border-quai-blue/30 transition-colors">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="px-3 py-1 rounded-full bg-quai-blue/10 border border-quai-blue/20 text-[10px] font-mono text-quai-blue uppercase tracking-widest">
                                        ID #{proposal.id}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-mono text-muted">
                                        <Timer size={14} />
                                        {new Date(proposal.voteEndTime * 1000).toLocaleDateString()}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold mb-6 min-h-[4rem] group-hover:text-quai-blue transition-colors uppercase tracking-tight">
                                    {proposal.title}
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Yes Votes</div>
                                        <div className="text-2xl font-display font-bold text-quai-blue">{proposal.yesVotes}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                        <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">No Votes</div>
                                        <div className="text-2xl font-display font-bold text-quai-red">{proposal.noVotes}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2 text-xs font-mono text-muted overflow-hidden">
                                        <User size={14} />
                                        <span className="truncate">{proposal.proposer.slice(0, 10)}...</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="px-4"
                                            onClick={() => voteOnProposal(proposal.id, false)}
                                            disabled={txPending}
                                        >
                                            <X size={16} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            glow
                                            className="px-4"
                                            onClick={() => voteOnProposal(proposal.id, true)}
                                            disabled={txPending}
                                        >
                                            Vote Yes
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </section>
    );
};
