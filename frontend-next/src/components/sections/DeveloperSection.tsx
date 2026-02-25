"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Terminal } from "lucide-react";

export const DeveloperSection = () => {
    const codeSnippet = `// Integrate VeriBallot into your DAO
import { VeriBallot } from "@veriballot/sdk";

const dao = new VeriBallot({
  network: "quai-orchard",
  governanceType: "quadratic"
});

await dao.propose({
  title: "Upgrade Protocol v2.1",
  duration: 86400 * 7
});`;

    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-xs font-mono text-quai-blue uppercase tracking-[0.3em] mb-4 block">Dev First Architecture</span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 uppercase tracking-tighter">Built For <br /><span className="text-quai-blue">The Builders.</span></h2>
                    <p className="text-muted text-lg mb-8 leading-relaxed">
                        Integrate transparent voting directly into your decentralized applications with our robust SDK and open-source infrastructure.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button glow>Start Building</Button>
                        <Button variant="secondary">API Specs</Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative group"
                >
                    {/* Code Window */}
                    <div className="rounded-2xl bg-[#0a0a0c] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="text-[10px] font-mono text-muted flex items-center gap-2">
                                <Terminal size={12} />
                                governance-service.ts
                            </div>
                        </div>
                        <div className="p-8 font-mono text-sm leading-relaxed text-blue-100/80 overflow-x-auto">
                            <pre><code>{codeSnippet}</code></pre>
                        </div>
                    </div>

                    {/* Decorative Glow */}
                    <div className="absolute -inset-4 bg-quai-blue/10 blur-3xl -z-10 group-hover:bg-quai-blue/15 transition-all duration-700" />
                </motion.div>
            </div>
        </section>
    );
};
