"use client";

import React from "react";

const STEPS = [
    { id: "01", icon: "🔐", title: "Connect Wallet", desc: "Link your Quai wallet. No sign-up, no KYC — your wallet is your identity on-chain." },
    { id: "02", icon: "📝", title: "Create Proposal", desc: "Define an event or initiative. Set options, voting period, quorum, and deploy as a smart contract." },
    { id: "03", icon: "🗳️", title: "Community Votes", desc: "Verified wallet holders vote on proposals. One wallet = one vote. Fully Sybil-resistant." },
    { id: "04", icon: "⛏️", title: "PoW Confirmed", desc: "Votes are finalized via Quai's Proof-of-Work. Immutable, censorship-resistant, verifiable." },
    { id: "05", icon: "🏆", title: "Results On-Chain", desc: "Outcomes are public and auditable forever via Quaiscan. Zero trust required." },
];

export const HowItWorks = () => {
    return (
        <section className="py-20 px-6 md:px-12 bg-background border-t border-border" id="how-it-works">
            <div className="font-mono text-[0.62rem] text-primary tracking-[0.25em] uppercase mb-3">Protocol Flow</div>
            <h2 className="font-display text-5xl md:text-7xl tracking-wide uppercase mb-16">
                HOW EVENT <span className="text-primary">HORIZON</span> <br /> WORKS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 border border-border">
                {STEPS.map((step, i) => (
                    <div
                        key={i}
                        className="group relative p-8 border-b md:border-b-0 md:border-r border-border last:border-0 overflow-hidden transition-colors hover:bg-primary/5"
                    >
                        <span className="font-display text-7xl text-primary/10 absolute top-2 right-4 leading-none transition-transform group-hover:scale-110">
                            {step.id}
                        </span>
                        <div className="w-10 h-10 border border-dim flex items-center justify-center text-xl mb-6 relative z-10 before:content-[''] before:absolute before:-top-1 before:-right-1 before:w-2 before:h-2 before:bg-primary">
                            {step.icon}
                        </div>
                        <div className="font-ui text-lg font-bold tracking-wide mb-3 relative z-10">{step.title}</div>
                        <p className="font-ui text-[0.85rem] text-muted leading-relaxed font-light relative z-10">{step.desc}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100 origin-left" />
                    </div>
                ))}
            </div>
        </section>
    );
};
