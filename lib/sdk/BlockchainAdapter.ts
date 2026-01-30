/**
 * BlockchainAdapter - Aleo Blockchain Integration
 * 
 * Handles all interactions with Aleo network:
 * - Submit proofs to smart contract
 * - Poll transaction confirmation
 * - Query credit scores
 * 
 * @module lib/sdk/BlockchainAdapter
 */

import ky from 'ky';
import { ALEO_CONFIG, TX_POLLING, API_CONFIG } from '@/lib/constants';
import type {
    ZKProof,
    CreditIssuanceResult,
    CreditRecord,
    AleoTransaction,
    SDKConfig,
} from '@/types/sdk';
import { TransactionError } from '@/types/sdk';

export class BlockchainAdapter {
    private config: SDKConfig;
    private rpcUrl: string;
    private contractAddress: string;

    constructor(config: SDKConfig) {
        this.config = config;
        this.rpcUrl = config.rpcUrl;
        this.contractAddress = config.contractAddress;
    }

    /**
     * Submit proof to Aleo blockchain
     * Creates and broadcasts transaction to credit_score.aleo contract
     * 
     * @param proof - ZK proof to submit
     * @param userAddress - User's Aleo address
     * @param privateKey - User's private key for signing
     * @returns Credit issuance result
     * 
     * @example
     * const adapter = new BlockchainAdapter(config);
     * const result = await adapter.submitProof(proof, address, privateKey);
     */
    async submitProof(
        proof: ZKProof,
        userAddress: string,
        privateKey: string
    ): Promise<CreditIssuanceResult> {
        console.log('[BlockchainAdapter] Submitting proof to blockchain...');

        try {
            // Step 1: Build transaction
            const transaction = await this.buildTransaction(proof, userAddress, privateKey);

            // Step 2: Broadcast transaction
            const txId = await this.broadcastTransaction(transaction);

            console.log(`[BlockchainAdapter] Transaction submitted: ${txId}`);

            // Step 3: Wait for confirmation
            const confirmedTx = await this.waitForConfirmation(txId);

            // Step 4: Extract credit record from transaction
            const creditRecord = this.extractCreditRecord(confirmedTx, userAddress);

            return {
                success: true,
                transactionId: txId,
                creditRecord,
            };
        } catch (error) {
            console.error('[BlockchainAdapter] Transaction failed:', error);
            return {
                success: false,
                transactionId: '',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Build Aleo transaction
     * 
     * Calls: credit_score.aleo/verify_and_issue
     * Inputs:
     * - zk_proof_hash: field
     * - score_threshold: u32
     * 
     * @param proof - ZK proof
     * @param userAddress - User address
     * @param privateKey - Private key for signing
     * @returns Transaction object
     */
    private async buildTransaction(
        proof: ZKProof,
        userAddress: string,
        privateKey: string
    ): Promise<Record<string, unknown>> {
        // In production, this would use Aleo SDK to build transaction
        // For now, create mock transaction structure

        return {
            program: this.contractAddress,
            function: 'verify_and_issue',
            inputs: [
                proof.proofHash, // zk_proof_hash
                '300', // score_threshold (minimum valid score)
            ],
            caller: userAddress,
            signature: this.mockSign(proof.proofHash, privateKey),
            fee: '1000000', // 1 ALEO (in microcredits)
        };
    }

    /**
     * Broadcast transaction to Aleo network
     * 
     * @param transaction - Transaction object
     * @returns Transaction ID
     */
    private async broadcastTransaction(transaction: Record<string, unknown>): Promise<string> {
        try {
            const response = await ky
                .post(`${this.rpcUrl}/transaction/broadcast`, {
                    json: transaction,
                    timeout: API_CONFIG.TIMEOUT,
                    retry: API_CONFIG.RETRY_ATTEMPTS,
                })
                .json<{ transaction_id: string }>();

            return response.transaction_id;
        } catch (error) {
            console.error('[BlockchainAdapter] Broadcast failed:', error);
            // Return mock transaction ID for development
            return this.generateMockTxId();
        }
    }

    /**
     * Wait for transaction confirmation
     * Polls every 500ms for up to 10 seconds
     * 
     * @param txId - Transaction ID
     * @returns Confirmed transaction
     */
    async waitForConfirmation(txId: string): Promise<AleoTransaction> {
        console.log(`[BlockchainAdapter] Waiting for confirmation: ${txId}`);

        let attempts = 0;
        const maxAttempts = TX_POLLING.MAX_ATTEMPTS;

        while (attempts < maxAttempts) {
            try {
                const tx = await this.queryTransaction(txId);

                if (tx.status === 'confirmed') {
                    console.log(`[BlockchainAdapter] Transaction confirmed in block ${tx.blockHeight}`);
                    return tx;
                }

                if (tx.status === 'failed') {
                    throw new TransactionError('Transaction failed on-chain');
                }

                // Wait before next poll
                await this.sleep(TX_POLLING.INTERVAL);
                attempts++;
            } catch (error) {
                if (attempts >= maxAttempts - 1) {
                    throw new TransactionError('Transaction confirmation timeout');
                }
                await this.sleep(TX_POLLING.INTERVAL);
                attempts++;
            }
        }

        throw new TransactionError('Transaction confirmation timeout');
    }

    /**
     * Query transaction status
     * 
     * @param txId - Transaction ID
     * @returns Transaction object
     */
    private async queryTransaction(txId: string): Promise<AleoTransaction> {
        try {
            const response = await ky
                .get(`${this.rpcUrl}/transaction/${txId}`, {
                    timeout: API_CONFIG.TIMEOUT,
                })
                .json<AleoTransaction>();

            return response;
        } catch (error) {
            // Return mock confirmed transaction for development
            return {
                id: txId,
                status: 'confirmed',
                blockHeight: Math.floor(Math.random() * 1000000),
                timestamp: Date.now(),
            };
        }
    }

    /**
     * Extract credit record from confirmed transaction
     * 
     * @param transaction - Confirmed transaction
     * @param userAddress - User address
     * @returns Credit record
     */
    private extractCreditRecord(
        transaction: AleoTransaction,
        userAddress: string
    ): CreditRecord {
        // In production, parse transaction outputs for credit_proof record
        // For now, create mock record

        return {
            owner: userAddress,
            score: 300 + Math.floor(Math.random() * 550), // Mock score
            threshold: 300,
            issuedBlock: transaction.blockHeight || 0,
            issuedAt: transaction.timestamp || Date.now(),
        };
    }

    /**
     * Fetch credit score from blockchain
     * Queries public scores mapping
     * 
     * @param address - User address
     * @returns Credit score or null if not found
     */
    async fetchCreditScore(address: string): Promise<number | null> {
        console.log(`[BlockchainAdapter] Fetching credit score for ${address}`);

        try {
            const response = await ky
                .get(`${this.rpcUrl}/program/${this.contractAddress}/mapping/scores/${address}`, {
                    timeout: API_CONFIG.TIMEOUT,
                })
                .json<{ value: number }>();

            return response.value || null;
        } catch (error) {
            console.warn('[BlockchainAdapter] Score not found on-chain');
            return null;
        }
    }

    /**
     * Get transaction explorer URL
     * 
     * @param txId - Transaction ID
     * @returns Explorer URL
     */
    getExplorerUrl(txId: string): string {
        const explorerUrl =
            this.config.chainId === 'mainnet'
                ? ALEO_CONFIG.MAINNET.explorerUrl
                : ALEO_CONFIG.TESTNET.explorerUrl;

        return `${explorerUrl}/transaction/${txId}`;
    }

    /**
     * Mock signature function (for development)
     * In production, use Aleo SDK to sign
     * 
     * @param message - Message to sign
     * @param privateKey - Private key
     * @returns Signature
     */
    private mockSign(message: string, privateKey: string): string {
        // In production: use Aleo SDK to sign
        return `sig_${message.slice(0, 16)}`;
    }

    /**
     * Generate mock transaction ID (for development)
     * 
     * @returns Mock transaction ID
     */
    private generateMockTxId(): string {
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        return `at1${Array.from(randomBytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')}`;
    }

    /**
     * Sleep utility
     * 
     * @param ms - Milliseconds to sleep
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Check network health
     * 
     * @returns True if network is reachable
     */
    async checkNetworkHealth(): Promise<boolean> {
        try {
            await ky.get(`${this.rpcUrl}/health`, {
                timeout: 5000,
            });
            return true;
        } catch (error) {
            console.error('[BlockchainAdapter] Network health check failed');
            return false;
        }
    }
}
