"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Users, Vote, Fingerprint, Building2 } from "lucide-react";

export const UseCaseSection = () => {
    const useCases = [
        {
            title: "DAO Governance",
            description: "Empower decentralized autonomous organizations with quadratic voting and customizable quorum requirements.",
            icon: Users,
        },
        {
            title: "Public Voting",
            description: "Host transparent city-wide or national elections with verifiable results that anyone can audit in real-time.",
            icon: Vote,
        },
        {
            title: "Digital Identity",
            description: "Secure, sybil-resistant voting tied to decentralized identity protocols on the Quai Network.",
            icon: Fingerprint,
        },
        {
            title: "Corporate Boards",
            description: "Streamline board resolutions and shareholder voting with legal-grade transparency and security.",
            icon: Building2,
        },
    ];

    return (
        <section className="py-32 px-6 bg-surface/20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="text-xs font-mono text-quai-blue uppercase tracking-[0.3em] mb-4 block">Ubiquitous Governance</span>
                    <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-8">For Every <span className="text-quai-blue">Decentralized</span> Need.</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {useCases.map((useCase, idx) => (
                        <motion.div
                            key={useCase.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="flex items-start gap-8 p-10 h-full">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-quai-blue shrink-0 group-hover:bg-quai-blue/20 transition-all duration-500">
                                    <useCase.icon size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{useCase.title}</h3>
                                    <p className="text-muted leading-relaxed">{useCase.description}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
