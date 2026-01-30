/**
 * ScoringEngine - Credit Score Calculation
 * 
 * Pure functions for calculating credit scores (300-850 scale)
 * Based on wallet metrics: transactions, age, DeFi activity, repayment rate
 * 
 * @module lib/sdk/ScoringEngine
 * @requires 100% test coverage (production-critical)
 */

import { SCORING_CONFIG, RISK_LEVELS } from '@/lib/constants';
import type { WalletMetrics, CreditAssessment, RiskLevel } from '@/types/sdk';

export class ScoringEngine {
    /**
     * Main scoring algorithm
     * Calculates credit score from wallet metrics
     * 
     * @param metrics - On-chain wallet metrics
     * @returns Credit assessment with 300-850 score
     * 
     * @example
     * const metrics = {
     *   address: 'aleo1...',
     *   transactionCount: 25,
     *   walletAgeMonths: 12,
     *   defiScore: 65,
     *   repaymentRate: 95,
     *   tokenBalance: 1000,
     *   lastTransactionDate: Date.now()
     * };
     * const assessment = ScoringEngine.calculateScore(metrics);
     * // assessment.finalScore => 725 (example)
     */
    static calculateScore(metrics: WalletMetrics): CreditAssessment {
        const baseScore = SCORING_CONFIG.BASE_SCORE;

        // Calculate individual bonuses
        const txBonus = this.calculateTransactionBonus(metrics.transactionCount);
        const ageBonus = this.calculateAgeBonus(metrics.walletAgeMonths);
        const defiBonus = this.calculateDeFiBonus(metrics.defiScore);
        const repaymentBonus = this.calculateRepaymentBonus(metrics.repaymentRate);

        // Sum all bonuses
        const totalBonus = txBonus + ageBonus + defiBonus + repaymentBonus;

        // Calculate final score (capped at 850)
        const finalScore = Math.min(SCORING_CONFIG.MAX_SCORE, baseScore + totalBonus);

        // Determine risk level
        const riskLevel = this.getRiskLevel(finalScore);

        return {
            address: metrics.address,
            metrics,
            baseScore,
            bonusPoints: totalBonus,
            finalScore: Math.round(finalScore),
            riskLevel,
            timestamp: Date.now(),
        };
    }

    /**
     * Calculate bonus points from transaction count
     * 
     * Formula: (count - threshold) * pointsPer (capped at maxPoints)
     * Threshold: 10 transactions
     * Points per transaction: 5
     * Max bonus: 100 points
     * 
     * @param count - Total transaction count
     * @returns Bonus points (0-100)
     * 
     * @example
     * calculateTransactionBonus(5)  => 0   (below threshold)
     * calculateTransactionBonus(15) => 25  (5 transactions above threshold)
     * calculateTransactionBonus(50) => 100 (capped at max)
     */
    private static calculateTransactionBonus(count: number): number {
        const config = SCORING_CONFIG.BONUSES.TRANSACTION_COUNT;
        if (count < config.threshold) return 0;

        const bonus = (count - config.threshold) * config.pointsPer;
        return Math.min(bonus, config.maxPoints);
    }

    /**
     * Calculate bonus points from wallet age
     * 
     * Formula: months * pointsPerMonth (capped at maxPoints)
     * Threshold: 3 months
     * Points per month: 10
     * Max bonus: 100 points
     * 
     * @param months - Wallet age in months
     * @returns Bonus points (0-100)
     * 
     * @example
     * calculateAgeBonus(1)  => 0   (below threshold)
     * calculateAgeBonus(6)  => 60  (6 months * 10 points)
     * calculateAgeBonus(24) => 100 (capped at max)
     */
    private static calculateAgeBonus(months: number): number {
        const config = SCORING_CONFIG.BONUSES.WALLET_AGE;
        if (months < config.threshold) return 0;

        const bonus = months * config.pointsPerMonth;
        return Math.min(bonus, config.maxPoints);
    }

    /**
     * Calculate bonus points from DeFi activity score
     * 
     * Formula: (score - threshold) * pointsPer (capped at maxPoints)
     * Threshold: 20 (0-100 scale)
     * Points per unit: 3
     * Max bonus: 100 points
     * 
     * @param score - DeFi activity score (0-100)
     * @returns Bonus points (0-100)
     * 
     * @example
     * calculateDeFiBonus(10) => 0   (below threshold)
     * calculateDeFiBonus(40) => 60  ((40-20) * 3)
     * calculateDeFiBonus(80) => 100 (capped at max)
     */
    private static calculateDeFiBonus(score: number): number {
        const config = SCORING_CONFIG.BONUSES.DEFI_SCORE;
        if (score < config.threshold) return 0;

        const bonus = (score - config.threshold) * config.pointsPer;
        return Math.min(bonus, config.maxPoints);
    }

    /**
     * Calculate bonus points from repayment rate
     * 
     * Formula: (rate - threshold) * pointsPer (capped at maxPoints)
     * Threshold: 75%
     * Points per percentage: 2 (higher weight for repayment)
     * Max bonus: 150 points
     * 
     * @param rate - Repayment rate percentage (0-100)
     * @returns Bonus points (0-150)
     * 
     * @example
     * calculateRepaymentBonus(50)  => 0   (below threshold)
     * calculateRepaymentBonus(85)  => 20  ((85-75) * 2)
     * calculateRepaymentBonus(100) => 50  ((100-75) * 2)
     */
    private static calculateRepaymentBonus(rate: number): number {
        const config = SCORING_CONFIG.BONUSES.REPAYMENT_RATE;
        if (rate < config.threshold) return 0;

        const bonus = (rate - config.threshold) * config.pointsPer;
        return Math.min(bonus, config.maxPoints);
    }

    /**
     * Determine risk level from credit score
     * 
     * Thresholds:
     * - Low Risk: >= 750
     * - Medium Risk: >= 500
     * - High Risk: < 500
     * 
     * @param score - Credit score (300-850)
     * @returns Risk level classification
     * 
     * @example
     * getRiskLevel(800) => 'low'
     * getRiskLevel(650) => 'medium'
     * getRiskLevel(400) => 'high'
     */
    private static getRiskLevel(score: number): RiskLevel {
        if (score >= RISK_LEVELS.LOW.minScore) return 'low';
        if (score >= RISK_LEVELS.MEDIUM.minScore) return 'medium';
        return 'high';
    }

    /**
     * Validate wallet metrics
     * Ensures all values are within acceptable ranges
     * 
     * @param metrics - Wallet metrics to validate
     * @throws Error if validation fails
     */
    static validateMetrics(metrics: WalletMetrics): void {
        if (!metrics.address || !metrics.address.startsWith('aleo1')) {
            throw new Error('Invalid Aleo address format');
        }

        if (metrics.transactionCount < 0) {
            throw new Error('Transaction count cannot be negative');
        }

        if (metrics.walletAgeMonths < 0) {
            throw new Error('Wallet age cannot be negative');
        }

        if (metrics.defiScore < 0 || metrics.defiScore > 100) {
            throw new Error('DeFi score must be between 0 and 100');
        }

        if (metrics.repaymentRate < 0 || metrics.repaymentRate > 100) {
            throw new Error('Repayment rate must be between 0 and 100');
        }

        if (metrics.tokenBalance < 0) {
            throw new Error('Token balance cannot be negative');
        }
    }

    /**
     * Get score breakdown for UI display
     * Shows how each factor contributes to final score
     * 
     * @param assessment - Credit assessment
     * @returns Detailed breakdown object
     */
    static getScoreBreakdown(assessment: CreditAssessment) {
        const { metrics } = assessment;

        return {
            base: SCORING_CONFIG.BASE_SCORE,
            bonuses: {
                transactions: this.calculateTransactionBonus(metrics.transactionCount),
                walletAge: this.calculateAgeBonus(metrics.walletAgeMonths),
                defiActivity: this.calculateDeFiBonus(metrics.defiScore),
                repaymentRate: this.calculateRepaymentBonus(metrics.repaymentRate),
            },
            total: assessment.finalScore,
            maxPossible: SCORING_CONFIG.MAX_SCORE,
        };
    }
}
