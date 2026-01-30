'use client';

/**
 * Aleo Wallet Adapter Provider
 * 
 * Production-ready wallet integration for Aleo blockchain
 * Supports multiple wallet types with automatic reconnection
 * 
 * @module lib/providers/AleoWalletProvider
 */

import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui';
import { DecryptPermission, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { useMemo, type ReactNode } from 'react';

// Import wallet adapter CSS
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css';

interface AleoWalletProviderProps {
    children: ReactNode;
    network?: WalletAdapterNetwork;
    autoConnect?: boolean;
}

/**
 * Aleo Wallet Provider Component
 * 
 * Wraps the application with Aleo wallet adapter functionality
 * Provides wallet connection, signing, and transaction capabilities
 * 
 * @example
 * ```tsx
 * <AleoWalletProvider network={WalletAdapterNetwork.TestnetBeta} autoConnect>
 *   <App />
 * </AleoWalletProvider>
 * ```
 */
export function AleoWalletProvider({
    children,
    network = WalletAdapterNetwork.TestnetBeta,
    autoConnect = true,
}: AleoWalletProviderProps) {
    // Wallet configuration
    const wallets = useMemo(() => {
        // Note: Wallet adapters will be auto-detected from browser extensions
        // No need to manually instantiate them
        return [];
    }, []);

    // Decrypt permission for ZK proof generation
    const decryptPermission = DecryptPermission.UponRequest;

    // Programs that require decryption permission
    const programs = useMemo(() => {
        return [process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'credit_score.aleo'];
    }, []);

    return (
        <WalletProvider
            wallets={wallets}
            network={network}
            decryptPermission={decryptPermission}
            programs={programs}
            autoConnect={autoConnect}
        >
            <WalletModalProvider>
                {children}
            </WalletModalProvider>
        </WalletProvider>
    );
}

/**
 * Network Configuration
 * 
 * Helper to get network configuration based on environment
 */
export function getAleoNetwork(): WalletAdapterNetwork {
    // Currently using TestnetBeta as it's the supported network
    // Update when mainnet support is added
    return WalletAdapterNetwork.TestnetBeta;
}

/**
 * RPC URL Configuration
 * 
 * Get RPC URL based on network
 */
export function getAleoRpcUrl(): string {
    // Use environment variable if available
    if (process.env.NEXT_PUBLIC_ALEO_RPC) {
        return process.env.NEXT_PUBLIC_ALEO_RPC;
    }

    // Default RPC endpoint for testnet
    return 'https://api.explorer.provable.com/v1';
}

/**
 * Explorer URL Configuration
 * 
 * Get block explorer URL based on network
 */
export function getAleoExplorerUrl(): string {
    // Default explorer for testnet
    return 'https://explorer.provable.com';
}
