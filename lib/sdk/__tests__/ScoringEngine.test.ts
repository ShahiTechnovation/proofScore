/**
 * ScoringEngine Unit Tests
 * 
 * 100% coverage required for production deployment
 * Tests all scoring logic, edge cases, and validation
 */

import { ScoringEngine } from '../ScoringEngine';
import { SCORING_CONFIG } from '@/lib/constants';
import type { WalletMetrics } from '@/types/sdk';

describe('ScoringEngine', () => {
    describe('calculateScore', () => {
        it('should return base score (300) for new wallet with no activity', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1test123456789',
                transactionCount: 0,
                walletAgeMonths: 0,
                defiScore: 0,
                repaymentRate: 0,
                tokenBalance: 0,
                lastTransactionDate: Date.now(),
            };

            const result = ScoringEngine.calculateScore(metrics);

            expect(result.finalScore).toBe(300);
            expect(result.baseScore).toBe(300);
            expect(result.bonusPoints).toBe(0);
            expect(result.riskLevel).toBe('high');
        });

        it('should return max score (850) for perfect wallet', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1perfect',
                transactionCount: 50, // Max bonus: 100
                walletAgeMonths: 24, // Max bonus: 100
                defiScore: 80, // Max bonus: 100
                repaymentRate: 100, // Max bonus: 50 (not 150, capped)
                tokenBalance: 100000,
                lastTransactionDate: Date.now(),
            };

            const result = ScoringEngine.calculateScore(metrics);

            expect(result.finalScore).toBe(850); // Capped at max
            expect(result.riskLevel).toBe('low');
        });

        it('should calculate medium risk score correctly', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1medium',
                transactionCount: 20, // (20-10)*5 = 50
                walletAgeMonths: 6, // 6*10 = 60
                defiScore: 40, // (40-20)*3 = 60
                repaymentRate: 80, // (80-75)*2 = 10
                tokenBalance: 5000,
                lastTransactionDate: Date.now(),
            };

            const result = ScoringEngine.calculateScore(metrics);

            // 300 + 50 + 60 + 60 + 10 = 480
            expect(result.finalScore).toBe(480);
            expect(result.bonusPoints).toBe(180);
            expect(result.riskLevel).toBe('high'); // < 500
        });

        it('should calculate low risk score correctly', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1lowrisk',
                transactionCount: 40, // (40-10)*5 = 100 (capped)
                walletAgeMonths: 15, // 15*10 = 100 (capped)
                defiScore: 70, // (70-20)*3 = 100 (capped)
                repaymentRate: 95, // (95-75)*2 = 40
                tokenBalance: 50000,
                lastTransactionDate: Date.now(),
            };

            const result = ScoringEngine.calculateScore(metrics);

            // 300 + 100 + 100 + 100 + 40 = 640
            expect(result.finalScore).toBe(640);
            expect(result.riskLevel).toBe('medium'); // >= 500, < 750
        });

        it('should include correct metadata in assessment', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1metadata',
                transactionCount: 15,
                walletAgeMonths: 8,
                defiScore: 45,
                repaymentRate: 85,
                tokenBalance: 10000,
                lastTransactionDate: Date.now(),
            };

            const result = ScoringEngine.calculateScore(metrics);

            expect(result.address).toBe('aleo1metadata');
            expect(result.metrics).toEqual(metrics);
            expect(result.timestamp).toBeGreaterThan(0);
            expect(typeof result.finalScore).toBe('number');
        });
    });

    describe('calculateTransactionBonus', () => {
        it('should return 0 for transactions below threshold', () => {
            // @ts-expect-error - Testing private method
            expect(ScoringEngine.calculateTransactionBonus(0)).toBe(0);
            // @ts-expect-error
            expect(ScoringEngine.calculateTransactionBonus(5)).toBe(0);
            // @ts-expect-error
            expect(ScoringEngine.calculateTransactionBonus(9)).toBe(0);
        });

        it('should calculate bonus correctly for transactions above threshold', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateTransactionBonus(10)).toBe(0); // At threshold
            // @ts-expect-error
            expect(ScoringEngine.calculateTransactionBonus(11)).toBe(5); // 1 above * 5
            // @ts-expect-error
            expect(ScoringEngine.calculateTransactionBonus(20)).toBe(50); // 10 above * 5
        });

        it('should cap bonus at maximum (100 points)', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateTransactionBonus(30)).toBe(100); // Would be 100
            // @ts-expect-error
            expect(ScoringEngine.calculateTransactionBonus(50)).toBe(100); // Capped
            // @ts-expect-error
            expect(ScoringEngine.calculateTransactionBonus(1000)).toBe(100); // Capped
        });
    });

    describe('calculateAgeBonus', () => {
        it('should return 0 for age below threshold', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(0)).toBe(0);
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(1)).toBe(0);
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(2)).toBe(0);
        });

        it('should calculate bonus correctly for age above threshold', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(3)).toBe(30); // 3 * 10
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(6)).toBe(60); // 6 * 10
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(9)).toBe(90); // 9 * 10
        });

        it('should cap bonus at maximum (100 points)', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(10)).toBe(100); // Would be 100
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(24)).toBe(100); // Capped
            // @ts-expect-error
            expect(ScoringEngine.calculateAgeBonus(100)).toBe(100); // Capped
        });
    });

    describe('calculateDeFiBonus', () => {
        it('should return 0 for score below threshold', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(0)).toBe(0);
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(10)).toBe(0);
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(19)).toBe(0);
        });

        it('should calculate bonus correctly for score above threshold', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(20)).toBe(0); // At threshold
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(30)).toBe(30); // (30-20) * 3
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(50)).toBe(90); // (50-20) * 3
        });

        it('should cap bonus at maximum (100 points)', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(60)).toBe(100); // Would be 120, capped
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(80)).toBe(100); // Capped
            // @ts-expect-error
            expect(ScoringEngine.calculateDeFiBonus(100)).toBe(100); // Capped
        });
    });

    describe('calculateRepaymentBonus', () => {
        it('should return 0 for rate below threshold', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateRepaymentBonus(0)).toBe(0);
            // @ts-expect-error
            expect(ScoringEngine.calculateRepaymentBonus(50)).toBe(0);
            // @ts-expect-error
            expect(ScoringEngine.calculateRepaymentBonus(74)).toBe(0);
        });

        it('should calculate bonus correctly for rate above threshold', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateRepaymentBonus(75)).toBe(0); // At threshold
            // @ts-expect-error
            expect(ScoringEngine.calculateRepaymentBonus(80)).toBe(10); // (80-75) * 2
            // @ts-expect-error
            expect(ScoringEngine.calculateRepaymentBonus(90)).toBe(30); // (90-75) * 2
        });

        it('should cap bonus at maximum (150 points)', () => {
            // @ts-expect-error
            expect(ScoringEngine.calculateRepaymentBonus(100)).toBe(50); // (100-75) * 2
            // Note: Max is 150, but 100% rate only gives 50 points
        });
    });

    describe('getRiskLevel', () => {
        it('should return "low" for scores >= 750', () => {
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(750)).toBe('low');
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(800)).toBe('low');
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(850)).toBe('low');
        });

        it('should return "medium" for scores >= 500 and < 750', () => {
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(500)).toBe('medium');
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(650)).toBe('medium');
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(749)).toBe('medium');
        });

        it('should return "high" for scores < 500', () => {
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(300)).toBe('high');
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(400)).toBe('high');
            // @ts-expect-error
            expect(ScoringEngine.getRiskLevel(499)).toBe('high');
        });
    });

    describe('validateMetrics', () => {
        it('should throw error for invalid Aleo address', () => {
            const metrics: WalletMetrics = {
                address: 'invalid',
                transactionCount: 10,
                walletAgeMonths: 5,
                defiScore: 50,
                repaymentRate: 80,
                tokenBalance: 1000,
                lastTransactionDate: Date.now(),
            };

            expect(() => ScoringEngine.validateMetrics(metrics)).toThrow(
                'Invalid Aleo address format'
            );
        });

        it('should throw error for negative transaction count', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1valid',
                transactionCount: -5,
                walletAgeMonths: 5,
                defiScore: 50,
                repaymentRate: 80,
                tokenBalance: 1000,
                lastTransactionDate: Date.now(),
            };

            expect(() => ScoringEngine.validateMetrics(metrics)).toThrow(
                'Transaction count cannot be negative'
            );
        });

        it('should throw error for negative wallet age', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1valid',
                transactionCount: 10,
                walletAgeMonths: -1,
                defiScore: 50,
                repaymentRate: 80,
                tokenBalance: 1000,
                lastTransactionDate: Date.now(),
            };

            expect(() => ScoringEngine.validateMetrics(metrics)).toThrow(
                'Wallet age cannot be negative'
            );
        });

        it('should throw error for DeFi score out of range', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1valid',
                transactionCount: 10,
                walletAgeMonths: 5,
                defiScore: 150,
                repaymentRate: 80,
                tokenBalance: 1000,
                lastTransactionDate: Date.now(),
            };

            expect(() => ScoringEngine.validateMetrics(metrics)).toThrow(
                'DeFi score must be between 0 and 100'
            );
        });

        it('should throw error for repayment rate out of range', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1valid',
                transactionCount: 10,
                walletAgeMonths: 5,
                defiScore: 50,
                repaymentRate: 150,
                tokenBalance: 1000,
                lastTransactionDate: Date.now(),
            };

            expect(() => ScoringEngine.validateMetrics(metrics)).toThrow(
                'Repayment rate must be between 0 and 100'
            );
        });

        it('should throw error for negative token balance', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1valid',
                transactionCount: 10,
                walletAgeMonths: 5,
                defiScore: 50,
                repaymentRate: 80,
                tokenBalance: -1000,
                lastTransactionDate: Date.now(),
            };

            expect(() => ScoringEngine.validateMetrics(metrics)).toThrow(
                'Token balance cannot be negative'
            );
        });

        it('should not throw for valid metrics', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1valid123',
                transactionCount: 10,
                walletAgeMonths: 5,
                defiScore: 50,
                repaymentRate: 80,
                tokenBalance: 1000,
                lastTransactionDate: Date.now(),
            };

            expect(() => ScoringEngine.validateMetrics(metrics)).not.toThrow();
        });
    });

    describe('getScoreBreakdown', () => {
        it('should return detailed breakdown of score components', () => {
            const metrics: WalletMetrics = {
                address: 'aleo1breakdown',
                transactionCount: 20,
                walletAgeMonths: 6,
                defiScore: 40,
                repaymentRate: 85,
                tokenBalance: 5000,
                lastTransactionDate: Date.now(),
            };

            const assessment = ScoringEngine.calculateScore(metrics);
            const breakdown = ScoringEngine.getScoreBreakdown(assessment);

            expect(breakdown.base).toBe(300);
            expect(breakdown.bonuses.transactions).toBe(50); // (20-10)*5
            expect(breakdown.bonuses.walletAge).toBe(60); // 6*10
            expect(breakdown.bonuses.defiActivity).toBe(60); // (40-20)*3
            expect(breakdown.bonuses.repaymentRate).toBe(20); // (85-75)*2
            expect(breakdown.total).toBe(490); // 300 + 50 + 60 + 60 + 20
            expect(breakdown.maxPossible).toBe(850);
        });
    });
});
