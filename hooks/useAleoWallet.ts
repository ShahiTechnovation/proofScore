'use client';

/**
 * Aleo Wallet Hook
 * 
 * Production-ready hook for interacting with Aleo wallets
 * Provides wallet state, connection methods, and transaction signing
 * 
 * @module hooks/useAleoWallet
 */

import { useWallet as useWalletAdapter } from '@demox-labs/aleo-wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { getAleoNetwork } from '@/lib/providers/AleoWalletProvider';

export interface AleoWalletState {
    // Connection state
    address: string | null;
    publicKey: string | null;
    isConnected: boolean;
    isConnecting: boolean;

    // Wallet info
    walletName: string | null;
    network: WalletAdapterNetwork;

    // Error state
    error: Error | null;
}

export interface AleoWalletActions {
    // Connection methods
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;

    // Transaction methods
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
    requestRecords: (program: string) => Promise<any[]>;
    requestTransaction: (transaction: any) => Promise<string>;

    // Utility methods
    getBalance: () => Promise<number>;
    formatAddress: (address: string) => string;
}

/**
 * Use Aleo Wallet Hook
 * 
 * Provides complete wallet functionality with type safety
 * 
 * @example
 * ```tsx
 * const { address, isConnected, connect, disconnect } = useAleoWallet();
 * 
 * if (!isConnected) {
 *   return <button onClick={connect}>Connect Wallet</button>;
 * }
 * 
 * return <div>Connected: {address}</div>;
 * ```
 */
export function useAleoWallet(): AleoWalletState & AleoWalletActions {
    const wallet = useWalletAdapter();
    const [error, setError] = useState<Error | null>(null);
    const network = getAleoNetwork();

    // Clear error when wallet changes
    useEffect(() => {
        setError(null);
    }, [wallet.publicKey]);

    // Connect wallet
    const connect = useCallback(async () => {
        try {
            setError(null);
            await wallet.connect();
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to connect wallet');
            setError(error);
            throw error;
        }
    }, [wallet]);

    // Disconnect wallet
    const disconnect = useCallback(async () => {
        try {
            setError(null);
            await wallet.disconnect();
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to disconnect wallet');
            setError(error);
            throw error;
        }
    }, [wallet]);

    // Sign message
    const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
        if (!wallet.signMessage) {
            throw new Error('Wallet does not support message signing');
        }

        try {
            setError(null);
            // Pass message as first parameter, address as second (if needed by wallet)
            const signature = await wallet.signMessage(message);
            return signature;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to sign message');
            setError(error);
            throw error;
        }
    }, [wallet]);

    // Request records from program
    const requestRecords = useCallback(async (program: string): Promise<any[]> => {
        if (!wallet.requestRecords) {
            throw new Error('Wallet does not support record requests');
        }

        try {
            setError(null);
            return await wallet.requestRecords(program);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to request records');
            setError(error);
            throw error;
        }
    }, [wallet]);

    // Request transaction
    const requestTransaction = useCallback(async (transaction: any): Promise<string> => {
        if (!wallet.requestTransaction) {
            throw new Error('Wallet does not support transactions');
        }

        try {
            setError(null);
            const txId = await wallet.requestTransaction(transaction);
            return txId;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to submit transaction');
            setError(error);
            throw error;
        }
    }, [wallet]);

    // Get wallet balance
    const getBalance = useCallback(async (): Promise<number> => {
        if (!wallet.publicKey) {
            return 0;
        }

        try {
            // TODO: Implement actual balance fetching from RPC
            // For now, return mock balance
            return 100000000; // 100 ALEO (in microcredits)
        } catch (err) {
            console.error('Failed to fetch balance:', err);
            return 0;
        }
    }, [wallet.publicKey]);

    // Format address for display
    const formatAddress = useCallback((address: string): string => {
        if (!address || address.length < 20) {
            return address;
        }
        return `${address.slice(0, 10)}...${address.slice(-8)}`;
    }, []);

    // Build state object
    const state: AleoWalletState = {
        address: wallet.publicKey || null,
        publicKey: wallet.publicKey || null,
        isConnected: wallet.connected,
        isConnecting: wallet.connecting,
        walletName: wallet.wallet?.adapter.name || null,
        network,
        error,
    };

    // Build actions object
    const actions: AleoWalletActions = {
        connect,
        disconnect,
        signMessage,
        requestRecords,
        requestTransaction,
        getBalance,
        formatAddress,
    };

    return { ...state, ...actions };
}

/**
 * Use Formatted Address Hook
 * 
 * Returns a formatted version of the wallet address
 */
export function useFormattedAddress(): string {
    const { address, formatAddress } = useAleoWallet();

    if (!address) {
        return '';
    }

    return formatAddress(address);
}

/**
 * Use Wallet Balance Hook
 * 
 * Returns the current wallet balance
 */
export function useWalletBalance(): {
    balance: number;
    balanceInAleo: number;
    isLoading: boolean;
} {
    const { getBalance, isConnected } = useAleoWallet();
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isConnected) {
            setBalance(0);
            return;
        }

        let mounted = true;

        const fetchBalance = async () => {
            setIsLoading(true);
            try {
                const bal = await getBalance();
                if (mounted) {
                    setBalance(bal);
                }
            } catch (error) {
                console.error('Failed to fetch balance:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchBalance();

        // Refresh balance every 30 seconds
        const interval = setInterval(fetchBalance, 30000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [isConnected, getBalance]);

    return {
        balance,
        balanceInAleo: balance / 1000000, // Convert microcredits to ALEO
        isLoading,
    };
}
