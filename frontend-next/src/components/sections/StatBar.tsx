"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export const StatBar = () => {
    const { proposals } = useApp();

    const activeCount = proposals.filter(p => !p.finalized).length;
    const totalVotes = proposals.reduce((acc, p) => acc + Number(p.yesVotes) + Number(p.noVotes), 0);

    const STATS = [
        { label: "/ votes cast", value: totalVotes.toLocaleString() },
        { label: "/ active proposals", value: activeCount.toString() },
        { label: "/ proposals created", value: proposals.length.toString() },
        { label: "/ Quai TPS", value: "50k+" },
        { label: "/ tx fee", value: "<$0.01" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 border-y border-border bg-bg2">
            {STATS.map((stat, i) => (
                <div
                    key={i}
                    className="group relative p-8 border-r border-border last:border-r-0 overflow-hidden transition-colors hover:bg-primary/5"
                >
                    <div className="font-display text-4xl text-primary tracking-wider transition-transform group-hover:scale-110">
                        {stat.value}
                    </div>
                    <div className="font-mono text-[0.8rem] text-muted tracking-widest uppercase mt-2">
                        {stat.label}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100 origin-left" />
                </div>
            ))}
        </div>
    );
};
