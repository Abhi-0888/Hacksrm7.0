"use client";

import React, { useEffect, useState } from "react";

const INITIAL_FEED = [
    { event: "Proposal #186 Created", voter: "0x7a...d24", choice: "QUAI-CYP-1", time: "2m ago" },
    { event: "Vote Cast on #184", voter: "0x12...f8a", choice: "YES", time: "5m ago" },
    { event: "Proposal #182 Finalized", voter: "System", choice: "PASSED", time: "12m ago" },
    { event: "Vote Cast on #185", voter: "0xec...312", choice: "OPTION B", time: "18m ago" },
];

export const LiveFeed = () => {
    return (
        <section className="py-20 px-6 md:px-12 bg-bg2 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <div className="font-mono text-[0.62rem] text-primary tracking-[0.25em] uppercase mb-3 flex items-center gap-3">
                        On-Chain Activity
                        <span className="w-20 h-[1px] bg-dim" />
                    </div>
                    <h2 className="font-display text-5xl md:text-7xl tracking-wide uppercase">
                        LIVE <span className="text-primary">FEED</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3 font-mono text-[0.62rem] text-primary tracking-widest uppercase mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--accent)]" />
                    BROADCASTING
                </div>
            </div>

            <div className="border border-border">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] p-4 bg-black/30 border-b border-border font-mono text-[0.58rem] text-muted tracking-widest uppercase">
                    <span>PROPOSAL</span>
                    <span>VOTER</span>
                    <span>CHOICE</span>
                    <span className="text-right">TIME</span>
                </div>
                <div className="divide-y divide-border">
                    {INITIAL_FEED.map((row, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-[2fr_1fr_1fr_1fr] p-5 font-mono text-[0.65rem] hover:bg-primary/5 transition-colors"
                        >
                            <span className="text-foreground">{row.event}</span>
                            <span className="text-muted">{row.voter}</span>
                            <span className="text-secondary">{row.choice}</span>
                            <span className="text-muted text-right">{row.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
