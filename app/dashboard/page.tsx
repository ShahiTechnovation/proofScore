'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';
import { ScoreRing } from '@/components/dashboard/ScoreRing';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { ScoreBreakdown } from '@/components/dashboard/ScoreBreakdown';
import { ActionCards, QuickActions } from '@/components/dashboard/ActionCards';
import { Navigation } from '@/components/landing/Navigation';
import { ScoringEngine } from '@/lib/sdk';
import type { WalletMetrics, CreditAssessment } from '@/types/sdk';

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState<WalletMetrics | null>(null);
    const [assessment, setAssessment] = useState<CreditAssessment | null>(null);

    // Mock data for demonstration
    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            const mockMetrics: WalletMetrics = {
                address: 'aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc',
                transactionCount: 127,
                walletAgeMonths: 18,
                defiScore: 72,
                repaymentRate: 94,
                tokenBalance: 15420,
                lastTransactionDate: Date.now() - 86400000 * 3, // 3 days ago
            };

            const mockAssessment = ScoringEngine.calculateScore(mockMetrics);

            setMetrics(mockMetrics);
            setAssessment(mockAssessment);
            setIsLoading(false);
        }, 1500);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-deep-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto" />
                    <div className="text-text-secondary">Loading your credit score...</div>
                </div>
            </div>
        );
    }

    if (!metrics || !assessment) {
        return (
            <div className="min-h-screen bg-deep-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-2xl font-bold text-pure-white">
                        No Score Found
                    </div>
                    <div className="text-text-secondary">
                        Generate your first credit score to view your dashboard
                    </div>
                    <Link href="/" className="btn-primary inline-block px-6 py-3 mt-4">
                        Generate Score
                    </Link>
                </div>
            </div>
        );
    }

    const mockTransactionId = 'at1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc';

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-deep-black">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="gradient-blur gradient-blur-cyan absolute -top-40 -right-40 opacity-10" />
                <div className="gradient-blur gradient-blur-purple absolute bottom-0 -left-40 opacity-10" />
            </div>
            <div className="absolute inset-0 grid-pattern opacity-20" />

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-text-secondary hover:text-neon-cyan transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-pure-white mb-2">
                                    Your Credit Dashboard
                                </h1>
                                <p className="text-text-secondary">
                                    Track your on-chain credit score and metrics
                                </p>
                            </div>

                            {/* Last Updated */}
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                <Clock className="w-4 h-4" />
                                <span>
                                    Updated{' '}
                                    {new Date(assessment.timestamp).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Score Ring Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-12"
                    >
                        <div className="glass-card p-12">
                            <div className="flex flex-col lg:flex-row items-center gap-12">
                                {/* Score Ring */}
                                <div className="flex-shrink-0">
                                    <ScoreRing
                                        score={assessment.finalScore}
                                        riskLevel={assessment.riskLevel}
                                        size="lg"
                                        animated={true}
                                    />
                                </div>

                                {/* Score Info */}
                                <div className="flex-1 space-y-6 text-center lg:text-left">
                                    <div>
                                        <h2 className="text-3xl font-bold text-pure-white mb-2">
                                            Excellent Credit Score!
                                        </h2>
                                        <p className="text-text-secondary text-lg">
                                            You're in the top{' '}
                                            <span className="text-neon-green font-semibold">
                                                {Math.round(
                                                    ((assessment.finalScore - 300) / 550) * 100
                                                )}
                                                %
                                            </span>{' '}
                                            of all Aleo users
                                        </p>
                                    </div>

                                    {/* Score Range */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-text-muted">Score Range</span>
                                            <span className="text-pure-white font-medium">
                                                300 - 850
                                            </span>
                                        </div>
                                        <div className="h-2 bg-charcoal rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-hot-pink via-neon-yellow via-neon-cyan to-neon-green rounded-full"
                                                style={{
                                                    width: `${((assessment.finalScore - 300) / 550) * 100
                                                        }%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-text-muted">
                                            <span>Poor</span>
                                            <span>Fair</span>
                                            <span>Good</span>
                                            <span>Excellent</span>
                                        </div>
                                    </div>

                                    {/* Transaction Link */}
                                    {mockTransactionId && (
                                        <a
                                            href={`https://explorer.aleo.org/transaction/${mockTransactionId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-green transition-colors text-sm"
                                        >
                                            <span>View on Aleo Explorer</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Metrics Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-bold text-pure-white mb-6">
                            Key Metrics
                        </h2>
                        <MetricsGrid metrics={metrics} />
                    </motion.div>

                    {/* Two Column Layout */}
                    <div className="grid lg:grid-cols-3 gap-8 mb-12">
                        {/* Score Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="lg:col-span-2"
                        >
                            <ScoreBreakdown assessment={assessment} />
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <QuickActions
                                address={metrics.address}
                                transactionId={mockTransactionId}
                                score={assessment.finalScore}
                            />
                        </motion.div>
                    </div>

                    {/* Action Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold text-pure-white mb-6">
                            Actions
                        </h2>
                        <ActionCards
                            transactionId={mockTransactionId}
                            onUpdateScore={() => console.log('Update score')}
                            onShareScore={() => console.log('Share score')}
                            onVerifyScore={() =>
                                window.open(
                                    `https://explorer.aleo.org/transaction/${mockTransactionId}`,
                                    '_blank'
                                )
                            }
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
