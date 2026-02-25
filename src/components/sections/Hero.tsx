"use client";

import React from "react";
import { Terminal } from "./Terminal";

export const Hero = () => {
    return (
        <section className="hero relative min-h-screen flex flex-col md:grid md:grid-cols-2 items-center px-6 md:px-12 pt-24 pb-12 gap-12 overflow-hidden">
            {/* Background Grid - managed by CSS in globals.css for specific masking/gradient */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(180,245,0,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(180,245,0,.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,black_0%,transparent_100%)]" />
                <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 font-mono text-[0.68rem] text-primary tracking-[0.22em] uppercase mb-6">
                    <span className="w-7 h-[1px] bg-primary" />
                    Quai Network · EVM Compatible · Proof-of-Work
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>

                <h1 className="font-display text-[clamp(4.5rem,8vw,8rem)] leading-[0.9] tracking-wider mb-6">
                    <span className="block text-foreground">EVENT</span>
                    <span className="block text-primary glitch" data-text="HORIZON">HORIZON</span>
                    <span className="block text-transparent stroke-primary/30 stroke-1 [-webkit-text-stroke:1px_rgba(180,245,0,0.25)]">VOTING</span>
                </h1>

                <p className="font-ui text-lg text-muted max-w-md leading-relaxed mb-10 font-light tracking-wide">
                    The first <strong className="text-secondary font-semibold">decentralized proposal & voting platform</strong> for campus events — powered by Quai Network's scalable PoW blockchain.
                </p>

                <div className="flex flex-wrap gap-4">
                    <button className="btn-accent">
                        Browse Proposals
                    </button>
                    <button className="inline-flex items-center gap-2 px-8 py-3 font-mono text-[0.75rem] tracking-widest uppercase border border-secondary/30 text-secondary hover:bg-secondary/5 transition-colors">
                        + Create Proposal
                    </button>
                </div>
            </div>

            <div className="relative z-10 w-full">
                <Terminal />
            </div>
        </section>
    );
};
