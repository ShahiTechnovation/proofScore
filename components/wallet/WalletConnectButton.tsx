'use client';

/**
 * Wallet Connect Button Component
 * 
 * Production-ready wallet connection button for Aleo wallets
 * Integrates with @demox-labs/aleo-wallet-adapter
 * 
 * @module components/wallet/WalletConnectButton
 */

import { useWalletModal } from '@demox-labs/aleo-wallet-adapter-reactui';
import { useAleoWallet, useFormattedAddress } from '@/hooks/useAleoWallet';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

interface WalletConnectButtonProps {
    className?: string;
    variant?: 'default' | 'outline';
}

/**
 * Wallet Connect Button
 * 
 * Displays wallet connection status and allows users to connect/disconnect
 * 
 * @example
 * ```tsx
 * <WalletConnectButton variant="default" />
 * ```
 */
export function WalletConnectButton({
    className = '',
    variant = 'default',
}: WalletConnectButtonProps) {
    const { setVisible } = useWalletModal();
    const { isConnected, isConnecting, disconnect, walletName } = useAleoWallet();
    const formattedAddress = useFormattedAddress();

    const handleClick = () => {
        if (isConnected) {
            disconnect();
        } else {
            setVisible(true);
        }
    };

    const baseClasses = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200';

    const variantClasses = variant === 'outline'
        ? 'border border-white/20 hover:border-primary/50 hover:bg-primary/10'
        : 'bg-gradient-to-r from-primary to-success hover:opacity-90';

    return (
        <button
            onClick={handleClick}
            disabled={isConnecting}
            className={`${baseClasses} ${variantClasses} ${className}`}
        >
            {isConnecting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                </>
            ) : isConnected ? (
                <>
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">{walletName}</span>
                    <span>{formattedAddress}</span>
                    <LogOut className="w-4 h-4 ml-2" />
                </>
            ) : (
                <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                </>
            )}
        </button>
    );
}
