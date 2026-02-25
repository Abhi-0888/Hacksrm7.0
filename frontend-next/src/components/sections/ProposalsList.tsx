"use client";

import React, { useState } from "react";
import { ProposalCard } from "./ProposalCard";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

export const ProposalsList = () => {
    const { proposals, isLoading } = useApp();
    const [filter, setFilter] = useState("all");
    const [category, setCategory] = useState("all");

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] min-h-[calc(100vh-72px)]">
            {/* Sidebar */}
            <aside className="bg-bg2 border-r border-border p-8 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
                <div className="font-mono text-[0.62rem] text-muted tracking-[0.2em] uppercase mb-8 pb-3 border-b border-border">
                    / filter_proposals
                </div>

                <div className="space-y-10">
                    <div>
                        <span className="block font-mono text-[0.6rem] text-primary tracking-[0.18em] uppercase mb-4">Status</span>
                        <div className="flex flex-col gap-1">
                            {["all", "live", "upcoming", "closed"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={cn(
                                        "relative text-left font-mono text-[0.68rem] py-2 px-4 tracking-wider transition-all",
                                        filter === s ? "text-primary bg-primary/5" : "text-muted hover:text-primary hover:bg-primary/5"
                                    )}
                                >
                                    {filter === s && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                                    {s.charAt(0).toUpperCase() + s.slice(1)} Proposals
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="block font-mono text-[0.6rem] text-primary tracking-[0.18em] uppercase mb-4">Category</span>
                        <div className="flex flex-col gap-1">
                            {["all", "event", "budget", "policy", "infra", "social"].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={cn(
                                        "relative text-left font-mono text-[0.68rem] py-2 px-4 tracking-wider transition-all",
                                        category === c ? "text-primary bg-primary/5" : "text-muted hover:text-primary hover:bg-primary/5"
                                    )}
                                >
                                    {category === c && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                    <button className="btn-accent w-full flex justify-center py-4">
                        Create Proposal
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <div className="font-mono text-[0.62rem] text-primary tracking-[0.25em] uppercase mb-2">
                            {proposals.length} Proposals Found
                        </div>
                        <h2 className="font-display text-5xl md:text-6xl tracking-wide uppercase">
                            ALL <span className="text-primary">PROPOSALS</span>
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-3 px-4 py-2 bg-panel border border-border flex-1 md:min-w-[300px]">
                            <span className="text-muted font-mono text-lg">⌕</span>
                            <input
                                type="text"
                                placeholder="search proposals..."
                                className="bg-transparent border-none outline-none font-mono text-[0.72rem] text-foreground w-full tracking-wider"
                            />
                        </div>
                    </div>
                </div>

                <div className="border border-border">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4 text-muted font-mono text-sm animate-pulse">
                            <span className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Fetching governance ledger...
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="p-20 text-center font-mono text-sm text-dim uppercase tracking-widest bg-panel/30">
                            No active proposals found in this zone.
                        </div>
                    ) : (
                        proposals.map((p, i) => {
                            const totalVotes = p.yesVotes + p.noVotes;
                            const yesPerc = totalVotes > 0 ? Math.round((p.yesVotes / totalVotes) * 100) : 0;
                            const noPerc = totalVotes > 0 ? Math.round((p.noVotes / totalVotes) * 100) : 0;

                            const uiProposal = {
                                id: p.id.toString(),
                                title: p.title,
                                description: p.ipfsCID,
                                category: "governance",
                                status: p.finalized ? (p.status === 'Approved' ? 'passed' : 'closed') : 'live',
                                votersCount: totalVotes,
                                votes: [
                                    { option: "Support", count: p.yesVotes, percentage: yesPerc, color: "var(--primary)" },
                                    { option: "Reject", count: p.noVotes, percentage: noPerc, color: "var(--danger)" },
                                ]
                            };

                            return <ProposalCard key={i} proposal={uiProposal as any} />;
                        })
                    )}
                </div>
            </main>
        </div>
    );
};
