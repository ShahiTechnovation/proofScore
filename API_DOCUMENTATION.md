# ProofScore SDK API Reference

**Version**: 1.0.0  
**Production-Ready**: ✅  
**Test Coverage**: 90%+

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [CreditScoreSDK](#creditscoresdk)
4. [ScoringEngine](#scoringengine)
5. [DataAggregator](#dataaggregator)
6. [ProofGenerator](#proofgenerator)
7. [BlockchainAdapter](#blockchainadapter)
8. [Types](#types)
9. [Error Handling](#error-handling)
10. [Examples](#examples)

---

## Installation

```bash
npm install @proofscore/sdk
```

Or use directly in your project:

```typescript
import { CreditScoreSDK } from '@/lib/sdk';
```

---

## Quick Start

```typescript
import { CreditScoreSDK } from '@/lib/sdk';

// 1. Initialize SDK
const sdk = new CreditScoreSDK({
  chainId: 'mainnet',
  rpcUrl: 'https://api.explorer.aleo.org/v1',
  contractAddress: 'credit_score.aleo',
});

// 2. Connect wallet
await sdk.init('aleo1...');

// 3. Issue credit (one-liner)
const result = await sdk.issueCreditFlow(privateKey);

console.log(`Score: ${result.creditRecord?.score}`);
console.log(`TX: ${result.transactionId}`);
```

---

## CreditScoreSDK

Main orchestrator class that ties all components together.

### Constructor

```typescript
new CreditScoreSDK(config?: Partial<SDKConfig>)
```

**Parameters:**
- `config` (optional): SDK configuration
  - `rpcUrl`: Aleo RPC endpoint (default: mainnet)
  - `indexerUrl`: Aleo indexer endpoint (optional)
  - `contractAddress`: Credit score contract address
  - `chainId`: 'mainnet' | 'testnet'
  - `enableCache`: Enable LRU caching (default: true)
  - `cacheTTL`: Cache TTL in ms (default: 1 hour)

**Example:**
```typescript
const sdk = new CreditScoreSDK({
  chainId: 'testnet',
  enableCache: true,
});
```

---

### Methods

#### `init(userAddress: string): Promise<void>`

Initialize SDK with user's wallet address.

**Parameters:**
- `userAddress`: Aleo wallet address (must start with 'aleo1')

**Throws:**
- `SDKError` if address is invalid

**Example:**
```typescript
await sdk.init('aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc');
```

---

#### `fetchWalletMetrics(): Promise<WalletMetrics>`

Fetch on-chain metrics for the connected wallet.

**Returns:** `WalletMetrics` object containing:
- `address`: Wallet address
- `transactionCount`: Total transactions
- `walletAgeMonths`: Age in months
- `defiScore`: DeFi activity score (0-100)
- `repaymentRate`: Loan repayment rate (0-100%)
- `tokenBalance`: Token balance
- `lastTransactionDate`: Unix timestamp

**Caching:** Results cached for 1 hour

**Example:**
```typescript
const metrics = await sdk.fetchWalletMetrics();
console.log(`Transactions: ${metrics.transactionCount}`);
console.log(`Age: ${metrics.walletAgeMonths} months`);
```

---

#### `calculateScore(metrics: WalletMetrics): CreditAssessment`

Calculate credit score from wallet metrics.

**Parameters:**
- `metrics`: Wallet metrics object

**Returns:** `CreditAssessment` object containing:
- `address`: Wallet address
- `metrics`: Original metrics
- `baseScore`: Base score (300)
- `bonusPoints`: Total bonus points
- `finalScore`: Final score (300-850)
- `riskLevel`: 'low' | 'medium' | 'high'
- `timestamp`: Unix timestamp

**Example:**
```typescript
const assessment = sdk.calculateScore(metrics);
console.log(`Score: ${assessment.finalScore}`);
console.log(`Risk: ${assessment.riskLevel}`);
```

---

#### `generateProof(assessment: CreditAssessment): Promise<ZKProof>`

Generate zero-knowledge proof for credit assessment.

**Parameters:**
- `assessment`: Credit assessment object

**Returns:** `ZKProof` object containing:
- `proofHash`: SHA-256 hash of proof
- `publicInputs`: Array of public inputs
- `proof`: Groth16 proof components (a, b, c)

**Duration:** 2-3 seconds

**Example:**
```typescript
const proof = await sdk.generateProof(assessment);
console.log(`Proof: ${proof.proofHash.slice(0, 16)}...`);
```

---

#### `issueCredit(proof: ZKProof, privateKey: string): Promise<CreditIssuanceResult>`

Submit proof to blockchain and issue credit.

**Parameters:**
- `proof`: ZK proof object
- `privateKey`: User's Aleo private key

**Returns:** `CreditIssuanceResult` object containing:
- `success`: Boolean indicating success
- `transactionId`: Transaction ID
- `creditRecord`: Credit record (if successful)
- `error`: Error message (if failed)

**Example:**
```typescript
const result = await sdk.issueCredit(proof, privateKey);
if (result.success) {
  console.log(`TX: ${result.transactionId}`);
}
```

---

#### `issueCreditFlow(privateKey: string): Promise<CreditIssuanceResult>`

Complete end-to-end credit issuance flow.

**Parameters:**
- `privateKey`: User's Aleo private key

**Returns:** `CreditIssuanceResult`

**Duration:** ~10 seconds
- Fetch metrics: 1.5s
- Calculate score: 0.5s
- Generate proof: 2-3s
- Submit transaction: 2s

**Example:**
```typescript
const result = await sdk.issueCreditFlow(privateKey);
```

---

#### `fetchCreditScore(): Promise<number | null>`

Query existing credit score from blockchain.

**Returns:** Credit score or `null` if not found

**Example:**
```typescript
const score = await sdk.fetchCreditScore();
if (score) {
  console.log(`Existing score: ${score}`);
}
```

---

#### `getScoreBreakdown(assessment: CreditAssessment): ScoreBreakdown`

Get detailed breakdown of score components.

**Parameters:**
- `assessment`: Credit assessment object

**Returns:** Object containing:
- `base`: Base score (300)
- `bonuses`: Object with individual bonuses
  - `transactions`: Transaction bonus (0-100)
  - `walletAge`: Age bonus (0-100)
  - `defiActivity`: DeFi bonus (0-100)
  - `repaymentRate`: Repayment bonus (0-150)
- `total`: Final score
- `maxPossible`: Maximum score (850)

**Example:**
```typescript
const breakdown = sdk.getScoreBreakdown(assessment);
console.log(breakdown.bonuses);
// { transactions: 50, walletAge: 60, defiActivity: 60, repaymentRate: 20 }
```

---

#### `getExplorerUrl(txId: string): string`

Get transaction explorer URL.

**Parameters:**
- `txId`: Transaction ID

**Returns:** Explorer URL string

**Example:**
```typescript
const url = sdk.getExplorerUrl(result.transactionId);
console.log(`View on explorer: ${url}`);
```

---

#### `clearCache(): void`

Clear cached metrics for current user.

**Example:**
```typescript
sdk.clearCache();
```

---

#### `getConfig(): SDKConfig`

Get current SDK configuration.

**Returns:** SDK configuration object

---

#### `getUserAddress(): string | undefined`

Get current user's wallet address.

**Returns:** Address or `undefined` if not initialized

---

#### `static isWasmSupported(): boolean`

Check if WebAssembly is supported (required for ZK proofs).

**Returns:** `true` if WASM is supported

**Example:**
```typescript
if (CreditScoreSDK.isWasmSupported()) {
  console.log('ZK proofs supported!');
}
```

---

## ScoringEngine

Pure functions for credit score calculation.

### Methods

#### `static calculateScore(metrics: WalletMetrics): CreditAssessment`

Calculate credit score from wallet metrics.

**Algorithm:**
```
finalScore = baseScore (300) + bonuses
bonuses = txBonus + ageBonus + defiBonus + repaymentBonus
```

**Bonus Formulas:**
- **Transactions**: `(count - 10) * 5` (max: 100)
- **Wallet Age**: `months * 10` (max: 100)
- **DeFi Score**: `(score - 20) * 3` (max: 100)
- **Repayment Rate**: `(rate - 75) * 2` (max: 150)

**Risk Levels:**
- Low: ≥750
- Medium: ≥500
- High: <500

---

#### `static validateMetrics(metrics: WalletMetrics): void`

Validate wallet metrics.

**Throws:**
- Error if address is invalid
- Error if any metric is out of range

---

#### `static getScoreBreakdown(assessment: CreditAssessment): ScoreBreakdown`

Get detailed score breakdown.

---

## DataAggregator

Fetches on-chain metrics with caching.

### Constructor

```typescript
new DataAggregator(rpcUrl?: string, indexerUrl?: string)
```

---

### Methods

#### `fetchWalletMetrics(address: string): Promise<WalletMetrics>`

Fetch wallet metrics from blockchain.

**Caching:** 1-hour TTL

---

#### `clearCache(address: string): void`

Clear cache for specific address.

---

#### `clearAllCache(): void`

Clear all cached metrics.

---

#### `getCacheStats(): CacheStats`

Get cache statistics.

**Returns:**
- `size`: Current cache size
- `maxSize`: Maximum cache size
- `ttl`: Time-to-live in ms

---

## ProofGenerator

Generates zero-knowledge proofs.

### Methods

#### `generateProof(assessment: CreditAssessment): Promise<ZKProof>`

Generate Groth16 ZK-SNARK proof.

**Duration:** 2-3 seconds

---

#### `verifyProofLocally(proof: ZKProof): Promise<boolean>`

Verify proof before submission.

**Returns:** `true` if proof is valid

---

#### `estimateProofTime(): number`

Estimate proof generation time.

**Returns:** Estimated time in milliseconds

---

#### `static isWasmSupported(): boolean`

Check WebAssembly support.

---

## BlockchainAdapter

Handles Aleo blockchain interactions.

### Constructor

```typescript
new BlockchainAdapter(config: SDKConfig)
```

---

### Methods

#### `submitProof(proof: ZKProof, userAddress: string, privateKey: string): Promise<CreditIssuanceResult>`

Submit proof to blockchain.

---

#### `waitForConfirmation(txId: string): Promise<AleoTransaction>`

Wait for transaction confirmation.

**Polling:** Every 500ms for up to 10 seconds

---

#### `fetchCreditScore(address: string): Promise<number | null>`

Fetch credit score from blockchain.

---

#### `getExplorerUrl(txId: string): string`

Get transaction explorer URL.

---

#### `checkNetworkHealth(): Promise<boolean>`

Check if Aleo network is reachable.

---

## Types

### SDKConfig

```typescript
interface SDKConfig {
  rpcUrl: string;
  indexerUrl?: string;
  contractAddress: string;
  chainId: 'mainnet' | 'testnet';
  enableCache?: boolean;
  cacheTTL?: number;
}
```

### WalletMetrics

```typescript
interface WalletMetrics {
  address: string;
  transactionCount: number;
  walletAgeMonths: number;
  defiScore: number; // 0-100
  repaymentRate: number; // 0-100
  tokenBalance: number;
  lastTransactionDate: number; // Unix timestamp
}
```

### CreditAssessment

```typescript
interface CreditAssessment {
  address: string;
  metrics: WalletMetrics;
  baseScore: number;
  bonusPoints: number;
  finalScore: number; // 300-850
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: number;
}
```

### ZKProof

```typescript
interface ZKProof {
  proofHash: string;
  publicInputs: string[];
  proof: {
    a: string[];
    b: string[][];
    c: string[];
  };
}
```

### CreditIssuanceResult

```typescript
interface CreditIssuanceResult {
  success: boolean;
  transactionId: string;
  creditRecord?: CreditRecord;
  error?: string;
}
```

---

## Error Handling

### Error Types

```typescript
class SDKError extends Error {
  code: string;
  details?: unknown;
}

class RPCError extends SDKError {}
class ProofGenerationError extends SDKError {}
class TransactionError extends SDKError {}
```

### Example

```typescript
try {
  const result = await sdk.issueCreditFlow(privateKey);
} catch (error) {
  if (error instanceof SDKError) {
    console.error(`SDK Error [${error.code}]:`, error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Examples

### Complete Flow

```typescript
import { CreditScoreSDK } from '@/lib/sdk';

async function issueCredit() {
  // 1. Initialize
  const sdk = new CreditScoreSDK({ chainId: 'mainnet' });
  await sdk.init('aleo1...');

  // 2. Fetch metrics
  const metrics = await sdk.fetchWalletMetrics();
  console.log(`Transactions: ${metrics.transactionCount}`);

  // 3. Calculate score
  const assessment = sdk.calculateScore(metrics);
  console.log(`Score: ${assessment.finalScore}`);

  // 4. Get breakdown
  const breakdown = sdk.getScoreBreakdown(assessment);
  console.log('Bonuses:', breakdown.bonuses);

  // 5. Generate proof
  const proof = await sdk.generateProof(assessment);
  console.log(`Proof: ${proof.proofHash.slice(0, 16)}...`);

  // 6. Issue credit
  const result = await sdk.issueCredit(proof, privateKey);
  
  if (result.success) {
    console.log(`Success! TX: ${result.transactionId}`);
    console.log(`Explorer: ${sdk.getExplorerUrl(result.transactionId)}`);
  }
}
```

### Query Existing Score

```typescript
const sdk = new CreditScoreSDK();
await sdk.init('aleo1...');

const score = await sdk.fetchCreditScore();
if (score) {
  console.log(`Your credit score: ${score}`);
} else {
  console.log('No credit score found. Issue one first!');
}
```

---

**API Version**: 1.0.0  
**Last Updated**: 2026-01-30  
**License**: MIT
