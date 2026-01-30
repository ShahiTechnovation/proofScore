'use client';

import { motion } from 'framer-motion';
import {
    RefreshCw,
    Share2,
    Shield,
    ExternalLink,
    Download,
    Copy,
} from 'lucide-react';

interface ActionCardsProps {
    transactionId?: string;
    onUpdateScore?: () => void;
    onShareScore?: () => void;
    onVerifyScore?: () => void;
}

export function ActionCards({
    transactionId,
    onUpdateScore,
    onShareScore,
    onVerifyScore,
}: ActionCardsProps) {
    // Helper to get color classes
    const getColorClasses = (color: string) => {
        const colorMap = {
            'neon-cyan': {
                bg: 'bg-neon-cyan/10',
                border: 'border-neon-cyan/30',
                text: 'text-neon-cyan',
            },
            'neon-green': {
                bg: 'bg-neon-green/10',
                border: 'border-neon-green/30',
                text: 'text-neon-green',
            },
            'electric-purple': {
                bg: 'bg-electric-purple/10',
                border: 'border-electric-purple/30',
                text: 'text-electric-purple',
            },
        };
        return colorMap[color as keyof typeof colorMap] || colorMap['neon-cyan'];
    };

    const actions = [
        {
            icon: RefreshCw,
            title: 'Update Score',
            description: 'Refresh your credit score with latest on-chain data',
            color: 'neon-cyan',
            onClick: onUpdateScore,
            disabled: false,
        },
        {
            icon: Share2,
            title: 'Share Score',
            description: 'Generate shareable proof for DeFi protocols',
            color: 'neon-green',
            onClick: onShareScore,
            disabled: false,
        },
        {
            icon: Shield,
            title: 'Verify On-Chain',
            description: 'View your score on Aleo blockchain explorer',
            color: 'electric-purple',
            onClick: onVerifyScore,
            disabled: !transactionId,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actions.map((action, index) => {
                const Icon = action.icon;
                const colors = getColorClasses(action.color);

                return (
                    <motion.button
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={`
              glass-card p-6 text-left group
              hover:scale-[1.02] transition-all
              ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
                    >
                        {/* Icon */}
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${colors.bg} border ${colors.border} group-hover:scale-110 transition-transform`}
                        >
                            <Icon className={`w-7 h-7 ${colors.text}`} />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-pure-white flex items-center gap-2">
                                {action.title}
                                {!action.disabled && (
                                    <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {action.description}
                            </p>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

interface QuickActionsProps {
    address: string;
    transactionId?: string;
    score: number;
}

export function QuickActions({
    address,
    transactionId,
    score,
}: QuickActionsProps) {
    const copyAddress = () => {
        navigator.clipboard.writeText(address);
        // TODO: Show toast notification
    };

    const copyTransactionId = () => {
        if (transactionId) {
            navigator.clipboard.writeText(transactionId);
            // TODO: Show toast notification
        }
    };

    const downloadProof = () => {
        // TODO: Implement proof download
        console.log('Downloading proof...');
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-pure-white mb-4">
                Quick Actions
            </h3>

            <div className="space-y-3">
                {/* Copy Address */}
                <button
                    onClick={copyAddress}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-charcoal/50 hover:bg-charcoal transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <Copy className="w-4 h-4 text-text-muted" />
                        <div className="text-left">
                            <div className="text-sm font-medium text-pure-white">
                                Copy Address
                            </div>
                            <div className="text-xs text-text-muted font-mono">
                                {address.slice(0, 12)}...{address.slice(-8)}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to copy
                    </div>
                </button>

                {/* Copy Transaction ID */}
                {transactionId && (
                    <button
                        onClick={copyTransactionId}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-charcoal/50 hover:bg-charcoal transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Copy className="w-4 h-4 text-text-muted" />
                            <div className="text-left">
                                <div className="text-sm font-medium text-pure-white">
                                    Copy Transaction ID
                                </div>
                                <div className="text-xs text-text-muted font-mono">
                                    {transactionId.slice(0, 12)}...{transactionId.slice(-8)}
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to copy
                        </div>
                    </button>
                )}

                {/* Download Proof */}
                <button
                    onClick={downloadProof}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-charcoal/50 hover:bg-charcoal transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-text-muted" />
                        <div className="text-left">
                            <div className="text-sm font-medium text-pure-white">
                                Download Proof
                            </div>
                            <div className="text-xs text-text-muted">
                                ZK proof for score {score}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        Download
                    </div>
                </button>
            </div>
        </div>
    );
}
