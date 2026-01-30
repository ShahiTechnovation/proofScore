'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { RiskLevel } from '@/types/sdk';

interface ScoreRingProps {
    score: number; // 300-850
    riskLevel: RiskLevel;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    showLabel?: boolean;
}

export function ScoreRing({
    score,
    riskLevel,
    size = 'lg',
    animated = true,
    showLabel = true,
}: ScoreRingProps) {
    const [displayScore, setDisplayScore] = useState(animated ? 300 : score);

    // Animate score counting
    useEffect(() => {
        if (!animated) return;

        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = (score - 300) / steps;
        let current = 300;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += increment;

            if (step >= steps) {
                setDisplayScore(score);
                clearInterval(timer);
            } else {
                setDisplayScore(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score, animated]);

    // Calculate percentage (300-850 range)
    const percentage = ((score - 300) / 550) * 100;

    // Size configurations
    const sizes = {
        sm: {
            container: 'w-32 h-32',
            stroke: 6,
            fontSize: 'text-2xl',
            labelSize: 'text-xs',
        },
        md: {
            container: 'w-48 h-48',
            stroke: 8,
            fontSize: 'text-4xl',
            labelSize: 'text-sm',
        },
        lg: {
            container: 'w-64 h-64',
            stroke: 10,
            fontSize: 'text-6xl',
            labelSize: 'text-base',
        },
    };

    const config = sizes[size];

    // Risk level colors
    const riskColors = {
        low: {
            gradient: 'from-neon-green to-neon-cyan',
            glow: 'shadow-[0_0_40px_rgba(0,255,136,0.3)]',
            text: 'text-neon-green',
        },
        medium: {
            gradient: 'from-neon-yellow to-neon-cyan',
            glow: 'shadow-[0_0_40px_rgba(250,255,0,0.3)]',
            text: 'text-neon-yellow',
        },
        high: {
            gradient: 'from-hot-pink to-electric-purple',
            glow: 'shadow-[0_0_40px_rgba(255,0,128,0.3)]',
            text: 'text-hot-pink',
        },
    };

    const colors = riskColors[riskLevel];

    // SVG circle calculations
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center gap-4">
            {/* Score Ring */}
            <div className={`relative ${config.container}`}>
                {/* Glow effect */}
                <div
                    className={`absolute inset-0 rounded-full ${colors.glow} opacity-50 blur-xl`}
                />

                {/* SVG Ring */}
                <svg
                    className="transform -rotate-90 w-full h-full"
                    viewBox="0 0 200 200"
                >
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth={config.stroke}
                    />

                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id={`scoreGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop
                                offset="0%"
                                stopColor={
                                    riskLevel === 'low' ? '#00FF88' :
                                        riskLevel === 'medium' ? '#FAFF00' :
                                            '#FF0080'
                                }
                            />
                            <stop
                                offset="100%"
                                stopColor={
                                    riskLevel === 'low' ? '#00F0FF' :
                                        riskLevel === 'medium' ? '#00F0FF' :
                                            '#A855F7'
                                }
                            />
                        </linearGradient>
                    </defs>

                    {/* Progress circle */}
                    <motion.circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={`url(#scoreGradient-${size})`}
                        strokeWidth={config.stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{
                            duration: 2,
                            ease: [0.16, 1, 0.3, 1],
                            delay: 0.2,
                        }}
                    />
                </svg>

                {/* Score Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center"
                    >
                        <div className={`${config.fontSize} font-bold ${colors.text} number-counter`}>
                            {displayScore}
                        </div>
                        {showLabel && (
                            <div className={`${config.labelSize} text-text-muted mt-1`}>
                                Credit Score
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Risk Level Badge */}
            {showLabel && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className={`
            px-4 py-2 rounded-full font-medium text-sm
            ${riskLevel === 'low' ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green' : ''}
            ${riskLevel === 'medium' ? 'bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow' : ''}
            ${riskLevel === 'high' ? 'bg-hot-pink/10 border border-hot-pink/30 text-hot-pink' : ''}
          `}
                >
                    {riskLevel === 'low' && '✓ Low Risk'}
                    {riskLevel === 'medium' && '⚠ Medium Risk'}
                    {riskLevel === 'high' && '⚡ High Risk'}
                </motion.div>
            )}
        </div>
    );
}
