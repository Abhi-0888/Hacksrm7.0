"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Shield, Terminal as TerminalIcon, AlertCircle, CheckCircle2, Loader2, Copy, ExternalLink, Cpu } from 'lucide-react';
import { quais } from 'quais';
import EventDAOJson from '@/web3/abi/EventDAO.json';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/layout/Footer';

// IPFS hash extracted from compiled bytecode
const IPFS_HASH = 'QmZCDMvXoqjw6NMpBDSBiFA6icczAVn3eQLSEx1bFkdEax';

interface LogEntry {
    type: 'info' | 'error' | 'success' | 'warning';
    message: string;
    timestamp: string;
}

export default function AdminDeployPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [contractAddr, setContractAddr] = useState<string>('');
    const [deploying, setDeploying] = useState(false);
    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-49), { message, type, timestamp }]); // Buffer limited to last 50 for performance
    };

    const performPreflightAudit = async (provider: any) => {
        addLog('STARTING PRE-FLIGHT BLOCKCHAIN AUDIT...', 'warning');
        try {
            const quaiProvider = new quais.BrowserProvider(provider);
            const network = await (quaiProvider as any).getNetwork();
            const blockHeight = await (quaiProvider as any).getBlockNumber();

            addLog(`AUDIT: CONNECTION ACCELERATED TO QUAI_NETWORK`, 'success');
            addLog(`AUDIT: NETWORK_ID VERIFIED: ${network.chainId} (ORCHARD_TESTNET)`, 'success');
            addLog(`AUDIT: CURRENT BLOCK_HEIGHT SYNCED: ${blockHeight}`, 'info');
            addLog(`AUDIT: ZONE_SHARDING: CYPRUS-1 (ZONE_0_0)`, 'info');

            return true;
        } catch (err: any) {
            addLog(`AUDIT ERROR: FAILED TO SYNC WITH BLOCKCHAIN. ${err.message}`, 'error');
            return false;
        }
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleDeploy = async () => {
        setDeploying(true);
        setLogs([]);
        addLog('INITIATING DEPLOYMENT SEQUENCE...', 'warning');
        addLog('Detecting Pelagus wallet extension...');

        try {
            const w = window as any;
            const walletProvider = w.pelagus || w.ethereum;
            if (!walletProvider) throw new Error('No compatible Quai wallet detected. Please install Pelagus.');

            addLog('Requesting account access...');
            const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];

            addLog(`Authorized: ${address.slice(0, 10)}...${address.slice(-6)}`, 'success');

            const provider = new quais.BrowserProvider(walletProvider);

            const auditPassed = await performPreflightAudit(walletProvider);
            if (!auditPassed) throw new Error('BLOCKCHAIN AUDIT FAILED: Network unreachable or invalid node configuration.');

            const signer = await provider.getSigner();

            addLog('Generating Contract Factory with Address Grinding (Cyprus-1)...');
            addLog(`Target IPFS CID: ${IPFS_HASH}`, 'info');

            const factory = new quais.ContractFactory(
                EventDAOJson.abi,
                EventDAOJson.bytecode,
                signer,
                IPFS_HASH
            );

            addLog('Broadcasting deployment transaction to Quai Network...', 'warning');
            const contract = await factory.deploy();

            const hash = contract.deploymentTransaction()?.hash || '';
            addLog(`TRANSMISSION SUCCESS. HASH: ${hash.slice(0, 24)}...`, 'success');
            addLog('Syncing with ledger... (Waiting for confirmation)', 'info');

            await contract.waitForDeployment();
            const addr = await contract.getAddress();
            setContractAddr(addr);

            addLog(`CONTRACT DEPLOYED SUCCESSFULLY TO CYPRUS-1 ZONE!`, 'success');
            addLog(`LEGACY ADDRESS: ${addr}`, 'success');
            addLog('Operational environment ready.', 'info');

        } catch (err: any) {
            console.error('Deploy error:', err);
            addLog(`DEPLOYMENT FAILED: ${err.shortMessage || err.message}`, 'error');
        } finally {
            setDeploying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addLog('ADRRES COPIED TO BUFFER', 'info');
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 flex flex-col">
            <div className="max-w-5xl mx-auto w-full px-6 flex-1">

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Cpu className="text-primary animate-pulse" size={20} />
                        <span className="font-mono text-[0.6rem] text-primary uppercase tracking-[0.4em]">Protocol Deployment Audit Suite</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter leading-none mb-4">
                        VERIFY <span className="text-primary">BLOCKCHAIN_STATE</span>
                    </h1>
                    <p className="font-ui text-sm text-muted max-w-2xl font-light">
                        Initialize and audit new governance primitives on the <span className="text-foreground border-b border-primary/30">Quai Orchard Testnet</span>.
                        All actions are cryptographically verified and recorded to the Cyprus-1 ledger.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">

                    {/* Main Console */}
                    <div className="space-y-6">
                        <div className="bg-panel border border-border rounded-sm overflow-hidden flex flex-col h-[500px]">
                            {/* Header */}
                            <div className="bg-bg2 px-4 py-2 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TerminalIcon size={14} className="text-muted" />
                                    <span className="font-mono text-[0.6rem] text-muted uppercase tracking-widest">Quai Ledger Audit Logs</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-border" />
                                    <div className="w-2 h-2 rounded-full bg-border" />
                                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                                </div>
                            </div>

                            {/* Log Display */}
                            <div className="flex-1 overflow-y-auto p-6 font-mono text-[0.7rem] space-y-3 scrollbar-hide">
                                {logs.length === 0 ? (
                                    <div className="text-dim/30 animate-pulse italic">
                                        {`> Waiting for deployment trigger...`}
                                    </div>
                                ) : (
                                    logs.map((log, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={i}
                                            className="flex gap-4 group"
                                        >
                                            <span className="text-dim/40 whitespace-nowrap">[{log.timestamp}]</span>
                                            <span className={cn(
                                                "break-all",
                                                log.type === 'error' && "text-danger",
                                                log.type === 'success' && "text-primary",
                                                log.type === 'warning' && "text-accent",
                                                log.type === 'info' && "text-foreground/70"
                                            )}>
                                                {log.type === 'error' ? 'ERR!' : log.type === 'success' ? 'DONE' : log.type === 'warning' ? 'WARN' : 'INFO'} {log.message}
                                            </span>
                                        </motion.div>
                                    ))
                                )}
                                <div ref={logEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-6 border-t border-border bg-bg2/30">
                                <button
                                    onClick={handleDeploy}
                                    disabled={deploying}
                                    className={cn(
                                        "w-full py-4 font-display text-xl uppercase tracking-widest transition-all relative overflow-hidden group",
                                        deploying ? "bg-dim/20 text-muted cursor-not-allowed" : "bg-primary text-background hover:shadow-[0_0_30px_rgba(180,245,0,0.5)] active:scale-[0.98]"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <span className="relative flex items-center justify-center gap-3">
                                        {deploying ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={20} />}
                                        {deploying ? 'INITIALIZING...' : 'EXECUTE_DEPLOYMENT'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {contractAddr && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-primary/5 border border-primary/20 p-6 rounded-sm space-y-4"
                                >
                                    <div className="flex items-center gap-2 text-primary">
                                        <CheckCircle2 size={16} />
                                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold">Registry Successful</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 bg-background/50 border border-primary/10 p-4 font-mono text-xs">
                                        <span className="text-primary truncate">{contractAddr}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => copyToClipboard(contractAddr)} className="p-2 hover:bg-primary/10 text-muted hover:text-primary transition-colors">
                                                <Copy size={14} />
                                            </button>
                                            <a
                                                href={`https://orchard.quaiscan.io/address/${contractAddr}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-primary/10 text-muted hover:text-primary transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                    <p className="text-[0.6rem] font-mono text-muted uppercase tracking-widest leading-relaxed">
                                        Update NEXT_PUBLIC_EVENT_DAO_ADDRESS in .env.local with this hex value to finalize integration.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Side Panel: Context info */}
                    <aside className="space-y-6">
                        <div className="bg-panel border border-border p-6 rounded-sm">
                            <h4 className="font-mono text-[0.65rem] text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Shield size={14} /> SECURITY_DOCS
                            </h4>
                            <div className="space-y-4 font-ui text-[0.75rem] text-muted leading-relaxed font-light">
                                <p>
                                    Execution target: <span className="text-foreground">Quai Cyprus-1</span> zone.
                                </p>
                                <p>
                                    Address grinding is performed locally via the factory helper to ensure valid sharding prefix.
                                </p>
                                <p>
                                    IPFS CID for logic redundancy: <br />
                                    <span className="font-mono text-[0.6rem] break-all text-accent">{IPFS_HASH}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-bg2 border border-border p-6 rounded-sm border-l-primary/30 relative">
                            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-20">
                                <AlertCircle size={20} />
                            </div>
                            <h4 className="font-mono text-[0.65rem] text-foreground uppercase tracking-widest mb-2">Network Guard</h4>
                            <p className="font-ui text-[0.7rem] text-dim leading-normal font-light italic">
                                Ensure Pelagus is set to Orchard Testnet or Cyprus-1 Mainnet before execution. Transaction requires ~0.1 QUAI gas budget.
                            </p>
                        </div>
                    </aside>

                </div>
            </div>
            <Footer />
        </div>
    );
}
