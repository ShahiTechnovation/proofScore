/**
 * ProofScore SDK
 * 
 * Main entry point for the credit scoring SDK
 * Exports all classes and utilities
 * 
 * @module lib/sdk
 */

// Main SDK
export { CreditScoreSDK, getSDK, resetSDK } from './CreditScoreSDK';

// Core components (for advanced usage)
export { DataAggregator } from './DataAggregator';
export { ScoringEngine } from './ScoringEngine';
export { ProofGenerator } from './ProofGenerator';
export { BlockchainAdapter } from './BlockchainAdapter';

// Re-export types
export type {
    SDKConfig,
    WalletMetrics,
    CreditAssessment,
    ZKProof,
    CreditIssuanceResult,
    CreditRecord,
    RiskLevel,
    AleoTransaction,
    AleoAccount,
} from '@/types/sdk';

// Re-export errors
export { SDKError, RPCError, ProofGenerationError, TransactionError } from '@/types/sdk';
