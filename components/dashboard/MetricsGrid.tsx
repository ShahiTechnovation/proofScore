'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Calendar,
    TrendingUp,
    Wallet,
    ArrowUp,
    ArrowDown,
    Minus,
} from 'lucide-react';
import type { WalletMetrics } from '@/types/sdk';

interface MetricsGridProps {
    metrics: WalletMetrics;
    previousMetrics?: WalletMetrics;
}

export function MetricsGrid({ metrics, previousMetrics }: MetricsGridProps) {
    // Calculate trends
    const getTrend = (current: number, previous?: number) => {
        if (!previous) return 'neutral';
        if (current > previous) return 'up';
        if (current < previous) return 'down';
        return 'neutral';
    };

    const getTrendPercentage = (current: number, previous?: number) => {
        if (!previous || previous === 0) return null;
        const change = ((current - previous) / previous) * 100;
        return Math.abs(change).toFixed(1);
    };

    const metricCards = [
        {
            label: 'Total Transactions',
            value: metrics.transactionCount.toLocaleString(),
            icon: Activity,
            color: 'neon-cyan',
            trend: getTrend(
                metrics.transactionCount,
                previousMetrics?.transactionCount
            ),
            trendValue: getTrendPercentage(
                metrics.transactionCount,
                previousMetrics?.transactionCount
            ),
        },
        {
            label: 'Wallet Age',
            value: `${metrics.walletAgeMonths} months`,
            icon: Calendar,
            color: 'neon-green',
            trend: getTrend(metrics.walletAgeMonths, previousMetrics?.walletAgeMonths),
            trendValue: getTrendPercentage(
                metrics.walletAgeMonths,
                previousMetrics?.walletAgeMonths
            ),
        },
        {
            label: 'DeFi Activity',
            value: `${metrics.defiScore}/100`,
            icon: TrendingUp,
            color: 'electric-purple',
            trend: getTrend(metrics.defiScore, previousMetrics?.defiScore),
            trendValue: getTrendPercentage(
                metrics.defiScore,
                previousMetrics?.defiScore
            ),
        },
        {
            label: 'Repayment Rate',
            value: `${metrics.repaymentRate}%`,
            icon: Wallet,
            color: 'neon-yellow',
            trend: getTrend(metrics.repaymentRate, previousMetrics?.repaymentRate),
            trendValue: getTrendPercentage(
                metrics.repaymentRate,
                previousMetrics?.repaymentRate
            ),
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((card, index) => {
                const Icon = card.icon;
                const TrendIcon =
                    card.trend === 'up'
                        ? ArrowUp
                        : card.trend === 'down'
                            ? ArrowDown
                            : Minus;

                return (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="glass-card p-6 group hover:scale-[1.02] transition-transform"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                bg-${card.color}/10 border border-${card.color}/30
                group-hover:scale-110 transition-transform
              `}
                            >
                                <Icon className={`w-6 h-6 text-${card.color}`} />
                            </div>

                            {/* Trend Indicator */}
                            {card.trendValue && (
                                <div
                                    className={`
                  flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${card.trend === 'up' ? 'bg-neon-green/10 text-neon-green' : ''}
                  ${card.trend === 'down' ? 'bg-hot-pink/10 text-hot-pink' : ''}
                  ${card.trend === 'neutral' ? 'bg-text-muted/10 text-text-muted' : ''}
                `}
                                >
                                    <TrendIcon className="w-3 h-3" />
                                    {card.trendValue}%
                                </div>
                            )}
                        </div>

                        {/* Value */}
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-pure-white number-counter">
                                {card.value}
                            </div>
                            <div className="text-sm text-text-muted">{card.label}</div>
                        </div>

                        {/* Progress Bar (for percentage-based metrics) */}
                        {(card.label === 'DeFi Activity' || card.label === 'Repayment Rate') && (
                            <div className="mt-4 h-1.5 bg-charcoal rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${card.label === 'DeFi Activity'
                                                ? metrics.defiScore
                                                : metrics.repaymentRate
                                            }%`,
                                    }}
                                    transition={{ duration: 1.5, delay: index * 0.1 + 0.3 }}
                                    className={`h-full bg-gradient-to-r from-${card.color} to-${card.color}/50 rounded-full`}
                                />
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
