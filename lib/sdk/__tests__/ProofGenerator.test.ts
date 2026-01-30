/**
 * ProofGenerator Unit Tests
 * Production-grade testing for ZK proof generation
 */

import { ProofGenerator } from '../ProofGenerator';
import { ScoringEngine } from '../ScoringEngine';
import type { WalletMetrics } from '@/types/sdk';

describe('ProofGenerator', () => {
    let generator: ProofGenerator;
    let mockAssessment: ReturnType<typeof ScoringEngine.calculateScore>;

    beforeEach(() => {
        generator = new ProofGenerator();

        const metrics: WalletMetrics = {
            address: 'aleo1test123',
            transactionCount: 25,
            walletAgeMonths: 12,
            defiScore: 65,
            repaymentRate: 85,
            tokenBalance: 10000,
            lastTransactionDate: Date.now(),
        };

        mockAssessment = ScoringEngine.calculateScore(metrics);
    });

    describe('generateProof', () => {
        it('should generate valid ZK proof', async () => {
            const proof = await generator.generateProof(mockAssessment);

            expect(proof).toHaveProperty('proofHash');
            expect(proof).toHaveProperty('publicInputs');
            expect(proof).toHaveProperty('proof');
            expect(proof.proofHash.length).toBeGreaterThan(0);
            expect(proof.publicInputs.length).toBeGreaterThan(0);
        });

        it('should generate proof with correct structure', async () => {
            const proof = await generator.generateProof(mockAssessment);

            expect(proof.proof).toHaveProperty('a');
            expect(proof.proof).toHaveProperty('b');
            expect(proof.proof).toHaveProperty('c');
            expect(Array.isArray(proof.proof.a)).toBe(true);
            expect(Array.isArray(proof.proof.b)).toBe(true);
            expect(Array.isArray(proof.proof.c)).toBe(true);
        });

        it('should include public inputs', async () => {
            const proof = await generator.generateProof(mockAssessment);

            expect(proof.publicInputs).toContain(mockAssessment.finalScore.toString());
            expect(proof.publicInputs).toContain(mockAssessment.timestamp.toString());
            expect(proof.publicInputs).toContain(mockAssessment.address);
        });

        it('should take 2-3 seconds to generate', async () => {
            const startTime = Date.now();
            await generator.generateProof(mockAssessment);
            const duration = Date.now() - startTime;

            // Should take at least 2 seconds (simulated computation)
            expect(duration).toBeGreaterThanOrEqual(2000);
            // Should not take more than 4 seconds
            expect(duration).toBeLessThan(4000);
        });

        it('should generate unique proofs for same assessment', async () => {
            const proof1 = await generator.generateProof(mockAssessment);
            const proof2 = await generator.generateProof(mockAssessment);

            // Proofs should be different (due to random secret)
            expect(proof1.proofHash).not.toBe(proof2.proofHash);
        });
    });

    describe('verifyProofLocally', () => {
        it('should verify valid proof', async () => {
            const proof = await generator.generateProof(mockAssessment);
            const isValid = await generator.verifyProofLocally(proof);

            expect(isValid).toBe(true);
        });

        it('should reject proof with missing hash', async () => {
            const proof = await generator.generateProof(mockAssessment);
            proof.proofHash = '';

            const isValid = await generator.verifyProofLocally(proof);
            expect(isValid).toBe(false);
        });

        it('should reject proof with missing components', async () => {
            const proof = await generator.generateProof(mockAssessment);
            // @ts-expect-error - Testing invalid proof
            proof.proof.a = null;

            const isValid = await generator.verifyProofLocally(proof);
            expect(isValid).toBe(false);
        });

        it('should reject proof with missing public inputs', async () => {
            const proof = await generator.generateProof(mockAssessment);
            proof.publicInputs = [];

            const isValid = await generator.verifyProofLocally(proof);
            expect(isValid).toBe(false);
        });
    });

    describe('estimateProofTime', () => {
        it('should return estimated time in milliseconds', () => {
            const estimate = generator.estimateProofTime();

            expect(typeof estimate).toBe('number');
            expect(estimate).toBeGreaterThan(0);
            expect(estimate).toBeLessThanOrEqual(5000);
        });
    });

    describe('isWasmSupported', () => {
        it('should detect WebAssembly support', () => {
            const isSupported = ProofGenerator.isWasmSupported();

            expect(typeof isSupported).toBe('boolean');
            // In Node.js environment, WASM should be supported
            expect(isSupported).toBe(true);
        });
    });
});
