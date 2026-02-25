"use client";

import React from "react";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="bg-bg2 border-t border-border p-8 md:p-12 lg:p-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div>
                    <span className="font-display text-3xl tracking-widest uppercase block mb-4">
                        EVENT<em className="text-primary not-italic">HORIZON</em>
                    </span>
                    <p className="font-ui text-[0.83rem] text-muted font-light leading-relaxed max-w-xs">
                        Decentralized proposal & voting for campus communities. Built on Quai Network.
                    </p>
                </div>

                <div>
                    <div className="font-mono text-[0.6rem] text-primary tracking-[0.2em] uppercase mb-6">/ Platform</div>
                    <ul className="flex flex-col gap-3">
                        <li><Link href="/proposals" className="font-ui text-[0.82rem] text-muted hover:text-primary transition-colors font-light">Browse Proposals</Link></li>
                        <li><Link href="/create" className="font-ui text-[0.82rem] text-muted hover:text-primary transition-colors font-light">Create Proposal</Link></li>
                        <li><Link href="/?feed=true" className="font-ui text-[0.82rem] text-muted hover:text-primary transition-colors font-light">Live Feed</Link></li>
                    </ul>
                </div>

                <div>
                    <div className="font-mono text-[0.6rem] text-primary tracking-[0.2em] uppercase mb-6">/ Quai Network</div>
                    <ul className="flex flex-col gap-3 text-[0.82rem] text-muted font-light">
                        <li><a href="https://qu.ai" target="_blank" className="hover:text-primary">qu.ai</a></li>
                        <li><a href="https://quaiscan.io" target="_blank" className="hover:text-primary">Block Explorer</a></li>
                        <li><a href="https://faucet.quai.network" target="_blank" className="hover:text-primary">Faucet</a></li>
                        <li><a href="https://qu.ai/docs" target="_blank" className="hover:text-primary">Docs</a></li>
                    </ul>
                </div>

                <div>
                    <div className="font-mono text-[0.6rem] text-primary tracking-[0.2em] uppercase mb-6">/ Protocol Info</div>
                    <div className="p-4 border border-border bg-black/20 font-mono text-[0.6rem] text-muted leading-relaxed">
                        DECENTRALIZED V1.0<br />
                        CYPRUS-1 ZONE<br />
                        BLOCK FINALITY: 2S<br />
                        COST PER VOTE: <span className="text-primary">{"<$0.01"}</span>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 font-mono text-[0.58rem] text-muted tracking-widest">
                <span>© 2026 EVENT HORIZON · BUILT ON QUAI NETWORK</span>
                <div className="flex gap-6">
                    <span>PRIVACY POLICY</span>
                    <span>TERMS OF USE</span>
                    <span>DISCLAIMERS</span>
                </div>
            </div>
        </footer>
    );
};
