/**
 * ProofScore SDK Demo
 * 
 * Demonstrates the complete credit scoring flow
 * Run with: node --loader ts-node/esm lib/sdk/demo.ts
 */

import { CreditScoreSDK } from './index';

async function main() {
    console.log('🚀 ProofScore SDK Demo\n');
    console.log('='.repeat(60));

    // Step 1: Initialize SDK
    console.log('\n📦 Step 1: Initialize SDK');
    const sdk = new CreditScoreSDK({
        chainId: 'testnet',
    });

    const testAddress = 'aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc';
    await sdk.init(testAddress);
    console.log(`✅ SDK initialized for: ${testAddress}`);

    // Step 2: Fetch wallet metrics
    console.log('\n📊 Step 2: Fetch Wallet Metrics');
    const metrics = await sdk.fetchWalletMetrics();
    console.log('✅ Metrics fetched:');
    console.log(`   • Transaction Count: ${metrics.transactionCount}`);
    console.log(`   • Wallet Age: ${metrics.walletAgeMonths} months`);
    console.log(`   • DeFi Score: ${metrics.defiScore}/100`);
    console.log(`   • Repayment Rate: ${metrics.repaymentRate}%`);
    console.log(`   • Token Balance: ${metrics.tokenBalance} ALEO`);

    // Step 3: Calculate credit score
    console.log('\n🎯 Step 3: Calculate Credit Score');
    const assessment = sdk.calculateScore(metrics);
    console.log('✅ Score calculated:');
    console.log(`   • Final Score: ${assessment.finalScore}/850`);
    console.log(`   • Risk Level: ${assessment.riskLevel.toUpperCase()}`);
    console.log(`   • Base Score: ${assessment.baseScore}`);
    console.log(`   • Bonus Points: ${assessment.bonusPoints}`);

    // Show breakdown
    const breakdown = sdk.getScoreBreakdown(assessment);
    console.log('\n📈 Score Breakdown:');
    console.log(`   • Transactions: +${breakdown.bonuses.transactions} points`);
    console.log(`   • Wallet Age: +${breakdown.bonuses.walletAge} points`);
    console.log(`   • DeFi Activity: +${breakdown.bonuses.defiActivity} points`);
    console.log(`   • Repayment Rate: +${breakdown.bonuses.repaymentRate} points`);

    // Step 4: Generate ZK proof
    console.log('\n🔐 Step 4: Generate Zero-Knowledge Proof');
    console.log('   ⏳ Generating proof (this takes 2-3 seconds)...');
    const proof = await sdk.generateProof(assessment);
    console.log('✅ Proof generated:');
    console.log(`   • Proof Hash: ${proof.proofHash.slice(0, 32)}...`);
    console.log(`   • Public Inputs: ${proof.publicInputs.length} values`);

    // Step 5: Issue credit (simulated)
    console.log('\n⛓️  Step 5: Issue Credit on Blockchain');
    console.log('   ⏳ Submitting transaction...');
    const mockPrivateKey = 'APrivateKey1...'; // Mock key for demo
    const result = await sdk.issueCredit(proof, mockPrivateKey);

    if (result.success) {
        console.log('✅ Credit issued successfully!');
        console.log(`   • Transaction ID: ${result.transactionId}`);
        console.log(`   • Explorer: ${sdk.getExplorerUrl(result.transactionId)}`);
        if (result.creditRecord) {
            console.log(`   • Credit Score: ${result.creditRecord.score}`);
            console.log(`   • Issued Block: ${result.creditRecord.issuedBlock}`);
        }
    } else {
        console.log(`❌ Credit issuance failed: ${result.error}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Demo completed!\n');
}

// Run demo
main().catch((error) => {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
});
