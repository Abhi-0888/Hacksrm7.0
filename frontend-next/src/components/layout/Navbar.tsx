"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWeb3 } from "@/providers/Web3Provider";

export const Navbar = () => {
    const pathname = usePathname();
    const { account, connect, disconnect, isConnected } = useWeb3();

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Proposals", href: "/proposals" },
        { name: "Create Proposal", href: "/create" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-6 md:px-12 py-4 border-b border-primary/10 bg-background/90 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-primary/40 group-hover:border-primary transition-colors">
                    <Image
                        src="/logo.jpeg"
                        alt="Event Horizon"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <span className="font-display text-2xl tracking-widest uppercase">
                    EVENT<em className="text-primary not-italic">HORIZON</em>
                </span>
            </Link>

            <ul className="hidden md:flex items-center gap-8 list-none">
                {navLinks.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            className={cn(
                                "font-mono text-[0.7rem] uppercase tracking-widest transition-colors before:content-['/_']",
                                pathname === link.href ? "text-primary" : "text-muted hover:text-primary"
                            )}
                        >
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-primary/20 bg-primary/5 font-mono text-[0.6rem] tracking-wider text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-fast" />
                    QUAI MAINNET
                </div>

                <button
                    onClick={isConnected ? disconnect : connect}
                    className={cn(
                        "font-mono text-[0.7rem] px-5 py-2 uppercase tracking-widest transition-all",
                        isConnected
                            ? "bg-primary text-background border border-primary"
                            : "border border-primary text-primary hover:bg-primary hover:text-background"
                    )}
                >
                    {isConnected ? (
                        <span className="flex items-center gap-2">
                            {account?.slice(0, 6)}...{account?.slice(-4)}
                        </span>
                    ) : (
                        "Connect Wallet"
                    )}
                </button>
            </div>
        </nav>
    );
};
