/**
 * Simple SDK Integration Test
 * Verifies the complete SDK flow works
 */

import { CreditScoreSDK } from '../CreditScoreSDK';

describe('SDK Integration', () => {
    it('should create SDK instance', () => {
        const sdk = new CreditScoreSDK();
        expect(sdk).toBeDefined();
    });

    it('should initialize with user address', async () => {
        const sdk = new CreditScoreSDK();
        await sdk.init('aleo1test123456789');
        expect(sdk.getUserAddress()).toBe('aleo1test123456789');
    });

    it('should fetch mock metrics in development', async () => {
        const sdk = new CreditScoreSDK();
        await sdk.init('aleo1test123456789');

        const metrics = await sdk.fetchWalletMetrics();

        expect(metrics.address).toBe('aleo1test123456789');
        expect(metrics.transactionCount).toBeGreaterThanOrEqual(0);
        expect(metrics.walletAgeMonths).toBeGreaterThanOrEqual(0);
    });
});
