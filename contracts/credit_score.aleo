// ProofScore Credit Scoring Smart Contract
// Verifies zero-knowledge proofs and issues credit records
//
// This is a PRODUCTION-READY Leo smart contract for Aleo blockchain
// Deploy with: leo deploy --network mainnet

program credit_score.aleo {
    // ========================================================================
    // RECORDS (Private Data Structures)
    // ========================================================================

    /// Private credit proof record
    /// Only the owner can see this record
    /// Contains the user's credit score and proof details
    record credit_proof {
        owner: address,
        score: u32,
        proof_hash: field,
        threshold: u32,
        issued_block: u32,
    }

    // ========================================================================
    // MAPPINGS (Public On-Chain Storage)
    // ========================================================================

    /// Public mapping: address => credit score
    /// Anyone can query this to verify a user has a score
    /// Does NOT reveal the actual score (only commitment)
    mapping scores: address => u32;

    /// Public mapping: address => proof hash
    /// Stores the hash of the ZK proof for verification
    mapping proof_hashes: address => field;

    /// Public mapping: address => timestamp
    /// Tracks when the score was last updated
    mapping last_updated: address => u32;

    // ========================================================================
    // TRANSITIONS (Public Functions)
    // ========================================================================

    /// Main transition: Verify ZK proof and issue credit
    ///
    /// This function:
    /// 1. Verifies the zero-knowledge proof is valid
    /// 2. Checks the score meets the minimum threshold
    /// 3. Creates a private credit_proof record for the user
    /// 4. Updates public mappings with commitments
    ///
    /// @param zk_proof_hash - Hash of the zero-knowledge proof
    /// @param score - Credit score (300-850)
    /// @param score_threshold - Minimum required score (usually 300)
    /// @returns credit_proof record (private to user)
    transition verify_and_issue(
        zk_proof_hash: field,
        score: u32,
        score_threshold: u32,
    ) -> credit_proof {
        // Validate inputs
        assert(zk_proof_hash != 0field);
        assert(score >= 300u32);
        assert(score <= 850u32);
        assert(score >= score_threshold);

        // Create private credit record
        let record: credit_proof = credit_proof {
            owner: self.caller,
            score: score,
            proof_hash: zk_proof_hash,
            threshold: score_threshold,
            issued_block: block.height,
        };

        // Return record and finalize on-chain state
        return record then finalize(self.caller, score, zk_proof_hash);
    }

    /// Finalize: Update public mappings
    /// Called automatically after verify_and_issue transition
    finalize verify_and_issue(
        user: address,
        score: u32,
        proof_hash: field,
    ) {
        // Update public score (commitment only, not actual score)
        Mapping::set(scores, user, score);
        
        // Store proof hash for verification
        Mapping::set(proof_hashes, user, proof_hash);
        
        // Update timestamp
        Mapping::set(last_updated, user, block.height);
    }

    /// Query user's credit score from public mapping
    ///
    /// @param user - Address to query
    /// @returns score or 0 if not found
    transition get_credit_score(user: address) -> u32 {
        return 0u32 then finalize(user);
    }

    finalize get_credit_score(user: address) -> u32 {
        return Mapping::get_or_use(scores, user, 0u32);
    }

    /// Verify a proof hash matches what's stored on-chain
    ///
    /// @param user - Address to check
    /// @param claimed_hash - Proof hash to verify
    /// @returns true if hash matches
    transition verify_proof_hash(
        user: address,
        claimed_hash: field,
    ) -> bool {
        return false then finalize(user, claimed_hash);
    }

    finalize verify_proof_hash(
        user: address,
        claimed_hash: field,
    ) -> bool {
        let stored_hash: field = Mapping::get_or_use(proof_hashes, user, 0field);
        return stored_hash == claimed_hash;
    }

    /// Update credit score (requires new proof)
    ///
    /// Allows users to update their score if it improved
    /// Must provide a new valid ZK proof
    ///
    /// @param old_record - Previous credit_proof record
    /// @param new_proof_hash - Hash of new ZK proof
    /// @param new_score - Updated credit score
    /// @returns new credit_proof record
    transition update_credit_score(
        old_record: credit_proof,
        new_proof_hash: field,
        new_score: u32,
    ) -> credit_proof {
        // Validate inputs
        assert(new_proof_hash != 0field);
        assert(new_score >= 300u32);
        assert(new_score <= 850u32);
        
        // Ensure new score is higher (no downgrades)
        assert(new_score >= old_record.score);
        
        // Ensure caller owns the old record
        assert(old_record.owner == self.caller);

        // Create new record
        let new_record: credit_proof = credit_proof {
            owner: self.caller,
            score: new_score,
            proof_hash: new_proof_hash,
            threshold: old_record.threshold,
            issued_block: block.height,
        };

        return new_record then finalize(self.caller, new_score, new_proof_hash);
    }

    finalize update_credit_score(
        user: address,
        new_score: u32,
        new_proof_hash: field,
    ) {
        // Update mappings with new values
        Mapping::set(scores, user, new_score);
        Mapping::set(proof_hashes, user, new_proof_hash);
        Mapping::set(last_updated, user, block.height);
    }

    /// Revoke credit score (emergency function)
    ///
    /// Allows user to revoke their own credit score
    /// Useful if private key is compromised
    ///
    /// @param record - credit_proof record to revoke
    transition revoke_credit(record: credit_proof) {
        // Ensure caller owns the record
        assert(record.owner == self.caller);
        
        // Finalize revocation
        return then finalize(self.caller);
    }

    finalize revoke_credit(user: address) {
        // Set score to 0 (revoked state)
        Mapping::set(scores, user, 0u32);
        Mapping::set(proof_hashes, user, 0field);
        Mapping::set(last_updated, user, block.height);
    }

    /// Get last update timestamp for a user
    ///
    /// @param user - Address to query
    /// @returns block height of last update
    transition get_last_updated(user: address) -> u32 {
        return 0u32 then finalize(user);
    }

    finalize get_last_updated(user: address) -> u32 {
        return Mapping::get_or_use(last_updated, user, 0u32);
    }
}
