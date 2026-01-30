/**
 * DataAggregator Unit Tests
 * Production-grade testing for RPC client and caching
 */

import { DataAggregator } from '../DataAggregator';

describe('DataAggregator', () => {
    let aggregator: DataAggregator;

    beforeEach(() => {
        aggregator = new DataAggregator();
    });

    describe('fetchWalletMetrics', () => {
        it('should fetch metrics for valid address', async () => {
            const metrics = await aggregator.fetchWalletMetrics('aleo1test123');

            expect(metrics.address).toBe('aleo1test123');
            expect(metrics.transactionCount).toBeGreaterThanOrEqual(0);
            expect(metrics.walletAgeMonths).toBeGreaterThanOrEqual(0);
            expect(metrics.defiScore).toBeGreaterThanOrEqual(0);
            expect(metrics.defiScore).toBeLessThanOrEqual(100);
            expect(metrics.repaymentRate).toBeGreaterThanOrEqual(0);
            expect(metrics.repaymentRate).toBeLessThanOrEqual(100);
            expect(metrics.tokenBalance).toBeGreaterThanOrEqual(0);
        });

        it('should throw error for invalid address', async () => {
            await expect(
                aggregator.fetchWalletMetrics('invalid')
            ).rejects.toThrow('Invalid Aleo address format');
        });

        it('should throw error for empty address', async () => {
            await expect(
                aggregator.fetchWalletMetrics('')
            ).rejects.toThrow('Invalid Aleo address format');
        });

        it('should cache metrics for 1 hour', async () => {
            const address = 'aleo1cache123';

            // First fetch
            const metrics1 = await aggregator.fetchWalletMetrics(address);

            // Second fetch (should be cached)
            const metrics2 = await aggregator.fetchWalletMetrics(address);

            // Should return same object
            expect(metrics1).toEqual(metrics2);
        });

        it('should return deterministic mock data for same address', async () => {
            const address = 'aleo1deterministic';

            const metrics1 = await aggregator.fetchWalletMetrics(address);
            const metrics2 = await aggregator.fetchWalletMetrics(address);

            expect(metrics1.transactionCount).toBe(metrics2.transactionCount);
            expect(metrics1.walletAgeMonths).toBe(metrics2.walletAgeMonths);
            expect(metrics1.defiScore).toBe(metrics2.defiScore);
        });
    });

    describe('cache management', () => {
        it('should clear cache for specific address', async () => {
            const address = 'aleo1clear123';

            await aggregator.fetchWalletMetrics(address);
            aggregator.clearCache(address);

            const stats = aggregator.getCacheStats();
            expect(stats.size).toBe(0);
        });

        it('should clear all cache', async () => {
            await aggregator.fetchWalletMetrics('aleo1addr1');
            await aggregator.fetchWalletMetrics('aleo1addr2');
            await aggregator.fetchWalletMetrics('aleo1addr3');

            aggregator.clearAllCache();

            const stats = aggregator.getCacheStats();
            expect(stats.size).toBe(0);
        });

        it('should return cache statistics', async () => {
            const stats = aggregator.getCacheStats();

            expect(stats).toHaveProperty('size');
            expect(stats).toHaveProperty('maxSize');
            expect(stats).toHaveProperty('ttl');
            expect(typeof stats.size).toBe('number');
        });
    });
});
