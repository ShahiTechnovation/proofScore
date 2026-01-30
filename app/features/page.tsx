'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Code, Activity, Globe, Cpu } from 'lucide-react';
import { Navigation } from '@/components/landing/Navigation';

export default function FeaturesPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-deep-black text-pure-white">
            <Navigation />

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="gradient-blur gradient-blur-cyan absolute -top-40 -right-40 opacity-10" />
                <div className="gradient-blur gradient-blur-purple absolute bottom-0 left-0 opacity-10" />
                <div className="absolute inset-0 grid-pattern opacity-20" />
            </div>

            <main className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="gradient-text">Platform Features</span>
                        </h1>
                        <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                            ProofScore combines advanced zero-knowledge cryptography with real-world financial metrics
                            to deliver a privacy-first credit scoring infrastructure.
                        </p>
                    </motion.div>

                    {/* Core Features Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32"
                    >
                        {[
                            {
                                icon: <Lock className="w-8 h-8 text-neon-cyan" />,
                                title: "Zero-Knowledge Privacy",
                                description: "Your financial history never leaves your device. ProofScore generates a cryptographic proof of your creditworthiness locally.",
                                color: "neon-cyan"
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-neon-green" />,
                                title: "Verifiable Identity",
                                description: "Scores are cryptographically verifiable on the Aleo blockchain, ensuring no one can forge or tamper with the results.",
                                color: "neon-green"
                            },
                            {
                                icon: <Globe className="w-8 h-8 text-electric-purple" />,
                                title: "Universal Portability",
                                description: "Carry your credit score across the decentralized web. Use it for undercollateralized loans, governance, and more.",
                                color: "electric-purple"
                            },
                            {
                                icon: <Zap className="w-8 h-8 text-hot-pink" />,
                                title: "Instant Calculation",
                                description: "Optimized WASM-based scoring engine calculates your score and generates proofs in seconds directly in your browser.",
                                color: "hot-pink"
                            },
                            // {
                            //   icon: <Database className="w-8 h-8 text-neon-cyan" />,
                            //   title: "Multi-Chain Aggregation",
                            //   description: "Aggregates data from multiple sources to build a comprehensive financial profile (Coming Soon).",
                            //   color: "neon-cyan"
                            // },
                            {
                                icon: <Code className="w-8 h-8 text-neon-green" />,
                                title: "Developer SDK",
                                description: "Easily integrate ProofScore into your dApp with our comprehensive TypeScript SDK and API documentation.",
                                color: "neon-green"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="glass-card p-8 group hover:bg-glass-surface/80 transition-all duration-300"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-${feature.color}/10 border border-${feature.color}/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Technical Deep Dive Section */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl font-bold mb-6">
                                Scoring You Can <span className="text-neon-cyan">Trust</span>
                            </h2>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <Activity className="w-6 h-6 text-neon-green" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Transparent Metrics</h4>
                                        <p className="text-text-secondary">
                                            Our scoring algorithm is open-source. Factors include wallet age, transaction volume, DeFi participation, and repayment history.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <Cpu className="w-6 h-6 text-electric-purple" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Client-Side Processing</h4>
                                        <p className="text-text-secondary">
                                            All calculations happen in your browser via WebAssembly. No sensitive data is ever sent to a centralized server.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="w-6 h-6 rounded-full border-2 border-hot-pink flex items-center justify-center text-xs text-hot-pink font-bold">ZK</div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Groth16 Proofs</h4>
                                        <p className="text-text-secondary">
                                            We utilize industry-standard Groth16 proofs on the Aleo blockchain for maximum security and efficiency.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="glass-card p-1 border border-neon-cyan/20">
                                <div className="bg-void-black/80 rounded-xl p-6 font-mono text-sm leading-relaxed overflow-hidden">
                                    <div className="flex items-center gap-2 mb-4 border-b border-glass-border pb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="ml-2 text-text-muted">scoring_engine.aleo</span>
                                    </div>
                                    <div className="text-text-secondary">
                                        <span className="text-electric-purple">struct</span> <span className="text-neon-cyan">ScoreProof</span> {'{'}
                                        <br />
                                        &nbsp;&nbsp;<span className="text-neon-green">owner</span>: address,
                                        <br />
                                        &nbsp;&nbsp;<span className="text-neon-green">score</span>: u64,
                                        <br />
                                        &nbsp;&nbsp;<span className="text-neon-green">timestamp</span>: u64,
                                        <br />
                                        &nbsp;&nbsp;<span className="text-neon-green">zk_proof</span>: field
                                        <br />
                                        {'}'}
                                        <br /><br />
                                        <span className="text-electric-purple">transition</span> <span className="text-hot-pink">verify_score</span>(...) {'{'}
                                        <br />
                                        &nbsp;&nbsp;<span className="text-text-muted">// Zero-knowledge verification logic</span>
                                        <br />
                                        &nbsp;&nbsp;<span className="text-electric-purple">return</span> hash(inputs);
                                        <br />
                                        {'}'}
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -z-10 top-10 -right-10 w-full h-full border border-dashed border-text-muted/20 rounded-3xl" />
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Footer Reuse - minimal version or full reuse if I had it as a component, 
          but for now I'll just add a copyright line or quick links to match the main page style roughly 
          or better yet, keep it consistent. Since I can't import the Footer component from page.tsx (it's inline), 
          I will just replicate a simple footer.
       */}
            <footer className="border-t border-glass-border py-8 text-center text-text-muted text-sm">
                <p>© 2026 ProofScore. All rights reserved.</p>
            </footer>
        </div>
    );
}
