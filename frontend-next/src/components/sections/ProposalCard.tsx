"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

interface ProposalCardProps {
    proposal: {
        id: string;
        title: string;
        description: string;
        category: string;
        status: "live" | "upcoming" | "closed" | "passed";
        votes: { option: string; count: number; percentage: number; color: string }[];
        votersCount: number;
        timeLeft?: string;
    };
}

export const ProposalCard = ({ proposal }: ProposalCardProps) => {
    const { voteOnProposal, txPending } = useApp();

    const statusColors = {
        live: "text-primary border-primary/30 bg-primary/5 animate-pulse",
        upcoming: "text-secondary border-secondary/20 bg-secondary/5",
        closed: "text-muted border-border bg-black/20",
        passed: "text-accent border-accent/20 bg-accent/5",
    };

    const categoryStyles = {
        governance: "text-primary border-primary/30",
        event: "text-primary border-primary/30",
        budget: "text-accent border-accent/30",
        policy: "text-secondary border-secondary/30",
        infra: "text-purple-400 border-purple-400/30",
        social: "text-pink-400 border-pink-400/30",
    };

    const handleVote = async (support: boolean) => {
        await voteOnProposal(parseInt(proposal.id), support);
    };

    return (
        <div className="group relative bg-background p-6 md:p-8 flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-8 border-b border-border hover:bg-primary/5 transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform scale-y-0 transition-transform duration-300 group-hover:scale-y-100 origin-top" />

            <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={cn(
                        "font-mono text-[0.75rem] px-2 py-0.5 border uppercase tracking-wider",
                        categoryStyles[proposal.category as keyof typeof categoryStyles] || "text-muted border-border"
                    )}>
                        {proposal.category}
                    </span>
                    <span className={cn(
                        "font-mono text-[0.75rem] px-2 py-0.5 border uppercase tracking-wider",
                        statusColors[proposal.status]
                    )}>
                        {proposal.status === 'live' && '● '}
                        {proposal.status}
                    </span>
                </div>

                <h3 className="font-ui text-xl font-bold text-foreground tracking-wide mb-2">
                    {proposal.title}
                </h3>
                <p className="font-ui text-[1rem] text-muted font-light leading-relaxed mb-6 line-clamp-2">
                    {proposal.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 font-mono text-[0.8rem] text-muted tracking-widest uppercase">
                    <div className="flex items-center gap-2">
                        <span className="text-secondary opacity-60">ID #</span>
                        {proposal.id}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-secondary opacity-60">VOTERS:</span>
                        {proposal.votersCount}
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-between items-end gap-6 min-w-[240px]">
                <div className="w-full space-y-3">
                    {proposal.votes.map((vote, i) => (
                        <div key={i} className="w-full">
                            <div className="flex justify-between font-mono text-[0.8rem] text-muted mb-1 uppercase">
                                <span>{vote.option}</span>
                                <span className="text-primary">{vote.percentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-dim overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full bg-gradient-to-r transition-all duration-1000 ease-out",
                                        vote.option === "Support" ? "from-primary to-primary/60" : "from-danger to-danger/60"
                                    )}
                                    style={{ width: `${vote.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {proposal.status === "live" && (
                    <div className="flex gap-2 w-full lg:w-auto">
                        <Link
                            href={`/proposals/${proposal.id}`}
                            className="flex-1 lg:w-auto font-mono text-[0.85rem] px-4 py-2 bg-panel border border-primary/20 text-muted hover:text-primary transition-all uppercase tracking-widest flex items-center justify-center"
                        >
                            View Details
                        </Link>
                        <button
                            onClick={() => handleVote(true)}
                            disabled={txPending}
                            className="flex-1 lg:w-auto font-mono text-[0.85rem] px-4 py-2 bg-transparent border border-primary text-primary hover:bg-primary hover:text-background transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            Support
                        </button>
                        <button
                            onClick={() => handleVote(false)}
                            disabled={txPending}
                            className="flex-1 lg:w-auto font-mono text-[0.85rem] px-4 py-2 bg-transparent border border-danger text-danger hover:bg-danger hover:text-background transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            Against
                        </button>
                    </div>
                )}
                {proposal.status !== "live" && (
                    <Link
                        href={`/proposals/${proposal.id}`}
                        className="w-full lg:w-auto font-mono text-[0.85rem] px-6 py-2 bg-panel border border-primary/20 text-muted hover:text-primary transition-all uppercase tracking-widest flex items-center justify-center text-center"
                    >
                        View Details & Results
                    </Link>
                )}
                {proposal.status === "passed" && (
                    <div className="font-mono text-[0.8rem] text-accent uppercase tracking-widest border border-accent/20 px-3 py-1 bg-accent/5">
                        Consensus Reached
                    </div>
                )}
            </div>
        </div>
    );
};
