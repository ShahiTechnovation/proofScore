'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/landing/Navigation';
import { ChevronRight } from 'lucide-react';

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState('getting-started');

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const menuItems = [
        { id: 'getting-started', label: 'Getting Started' },
        { id: 'installation', label: 'Installation' },
        { id: 'quick-start', label: 'Quick Start' },
        { id: 'core-concepts', label: 'Core Concepts' },
        { id: 'api-reference', label: 'API Reference' },
        { id: 'wallet-metrics', label: 'Wallet Metrics' },
    ];

    return (
        <div className="relative w-full min-h-screen bg-deep-black text-pure-white flex flex-col">
            <Navigation />

            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="gradient-blur gradient-blur-purple absolute top-20 right-0 opacity-10" />
                <div className="absolute inset-0 grid-pattern opacity-10" />
            </div>

            <div className="flex-1 flex pt-24 max-w-7xl mx-auto w-full px-6 gap-12">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:block w-64 fixed h-[calc(100vh-6rem)] top-24 overflow-y-auto pr-4 border-r border-glass-border">
                    <div className="space-y-1">
                        <h4 className="font-bold text-neon-cyan mb-4 px-2 uppercase tracking-wider text-sm">Documentation</h4>
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${activeSection === item.id
                                        ? 'bg-neon-cyan/10 text-neon-cyan font-medium'
                                        : 'text-text-secondary hover:text-pure-white hover:bg-glass-surface'
                                    }`}
                            >
                                {item.label}
                                {activeSection === item.id && <ChevronRight className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:pl-72 pb-20 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-pure-white prose-p:text-text-secondary prose-a:text-neon-cyan hover:prose-a:text-neon-green prose-pre:bg-glass-surface prose-pre:border prose-pre:border-glass-border prose-code:text-neon-cyan"
                    >
                        <section id="getting-started" className="mb-16 scroll-mt-32">
                            <h1 className="text-5xl mb-6">ProofScore SDK</h1>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                                    v1.0.0 Production Ready
                                </span>
                                <span className="text-text-muted text-sm">Last updated: Jan 30, 2026</span>
                            </div>
                            <p className="lead">
                                The ProofScore SDK enables developers to integrate privacy-first credit scoring into their Aleo applications.
                                Generate verifiable proofs of creditworthiness without exposing sensitive user transaction history.
                            </p>
                        </section>

                        <section id="installation" className="mb-16 scroll-mt-32">
                            <h2>Installation</h2>
                            <div className="not-prose bg-black border border-glass-border rounded-xl p-4 my-4 font-mono text-sm relative group">
                                <div className="flex items-center gap-2 text-text-secondary select-all">
                                    <span className="text-neon-cyan">$</span> npm install @proofscore/sdk
                                </div>
                            </div>
                            <p>Or use directly in your project via:</p>
                            <div className="not-prose bg-black border border-glass-border rounded-xl p-4 my-4 font-mono text-sm">
                                <span className="text-electric-purple">import</span> {'{'} CreditScoreSDK {'}'} <span className="text-electric-purple">from</span> <span className="text-green-400">'@/lib/sdk'</span>;
                            </div>
                        </section>

                        <section id="quick-start" className="mb-16 scroll-mt-32">
                            <h2>Quick Start</h2>
                            <p>Initialize the SDK and issue a credit score in just a few lines of code.</p>

                            <div className="not-prose bg-black border border-glass-border rounded-xl p-6 my-4 font-mono text-sm overflow-x-auto">
                                <pre className="text-sm">
                                    {`import { CreditScoreSDK } from '@/lib/sdk';

// 1. Initialize SDK
const sdk = new CreditScoreSDK({
  chainId: 'mainnet',
  rpcUrl: 'https://api.explorer.aleo.org/v1',
  contractAddress: 'credit_score.aleo',
});

// 2. Connect wallet
await sdk.init('aleo1...');

// 3. Issue credit (one-liner)
const result = await sdk.issueCreditFlow(privateKey);

console.log(\`Score: \${result.creditRecord?.score}\`);
console.log(\`TX: \${result.transactionId}\`);`}
                                </pre>
                            </div>
                        </section>

                        <section id="core-concepts" className="mb-16 scroll-mt-32">
                            <h2>Core Concepts</h2>
                            <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
                                <div className="glass-card p-6">
                                    <h3 className="text-xl font-bold mb-2 text-neon-cyan">Local Execution</h3>
                                    <p className="text-text-secondary text-sm">
                                        All score calculations happen client-side in the user's browser using WebAssembly.
                                        No transaction data is ever sent to a ProofScore server.
                                    </p>
                                </div>
                                <div className="glass-card p-6">
                                    <h3 className="text-xl font-bold mb-2 text-neon-cyan">Zero-Knowledge</h3>
                                    <p className="text-text-secondary text-sm">
                                        The SDK generates a ZK-SNARK proof (Groth16) that attests to the validity of the computed score without revealing the inputs (tx count, volume, etc.).
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section id="api-reference" className="mb-16 scroll-mt-32">
                            <h2>API Reference</h2>

                            <div className="space-y-12">
                                <div>
                                    <h3 className="font-mono text-xl text-pure-white mb-4">
                                        fetchWalletMetrics()
                                    </h3>
                                    <p className="mb-4">Fetch on-chain metrics for the connected wallet from the Aleo network.</p>
                                    <table className="w-full text-left border-collapse not-prose">
                                        <thead>
                                            <tr className="border-b border-glass-border">
                                                <th className="py-2 text-text-muted font-medium text-sm">Returns</th>
                                                <th className="py-2 text-text-muted font-medium text-sm">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-glass-border/30">
                                                <td className="py-3 font-mono text-neon-green text-sm">Promise&lt;WalletMetrics&gt;</td>
                                                <td className="py-3 text-text-secondary text-sm">Object containing raw wallet data</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h3 className="font-mono text-xl text-pure-white mb-4">
                                        calculateScore(metrics)
                                    </h3>
                                    <p className="mb-4">Applies the proprietary scoring algorithm to the raw metrics locally.</p>
                                    <div className="not-prose bg-black border border-glass-border rounded-lg p-4 font-mono text-xs text-text-secondary">
                                        Input: WalletMetrics<br />
                                        Output: CreditAssessment (includes finalScore, riskLevel)
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-mono text-xl text-pure-white mb-4">
                                        generateProof(assessment)
                                    </h3>
                                    <p className="mb-4">Creates a ZKProof object using the WASM prover.</p>
                                    <div className="not-prose bg-black border border-glass-border rounded-lg p-4 font-mono text-xs text-text-secondary">
                                        Input: CreditAssessment<br />
                                        Output: Promise&lt;ZKProof&gt;
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="wallet-metrics" className="mb-16 scroll-mt-32">
                            <h2>Wallet Metrics Interface</h2>
                            <div className="not-prose bg-black border border-glass-border rounded-xl p-6 font-mono text-sm leading-relaxed text-blue-200">
                                {`interface WalletMetrics {
  address: string;
  transactionCount: number;
  walletAgeMonths: number;
  defiScore: number;     // 0-100
  repaymentRate: number; // 0-100
  tokenBalance: number;
  lastTransactionDate: number; // Unix timestamp
}`}
                            </div>
                        </section>

                    </motion.div>
                </main>
            </div>

            <footer className="border-t border-glass-border py-8 text-center text-text-muted text-sm relative z-10 bg-deep-black">
                <p>© 2026 ProofScore. All rights reserved.</p>
            </footer>
        </div>
    );
}
