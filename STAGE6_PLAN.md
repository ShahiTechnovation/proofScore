# Stage 6: Blockchain Integration - Implementation Plan

**Progress**: 75% → 85% (10% to complete)  
**Duration**: ~45-60 minutes  
**Status**: Ready to implement

---

## 🎯 Objectives

### 1. **Real Aleo Wallet Integration** 
- Replace mock wallet with real Aleo wallet support
- Integrate Leo Wallet, Puzzle Wallet, or similar
- Handle wallet connection/disconnection events
- Persist wallet state across sessions
- Support account switching

### 2. **Real RPC Integration**
- Connect to Aleo mainnet/testnet RPC endpoints
- Fetch real on-chain data (transactions, programs, mappings)
- Implement proper error handling for network issues
- Add retry logic with exponential backoff
- Cache RPC responses to reduce API calls

### 3. **Smart Contract Deployment**
- Deploy `credit_score.aleo` to Aleo testnet
- Verify contract deployment
- Test all contract transitions
- Document contract address
- Set up environment variables

### 4. **Real Transaction Submission**
- Build and sign transactions using Aleo SDK
- Submit transactions to the network
- Poll for transaction confirmation
- Extract credit records from confirmed transactions
- Handle transaction failures gracefully

### 5. **ZK Proof Integration**
- Generate real ZK proofs using snarkjs
- Load circuit files (wasm, zkey, verification key)
- Verify proofs locally before submission
- Optimize proof generation performance
- Handle proof generation errors

---

## 📋 Implementation Checklist

### Phase 1: Wallet Integration (15 min)

- [ ] Install Aleo wallet SDK
  ```bash
  npm install @demox-labs/aleo-wallet-adapter-react @demox-labs/aleo-wallet-adapter-wallets
  ```

- [ ] Create `WalletAdapter` component
  - [ ] Wrap app with wallet adapter provider
  - [ ] Support multiple wallet types (Leo, Puzzle)
  - [ ] Handle wallet events (connect, disconnect, accountChanged)
  - [ ] Update `WalletProvider` to use real wallet

- [ ] Update Navigation component
  - [ ] Show real wallet connection UI
  - [ ] Display connected wallet address
  - [ ] Add wallet selector dropdown

- [ ] Test wallet connection flow
  - [ ] Connect wallet
  - [ ] Switch accounts
  - [ ] Disconnect wallet
  - [ ] Reconnect on page reload

### Phase 2: RPC Integration (15 min)

- [ ] Update `lib/aleo/index.ts`
  - [ ] Replace mock RPC with real Aleo RPC client
  - [ ] Implement `fetchTransactionCount()`
  - [ ] Implement `fetchWalletAge()`
  - [ ] Implement `fetchProgramState()`
  - [ ] Add error handling and retries

- [ ] Update `DataAggregator`
  - [ ] Use real RPC calls instead of mocks
  - [ ] Keep LRU caching for performance
  - [ ] Add network health checks
  - [ ] Handle RPC rate limits

- [ ] Test RPC integration
  - [ ] Fetch real wallet data
  - [ ] Verify caching works
  - [ ] Test error scenarios (network down, invalid address)

### Phase 3: Smart Contract Deployment (10 min)

- [ ] Deploy contract to Aleo testnet
  ```bash
  # Using Leo CLI
  leo deploy --network testnet
  ```

- [ ] Verify deployment
  - [ ] Check contract on Aleo Explorer
  - [ ] Test `verify_and_issue` transition
  - [ ] Test `get_credit_score` transition
  - [ ] Document contract address

- [ ] Update environment variables
  ```env
  NEXT_PUBLIC_CONTRACT_ADDRESS=credit_score.aleo
  NEXT_PUBLIC_ALEO_RPC=https://api.explorer.aleo.org/v1
  NEXT_PUBLIC_CHAIN_ID=testnet
  ```

### Phase 4: Transaction Submission (15 min)

- [ ] Update `BlockchainAdapter`
  - [ ] Use real Aleo SDK for transaction building
  - [ ] Sign transactions with connected wallet
  - [ ] Submit to network via RPC
  - [ ] Poll for confirmation (with timeout)
  - [ ] Extract credit records from transaction

- [ ] Update `CreditIssuanceModal`
  - [ ] Show real transaction progress
  - [ ] Display transaction ID with Explorer link
  - [ ] Handle transaction failures
  - [ ] Add retry logic

- [ ] Test transaction flow
  - [ ] Submit test transaction
  - [ ] Verify on Aleo Explorer
  - [ ] Check credit record creation
  - [ ] Test error scenarios

### Phase 5: ZK Proof Generation (10 min)

- [ ] Generate circuit files
  ```bash
  # Using snarkjs
  snarkjs groth16 setup circuit.circom pot12_final.ptau circuit_0000.zkey
  snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey
  snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
  ```

- [ ] Add circuit files to project
  - [ ] `public/circuits/credit_score.wasm`
  - [ ] `public/circuits/credit_score.zkey`
  - [ ] `public/circuits/verification_key.json`

- [ ] Update `ProofGenerator`
  - [ ] Load circuit files
  - [ ] Generate real proofs using snarkjs
  - [ ] Verify proofs locally
  - [ ] Handle proof generation errors

- [ ] Test proof generation
  - [ ] Generate proof for test data
  - [ ] Verify proof locally
  - [ ] Submit proof to contract
  - [ ] Verify on-chain

---

## 🔧 Technical Implementation

### 1. Wallet Adapter Setup

```typescript
// lib/providers/AleoWalletProvider.tsx
import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { LeoWalletAdapter, PuzzleWalletAdapter } from '@demox-labs/aleo-wallet-adapter-wallets';

const wallets = [
  new LeoWalletAdapter(),
  new PuzzleWalletAdapter(),
];

export function AleoWalletProvider({ children }: { children: ReactNode }) {
  return (
    <WalletProvider wallets={wallets} autoConnect>
      {children}
    </WalletProvider>
  );
}
```

### 2. Real RPC Client

```typescript
// lib/aleo/rpc.ts
import { AleoNetworkClient } from '@aleohq/sdk';

export class AleoRPC {
  private client: AleoNetworkClient;
  
  constructor(rpcUrl: string) {
    this.client = new AleoNetworkClient(rpcUrl);
  }
  
  async getTransactionCount(address: string): Promise<number> {
    const transactions = await this.client.getTransactions(address);
    return transactions.length;
  }
  
  async getProgramState(programId: string, mapping: string, key: string) {
    return await this.client.getProgramMappingValue(programId, mapping, key);
  }
}
```

### 3. Transaction Builder

```typescript
// lib/aleo/transactions.ts
import { Transaction, ProgramManager } from '@aleohq/sdk';

export async function buildCreditIssuanceTransaction(
  programId: string,
  score: number,
  proofHash: string,
  privateKey: string
) {
  const programManager = new ProgramManager();
  
  const transaction = await programManager.buildTransaction(
    programId,
    'verify_and_issue',
    [score.toString(), proofHash],
    privateKey
  );
  
  return transaction;
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Test wallet connection/disconnection
- [ ] Test RPC client methods
- [ ] Test transaction building
- [ ] Test proof generation

### Integration Tests
- [ ] Test end-to-end credit issuance flow
- [ ] Test with real testnet
- [ ] Test error scenarios
- [ ] Test network failures

### Manual Testing
- [ ] Connect real Aleo wallet
- [ ] Generate credit score with real data
- [ ] Verify transaction on Explorer
- [ ] Check credit record on-chain

---

## 📊 Success Criteria

- ✅ Real Aleo wallet connects successfully
- ✅ RPC fetches real on-chain data
- ✅ Smart contract deployed to testnet
- ✅ Transactions submit and confirm on-chain
- ✅ ZK proofs generate and verify correctly
- ✅ End-to-end flow works on testnet
- ✅ All error scenarios handled gracefully
- ✅ Performance targets met (10s total flow)

---

## 🚨 Potential Challenges

### Challenge 1: Aleo SDK Stability
- **Issue**: Aleo SDK may be in beta/unstable
- **Solution**: Use stable version, implement fallbacks, add extensive error handling

### Challenge 2: RPC Rate Limits
- **Issue**: Public RPC may have rate limits
- **Solution**: Implement caching, add retry logic, consider running own node

### Challenge 3: Proof Generation Performance
- **Issue**: ZK proof generation may be slow in browser
- **Solution**: Use WebAssembly, optimize circuit, show progress indicator

### Challenge 4: Transaction Fees
- **Issue**: Users need Aleo credits for gas
- **Solution**: Document requirements, add balance check, provide testnet faucet link

---

## 📁 Files to Create/Modify

### Create
```
lib/
├── providers/
│   └── AleoWalletProvider.tsx   (new) - Real wallet adapter
├── aleo/
│   ├── rpc.ts                    (new) - Real RPC client
│   └── transactions.ts           (new) - Transaction builder
└── circuits/
    └── loader.ts                 (new) - Circuit file loader

public/circuits/
├── credit_score.wasm             (new) - Circuit WASM
├── credit_score.zkey             (new) - Proving key
└── verification_key.json         (new) - Verification key
```

### Modify
```
lib/
├── providers/
│   └── WalletProvider.tsx        (update) - Use real wallet
├── sdk/
│   ├── DataAggregator.ts         (update) - Use real RPC
│   ├── ProofGenerator.ts         (update) - Use real snarkjs
│   └── BlockchainAdapter.ts      (update) - Use real transactions
components/
└── landing/
    └── Navigation.tsx            (update) - Real wallet UI
```

---

## 🎯 Stage 6 Deliverables

1. **Real Wallet Integration** - Users can connect Leo/Puzzle wallet
2. **Live Blockchain Data** - Fetch real metrics from Aleo network
3. **Deployed Smart Contract** - Contract live on Aleo testnet
4. **Real Transactions** - Submit and confirm transactions on-chain
5. **ZK Proof Generation** - Generate real Groth16 proofs
6. **End-to-End Flow** - Complete credit issuance on testnet
7. **Documentation** - Updated with testnet addresses and instructions

---

## 📈 Progress Tracking

- [ ] Phase 1: Wallet Integration (0/4 tasks)
- [ ] Phase 2: RPC Integration (0/3 tasks)
- [ ] Phase 3: Contract Deployment (0/4 tasks)
- [ ] Phase 4: Transaction Submission (0/4 tasks)
- [ ] Phase 5: ZK Proof Generation (0/4 tasks)

**Overall Progress**: 0% → Target: 100%

---

**Ready to implement Stage 6!** 🚀

Let's build real blockchain integration and make ProofScore production-ready on Aleo testnet!
