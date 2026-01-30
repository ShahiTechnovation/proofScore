'use client';

import { motion } from 'framer-motion';
import { Wallet, Search, Binary, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { Navigation } from '@/components/landing/Navigation';
import Link from 'next/link';

export default function HowItWorksPage() {
    const steps = [
        {
            id: "01",
            title: "Connect Your Wallet",
            description: "Securely connect your Aleo wallet (e.g., Puzzle Wallet). We never ask for your private keys.",
            icon: <Wallet className="w-6 h-6" />,
            color: "neon-cyan",
            details: "Authentication is handled through the standard wallet adapter interface. Your connection allows purely read-access to fetch public transaction history for analysis."
        },
        {
            id: "02",
            title: "Local Analysis",
            description: "Our algorithm fetches your on-chain activity and calculates metrics directly in your browser.",
            icon: <Search className="w-6 h-6" />,
            color: "neon-green",
            details: "We aggregate data points like transaction volume, wallet age, and DeFi interactions. This process happens entirely client-side to ensure no sensitive data leaks to our servers."
        },
        {
            id: "03",
            title: "Proof Generation",
            description: "A zero-knowledge proof is generated to attest that your score was calculated correctly according to the public algorithm.",
            icon: <Binary className="w-6 h-6" />,
            color: "electric-purple",
            details: "Using zPass and Aleo's proving system, we transform your raw metrics into a cryptographic succinct proof. This proof reveals the score but hides the underlying transactional history."
        },
        {
            id: "04",
            title: "On-Chain Verification",
            description: "The proof is submitted to the Aleo blockchain where it is verified and verified score is recorded.",
            icon: <CheckCircle className="w-6 h-6" />,
            color: "hot-pink",
            details: "Once verified, an immutable record of your credit score is stored on-chain. You can now use this transparent, verifiable score across other dApps and services."
        }
    ];

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-deep-black text-pure-white">
            <Navigation />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="gradient-blur gradient-blur-green absolute top-0 left-1/2 -translate-x-1/2 opacity-10" />
                <div className="absolute inset-0 grid-pattern opacity-20" />
            </div>

            <main className="relative pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            How <span className="gradient-text">ProofScore</span> Works
                        </h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                            From wallet connection to on-chain verification in four transparent steps.
                        </p>
                    </motion.div>

                    {/* Timeline */}
                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-8 md:left-1/2 top-10 bottom-10 w-0.5 bg-gradient-to-b from-neon-cyan via-electric-purple to-hot-pink opacity-30 md:-translate-x-1/2" />

                        <div className="space-y-12 md:space-y-24">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                                >
                                    {/* Icon Marker */}
                                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-void-black border-4 border-glass-border flex items-center justify-center z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                        <div className={`text-${step.color}`}>
                                            {step.icon}
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                                        <div className={`inline-block px-3 py-1 rounded-full bg-${step.color}/10 border border-${step.color}/20 text-${step.color} text-sm font-mono mb-4`}>
                                            Step {step.id}
                                        </div>
                                        <h3 className="text-3xl font-bold mb-3">{step.title}</h3>
                                        <p className="text-text-secondary text-lg mb-4">
                                            {step.description}
                                        </p>
                                        <div className="glass-card p-4 text-sm text-text-muted bg-glass-surface/30">
                                            {step.details}
                                        </div>
                                    </div>

                                    {/* Spacer for the other side */}
                                    <div className="hidden md:block md:w-1/2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Call to Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-32 text-center"
                    >
                        <div className="glass-card p-12 max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold mb-6">Ready to see your score?</h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/">
                                    <button className="btn-primary px-8 py-3 flex items-center gap-2">
                                        <Wallet className="w-5 h-5" />
                                        Connect Wallet & Start
                                    </button>
                                </Link>
                                <Link href="/docs">
                                    <button className="btn-outline px-8 py-3 flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5" />
                                        Read Documentation
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </main>

            <footer className="border-t border-glass-border py-8 text-center text-text-muted text-sm">
                <p>© 2026 ProofScore. All rights reserved.</p>
            </footer>
        </div>
    );
}
