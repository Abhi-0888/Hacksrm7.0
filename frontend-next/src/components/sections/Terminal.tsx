"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

type BootLine = {
    type: "pr" | "ou" | "ok" | "co";
    text: string | ((count: number) => string);
};

const BOOT_LINES: BootLine[] = [
    { type: "pr", text: "eventhorizon@quai:~$ boot --network quai-mainnet" },
    { type: "ou", text: "Connecting to Quai Cyprus-1..." },
    { type: "ok", text: "[OK] Peer connection established." },
    { type: "ou", text: "Checking latest block height..." },
    { type: "ok", text: "[OK] Sync complete at block #2,185,912" },
    { type: "pr", text: "eventhorizon@quai:~$ loading governance_module --v1.2" },
    { type: "co", text: "> Parsing smart contracts..." },
    { type: "co", text: (count: number) => `> Resolving ${count} active proposals...` },
    { type: "ok", text: "Event Horizon ready." },
    { type: "pr", text: "eventhorizon@quai:~$ _" },
];

export const Terminal = () => {
    const { proposals } = useApp();
    const [visibleLines, setVisibleLines] = useState<number>(0);

    useEffect(() => {
        if (visibleLines < BOOT_LINES.length) {
            const timer = setTimeout(() => {
                setVisibleLines((prev) => prev + 1);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [visibleLines]);

    return (
        <div className="terminal bg-panel border-t-2 border-primary border-border relative overflow-hidden shadow-2xl">
            <div className="term-bar flex items-center gap-2 px-4 py-2 border-b border-border bg-black/30">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-mono text-[0.6rem] text-muted ml-2 tracking-widest uppercase">
                    eventhorizon_node — quai-mainnet — bash
                </span>
            </div>
            <div className="term-body p-6 font-mono text-[0.75rem] leading-relaxed min-h-[300px]">
                {BOOT_LINES.slice(0, visibleLines).map((line, i) => {
                    const textContent = typeof line.text === 'function'
                        ? line.text(proposals.length)
                        : line.text;

                    return (
                        <div
                            key={i}
                            className={i === visibleLines - 1 ? "animate-tli" : ""}
                            style={{
                                color:
                                    line.type === "pr" ? "var(--accent)" :
                                        line.type === "co" ? "var(--accent2)" :
                                            line.type === "ok" ? "var(--accent)" : "var(--muted)",
                                paddingLeft: line.type !== "pr" ? "1rem" : "0"
                            }}
                        >
                            {textContent === "_" ? (
                                <span>
                                    eventhorizon@quai:~$ <span className="inline-block w-2 h-3.5 bg-primary animate-pulse align-middle" />
                                </span>
                            ) : (
                                textContent
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
