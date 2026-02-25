"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Lock, Eye } from "lucide-react";

export const TrustSection = () => {
    const trustPoints = [
        { title: "Verifiable Voting", icon: CheckCircle2 },
        { title: "Transparent Results", icon: Eye },
        { title: "Decentralized Auth", icon: ShieldCheck },
        { title: "Tamper Proof", icon: Lock },
    ];

    return (
        <section className="py-32 px-6 overflow-hidden relative">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-full rounded-3xl p-16 border border-white/5 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-3xl text-center relative z-10"
                >
                    <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-12">Built On <span className="text-quai-blue">Principles.</span></h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                        {trustPoints.map((point, idx) => (
                            <motion.div
                                key={point.title}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-quai-blue">
                                    <point.icon size={20} />
                                </div>
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">{point.title}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Imagine technical trust badges here */}
                        <div className="font-display font-black text-2xl tracking-tighter uppercase whitespace-nowrap">Immutable Ledger</div>
                        <div className="font-display font-black text-2xl tracking-tighter uppercase whitespace-nowrap">Quai Secured</div>
                        <div className="font-display font-black text-2xl tracking-tighter uppercase whitespace-nowrap">Zero-Knowledge Proof</div>
                    </div>
                </motion.div>
            </div>

            {/* Atmospheric Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-quai-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        </section>
    );
};
