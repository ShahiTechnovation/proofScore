/**
 * CreditScoreSDK - Main SDK Orchestrator
 * 
 * Ties together all SDK components:
 * - DataAggregator: Fetch on-chain metrics
 * - ScoringEngine: Calculate credit scores
 * - ProofGenerator: Create ZK proofs
 * - BlockchainAdapter: Submit to Aleo network
 * 
 * Provides simple API for credit issuance flow
 * 
 * @module lib/sdk/CreditScoreSDK
 */

import { DataAggregator } from './DataAggregator';
import { ScoringEngine } from './ScoringEngine';
import { ProofGenerator } from './ProofGenerator';
import { BlockchainAdapter } from './BlockchainAdapter';
import { ALEO_CONFIG } from '@/lib/constants';
import type {
    SDKConfig,
    WalletMetrics,
    CreditAssessment,
    ZKProof,
    CreditIssuanceResult,
} from '@/types/sdk';
import { SDKError } from '@/types/sdk';

export class CreditScoreSDK {
    private config: SDKConfig;
    private dataAggregator: DataAggregator;
    private proofGenerator: ProofGenerator;
    private blockchainAdapter: BlockchainAdapter;
    private userAddress?: string;

    /**
     * Initialize SDK
     * 
     * @param config - SDK configuration
     * 
     * @example
     * const sdk = new CreditScoreSDK({
     *   rpcUrl: 'https://api.explorer.aleo.org/v1',
     *   contractAddress: 'credit_score.aleo',
     *   chainId: 'mainnet',
     * });
     */
    constructor(config?: Partial<SDKConfig>) {
        // Merge with defaults
        this.config = {
            rpcUrl: config?.rpcUrl || ALEO_CONFIG.MAINNET.rpcUrl,
            contractAddress: config?.contractAddress || ALEO_CONFIG.MAINNET.contractAddress,
            chainId: config?.chainId || 'mainnet',
            enableCache: config?.enableCache ?? true,
            cacheTTL: config?.cacheTTL,
        };

        // Initialize components
        this.dataAggregator = new DataAggregator(this.config.rpcUrl, this.config.indexerUrl);
        this.proofGenerator = new ProofGenerator();
        this.blockchainAdapter = new BlockchainAdapter(this.config);

        console.log('[SDK] Initialized with config:', {
            chainId: this.config.chainId,
            contractAddress: this.config.contractAddress,
        });
    }

    /**
     * Initialize SDK with user's wallet address
     * Must be called before using SDK methods
     * 
     * @param userAddress - Aleo wallet address
     * 
     * @example
     * await sdk.init('aleo1...');
     */
    async init(userAddress: string): Promise<void> {
        if (!userAddress.startsWith('aleo1')) {
            throw new SDKError('Invalid Aleo address format', 'INVALID_ADDRESS');
        }

        this.userAddress = userAddress;
        console.log(`[SDK] Initialized for user: ${userAddress}`);

        // Check network health
        const isHealthy = await this.blockchainAdapter.checkNetworkHealth();
        if (!isHealthy) {
            console.warn('[SDK] Network health check failed, continuing anyway...');
        }
    }

    /**
     * Fetch wallet metrics from blockchain
     * Returns cached data if available (<1 hour old)
     * 
     * @returns Wallet metrics
     * 
     * @example
     * const metrics = await sdk.fetchWalletMetrics();
     */
    async fetchWalletMetrics(): Promise<WalletMetrics> {
        this.ensureInitialized();

        console.log('[SDK] Fetching wallet metrics...');
        const metrics = await this.dataAggregator.fetchWalletMetrics(this.userAddress!);

        // Validate metrics
        ScoringEngine.validateMetrics(metrics);

        console.log('[SDK] Metrics fetched:', {
            txCount: metrics.transactionCount,
            age: metrics.walletAgeMonths,
            defi: metrics.defiScore,
            repayment: metrics.repaymentRate,
        });

        return metrics;
    }

    /**
     * Calculate credit score from metrics
     * Pure function: 300-850 scale
     * 
     * @param metrics - Wallet metrics
     * @returns Credit assessment
     * 
     * @example
     * const assessment = sdk.calculateScore(metrics);
     */
    calculateScore(metrics: WalletMetrics): CreditAssessment {
        console.log('[SDK] Calculating credit score...');
        const assessment = ScoringEngine.calculateScore(metrics);

        console.log(`[SDK] Score calculated: ${assessment.finalScore} (${assessment.riskLevel})`);

        return assessment;
    }

    /**
     * Generate zero-knowledge proof
     * Runs on-device, takes 2-3 seconds
     * 
     * @param assessment - Credit assessment
     * @returns ZK proof
     * 
     * @example
     * const proof = await sdk.generateProof(assessment);
     */
    async generateProof(assessment: CreditAssessment): Promise<ZKProof> {
        console.log('[SDK] Generating ZK proof...');
        const proof = await this.proofGenerator.generateProof(assessment);

        // Verify proof locally before returning
        const isValid = await this.proofGenerator.verifyProofLocally(proof);
        if (!isValid) {
            throw new SDKError('Proof verification failed', 'INVALID_PROOF');
        }

        console.log(`[SDK] Proof generated: ${proof.proofHash.slice(0, 16)}...`);

        return proof;
    }

    /**
     * Submit proof to blockchain and issue credit
     * 
     * @param proof - ZK proof
     * @param privateKey - User's private key for signing
     * @returns Credit issuance result
     * 
     * @example
     * const result = await sdk.issueCredit(proof, privateKey);
     */
    async issueCredit(proof: ZKProof, privateKey: string): Promise<CreditIssuanceResult> {
        this.ensureInitialized();

        console.log('[SDK] Issuing credit...');
        const result = await this.blockchainAdapter.submitProof(
            proof,
            this.userAddress!,
            privateKey
        );

        if (result.success) {
            console.log(`[SDK] Credit issued successfully: ${result.transactionId}`);
        } else {
            console.error(`[SDK] Credit issuance failed: ${result.error}`);
        }

        return result;
    }

    /**
     * Complete credit issuance flow
     * Orchestrates all steps: fetch → score → prove → submit
     * 
     * This is the main method most users will call
     * 
     * @param privateKey - User's private key for signing
     * @returns Credit issuance result
     * 
     * @example
     * const sdk = new CreditScoreSDK();
     * await sdk.init('aleo1...');
     * const result = await sdk.issueCreditFlow(privateKey);
     */
    async issueCreditFlow(privateKey: string): Promise<CreditIssuanceResult> {
        console.log('[SDK] ========================================');
        console.log('[SDK] Starting complete credit issuance flow');
        console.log('[SDK] ========================================');

        const startTime = Date.now();

        try {
            // Step 1: Fetch metrics (1.5s)
            console.log('[SDK] Step 1/4: Fetching wallet metrics...');
            const metrics = await this.fetchWalletMetrics();

            // Step 2: Calculate score (0.5s)
            console.log('[SDK] Step 2/4: Calculating credit score...');
            const assessment = this.calculateScore(metrics);

            // Step 3: Generate proof (2-3s)
            console.log('[SDK] Step 3/4: Generating ZK proof...');
            const proof = await this.generateProof(assessment);

            // Step 4: Issue credit (2s)
            console.log('[SDK] Step 4/4: Submitting to blockchain...');
            const result = await this.issueCredit(proof, privateKey);

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log('[SDK] ========================================');
            console.log(`[SDK] Flow completed in ${duration}s`);
            console.log('[SDK] ========================================');

            return result;
        } catch (error) {
            console.error('[SDK] Flow failed:', error);
            throw error instanceof SDKError
                ? error
                : new SDKError('Credit issuance flow failed', 'FLOW_ERROR', error);
        }
    }

    /**
     * Query existing credit score from blockchain
     * 
     * @returns Credit score or null if not found
     * 
     * @example
     * const score = await sdk.fetchCreditScore();
     */
    async fetchCreditScore(): Promise<number | null> {
        this.ensureInitialized();

        console.log('[SDK] Fetching credit score from blockchain...');
        return this.blockchainAdapter.fetchCreditScore(this.userAddress!);
    }

    /**
     * Get score breakdown for UI display
     * Shows how each factor contributes to final score
     * 
     * @param assessment - Credit assessment
     * @returns Detailed breakdown
     */
    getScoreBreakdown(assessment: CreditAssessment) {
        return ScoringEngine.getScoreBreakdown(assessment);
    }

    /**
     * Get transaction explorer URL
     * 
     * @param txId - Transaction ID
     * @returns Explorer URL
     */
    getExplorerUrl(txId: string): string {
        return this.blockchainAdapter.getExplorerUrl(txId);
    }

    /**
     * Clear cached metrics for current user
     */
    clearCache(): void {
        if (this.userAddress) {
            this.dataAggregator.clearCache(this.userAddress);
            console.log('[SDK] Cache cleared');
        }
    }

    /**
     * Get SDK configuration
     */
    getConfig(): SDKConfig {
        return { ...this.config };
    }

    /**
     * Get current user address
     */
    getUserAddress(): string | undefined {
        return this.userAddress;
    }

    /**
     * Ensure SDK is initialized
     * @private
     */
    private ensureInitialized(): void {
        if (!this.userAddress) {
            throw new SDKError('SDK not initialized. Call init() first.', 'NOT_INITIALIZED');
        }
    }

    /**
     * Check if WebAssembly is supported (required for ZK proofs)
     */
    static isWasmSupported(): boolean {
        return ProofGenerator.isWasmSupported();
    }
}

// Export singleton instance for convenience
let sdkInstance: CreditScoreSDK | null = null;

/**
 * Get or create SDK singleton instance
 * 
 * @param config - SDK configuration
 * @returns SDK instance
 */
export function getSDK(config?: Partial<SDKConfig>): CreditScoreSDK {
    if (!sdkInstance) {
        sdkInstance = new CreditScoreSDK(config);
    }
    return sdkInstance;
}

/**
 * Reset SDK singleton (useful for testing)
 */
export function resetSDK(): void {
    sdkInstance = null;
}
