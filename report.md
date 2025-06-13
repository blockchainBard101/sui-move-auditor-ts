# 🛡️ Move Smart Contract Security Audit Report

**Generated:** 2025-06-13T16:48:53.057Z
**Files Audited:** 4
**Total Findings:** 56

## 📊 Executive Summary

| Severity | Count | Priority |
|----------|-------|----------|
| 🔴 CRITICAL | 5 | Immediate |
| 🟠 HIGH | 14 | High |
| 🟡 MEDIUM | 24 | Medium |
| 🔵 LOW | 13 | Low |

⚠️ **CRITICAL ISSUES FOUND** - Immediate attention required!

## 🔍 Detailed Findings

### 1. 🔴 Unprotected Administrative Function

**Severity:** CRITICAL
**Category:** Access Control
**File:** test/sources/defi.move
**Line:** 136
**Confidence:** MEDIUM

**Description:** Administrative function lacks proper access control: public fun update_interest_rate<T>(

**Code:**
```move
   134:     }
   135: 
→  136:     public fun update_interest_rate<T>(
   137:         pool: &mut LendingPool<T>,
   138:         new_rate: u64,
```

**Recommendation:** Add administrator capability checks, owner verification, or role-based access control

---

### 2. 🔴 Unprotected Administrative Function

**Severity:** CRITICAL
**Category:** Access Control
**File:** test/sources/defi.move
**Line:** 171
**Confidence:** MEDIUM

**Description:** Administrative function lacks proper access control: public fun update_oracle_price(new_price: u64): u64 {

**Code:**
```move
   169:     }
   170: 
→  171:     public fun update_oracle_price(new_price: u64): u64 {
   172:         new_price
   173:     }
```

**Recommendation:** Add administrator capability checks, owner verification, or role-based access control

---

### 3. 🔴 Unprotected Administrative Function

**Severity:** CRITICAL
**Category:** Access Control
**File:** test/sources/nft.move
**Line:** 191
**Confidence:** MEDIUM

**Description:** Administrative function lacks proper access control: public fun update_marketplace_fees(

**Code:**
```move
   189: }
   190: 
→  191: public fun update_marketplace_fees(
   192:     fees: &mut MarketplaceFees,
   193:     new_fee: u64,
```

**Recommendation:** Add administrator capability checks, owner verification, or role-based access control

---

### 4. 🔴 Price Manipulation Risk

**Severity:** CRITICAL
**Category:** Economic Vulnerability
**File:** test/sources/token_contract.move
**Line:** 67
**Confidence:** MEDIUM

**Description:** Direct price calculation from reserves vulnerable to flash loan attacks: reserve_a

**Code:**
```move
    65: 
    66:     public fun calculate_price(reserve_a: u64, reserve_b: u64): u64 {
→   67:         reserve_a / reserve_b
    68:     }
    69: 
```

**Recommendation:** Use time-weighted average price (TWAP) or external price oracles

---

### 5. 🔴 Unprotected Administrative Function

**Severity:** CRITICAL
**Category:** Access Control
**File:** test/sources/token_contract.move
**Line:** 53
**Confidence:** MEDIUM

**Description:** Administrative function lacks proper access control: public fun admin_set_supply(cap: &mut TokenCap, new_supply: u64) {

**Code:**
```move
    51:     }
    52: 
→   53:     public fun admin_set_supply(cap: &mut TokenCap, new_supply: u64) {
    54:         cap.total_supply = new_supply;
    55:     }
```

**Recommendation:** Add administrator capability checks, owner verification, or role-based access control

---

### 6. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/defi.move
**Line:** 58
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: input_amount / reserve_a

**Code:**
```move
    56:         let reserve_a = balance::value(&pool.reserve_a);
    57:         let reserve_b = balance::value(&pool.reserve_b);
→   58:         let output_amount = reserve_b * input_amount / reserve_a;
    59:         let new_reserve_b = reserve_b - output_amount;
    60:         balance::join(&mut pool.reserve_a, coin::into_balance(input));
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 7. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/defi.move
**Line:** 133
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: time / 10000

**Code:**
```move
   131: 
   132:     public fun calculate_interest(principal: u64, rate: u64, time: u64): u64 {
→  133:         principal * rate * time / 10000
   134:     }
   135: 
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 8. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/defi.move
**Line:** 151
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: collateral_price / 100

**Code:**
```move
   149:         ctx: &mut TxContext
   150:     ): Coin<T> {
→  151:         let liquidation_threshold = debt_amount * collateral_price / 100;
   152:         pool.total_borrowed = pool.total_borrowed - debt_amount;
   153:         coin::take(&mut pool.total_deposits, liquidation_threshold, ctx)
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 9. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/nft.move
**Line:** 112
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: platform_fee / 10000

**Code:**
```move
   110:     
   111:     let payment_amount = coin::value(&payment);
→  112:     let platform_fee_amount = price * fees.platform_fee / 10000;
   113:     let seller_amount = price - platform_fee_amount;
   114:     
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 10. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/nft.move
**Line:** 228
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: royalty_rate / 10000

**Code:**
```move
   226: 
   227: public fun calculate_royalty(sale_price: u64, royalty_rate: u64): u64 {
→  228:     sale_price * royalty_rate / 10000
   229: }
   230: 
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 11. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/nft.move
**Line:** 239
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: royalty_rate / 10000

**Code:**
```move
   237: ) {
   238:     let sale_price = coin::value(&payment);
→  239:     let royalty = sale_price * collection.royalty_rate / 10000;
   240:     let seller_amount = sale_price - royalty;
   241:     
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 12. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/token_contract.move
**Line:** 46
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: amount / 100

**Code:**
```move
    44:     ) {
    45:         let new_balance = balance::value(&from_balance.balance) - amount;
→   46:         let fee = amount / 100;
    47:         let total_deduction = amount + fee;
    48:         let coins = coin::take(&mut from_balance.balance, total_deduction, ctx);
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 13. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/token_contract.move
**Line:** 67
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: reserve_a / reserve_b

**Code:**
```move
    65: 
    66:     public fun calculate_price(reserve_a: u64, reserve_b: u64): u64 {
→   67:         reserve_a / reserve_b
    68:     }
    69: 
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 14. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/token_contract.move
**Line:** 80
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: amount / 100

**Code:**
```move
    78:     public fun calculate_fee(amount: u64): u64 {
    79:         if (amount > 1000000) {
→   80:             amount / 100
    81:         } else {
    82:             amount / 1000
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 15. 🟠 Unchecked Division

**Severity:** HIGH
**Category:** Integer Operations
**File:** test/sources/token_contract.move
**Line:** 82
**Confidence:** MEDIUM

**Description:** Division operation without zero-check protection: amount / 1000

**Code:**
```move
    80:             amount / 100
    81:         } else {
→   82:             amount / 1000
    83:         }
    84:     }
```

**Recommendation:** Add division by zero checks with assert! statements

---

### 16. 🟠 Potential Missing Access Control

**Severity:** HIGH
**Category:** Access Control
**File:** test/sources/token_contract.move
**Line:** 86
**Confidence:** MEDIUM

**Description:** Public function may lack proper access control mechanisms: unsafe_transfer

**Code:**
```move
    84:     }
    85: 
→   86:     public fun unsafe_transfer(coins: Coin<TOKEN>, to: address) {
    87:         unsafe_direct_transfer(coins, to);
    88:     }
```

**Recommendation:** Add capability parameters, owner checks, or other access control mechanisms

---

### 17. 🟠 Unsafe Function Usage

**Severity:** HIGH
**Category:** Dangerous Patterns
**File:** test/sources/token_contract.move
**Line:** 86
**Confidence:** MEDIUM

**Description:** Usage of unsafe function detected: unsafe_

**Code:**
```move
    84:     }
    85: 
→   86:     public fun unsafe_transfer(coins: Coin<TOKEN>, to: address) {
    87:         unsafe_direct_transfer(coins, to);
    88:     }
```

**Recommendation:** Review unsafe function usage and consider safer alternatives

---

### 18. 🟠 Unsafe Function Usage

**Severity:** HIGH
**Category:** Dangerous Patterns
**File:** test/sources/token_contract.move
**Line:** 87
**Confidence:** MEDIUM

**Description:** Usage of unsafe function detected: unsafe_

**Code:**
```move
    85: 
    86:     public fun unsafe_transfer(coins: Coin<TOKEN>, to: address) {
→   87:         unsafe_direct_transfer(coins, to);
    88:     }
    89: 
```

**Recommendation:** Review unsafe function usage and consider safer alternatives

---

### 19. 🟠 Unsafe Function Usage

**Severity:** HIGH
**Category:** Dangerous Patterns
**File:** test/sources/token_contract.move
**Line:** 90
**Confidence:** MEDIUM

**Description:** Usage of unsafe function detected: unsafe_

**Code:**
```move
    88:     }
    89: 
→   90:     fun unsafe_direct_transfer(coins: Coin<TOKEN>, to: address) {
    91:         transfer::public_transfer(coins, to);
    92:     }
```

**Recommendation:** Review unsafe function usage and consider safer alternatives

---

### 20. 🟡 Unchecked Multiplication

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/defi.move
**Line:** 58
**Confidence:** MEDIUM

**Description:** Multiplication operation without overflow protection: output_amount = reserve_b * input_amount

**Code:**
```move
    56:         let reserve_a = balance::value(&pool.reserve_a);
    57:         let reserve_b = balance::value(&pool.reserve_b);
→   58:         let output_amount = reserve_b * input_amount / reserve_a;
    59:         let new_reserve_b = reserve_b - output_amount;
    60:         balance::join(&mut pool.reserve_a, coin::into_balance(input));
```

**Recommendation:** Add overflow checks with assert! statements

---

### 21. 🟡 Unchecked Subtraction

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/defi.move
**Line:** 59
**Confidence:** MEDIUM

**Description:** Subtraction operation without underflow protection: new_reserve_b = reserve_b - output_amount

**Code:**
```move
    57:         let reserve_b = balance::value(&pool.reserve_b);
    58:         let output_amount = reserve_b * input_amount / reserve_a;
→   59:         let new_reserve_b = reserve_b - output_amount;
    60:         balance::join(&mut pool.reserve_a, coin::into_balance(input));
    61:         let output = coin::take(&mut pool.reserve_b, output_amount, ctx);
```

**Recommendation:** Add underflow checks with assert! statements

---

### 22. 🟡 Unchecked Multiplication

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/defi.move
**Line:** 82
**Confidence:** MEDIUM

**Description:** Multiplication operation without overflow protection: shares = amount_a * amount_b

**Code:**
```move
    80:         let amount_a = coin::value(&coin_a);
    81:         let amount_b = coin::value(&coin_b);
→   82:         let shares = amount_a * amount_b;
    83:         pool.total_shares = pool.total_shares + shares;
    84:         balance::join(&mut pool.reserve_a, coin::into_balance(coin_a));
```

**Recommendation:** Add overflow checks with assert! statements

---

### 23. 🟡 Missing Input Validation

**Severity:** MEDIUM
**Category:** Input Validation
**File:** test/sources/defi.move
**Line:** 132
**Confidence:** MEDIUM

**Description:** Function accepts numeric parameters without validation: public fun calculate_interest(principal: u64, rate: u64, time: u64

**Code:**
```move
   130:     }
   131: 
→  132:     public fun calculate_interest(principal: u64, rate: u64, time: u64): u64 {
   133:         principal * rate * time / 10000
   134:     }
```

**Recommendation:** Add input validation with appropriate bounds checking

---

### 24. 🟡 Unchecked Multiplication

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/defi.move
**Line:** 151
**Confidence:** MEDIUM

**Description:** Multiplication operation without overflow protection: liquidation_threshold = debt_amount * collateral_price

**Code:**
```move
   149:         ctx: &mut TxContext
   150:     ): Coin<T> {
→  151:         let liquidation_threshold = debt_amount * collateral_price / 100;
   152:         pool.total_borrowed = pool.total_borrowed - debt_amount;
   153:         coin::take(&mut pool.total_deposits, liquidation_threshold, ctx)
```

**Recommendation:** Add overflow checks with assert! statements

---

### 25. 🟡 Missing Input Validation

**Severity:** MEDIUM
**Category:** Input Validation
**File:** test/sources/defi.move
**Line:** 171
**Confidence:** MEDIUM

**Description:** Function accepts numeric parameters without validation: public fun update_oracle_price(new_price: u64

**Code:**
```move
   169:     }
   170: 
→  171:     public fun update_oracle_price(new_price: u64): u64 {
   172:         new_price
   173:     }
```

**Recommendation:** Add input validation with appropriate bounds checking

---

### 26. 🟡 Unchecked Addition

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/defi.move
**Line:** 186
**Confidence:** MEDIUM

**Description:** Addition operation without overflow protection: i = i + 1

**Code:**
```move
   184:             let coin = vector::pop_back(&mut coins);
   185:             transfer::public_transfer(coin, recipient);
→  186:             i = i + 1;
   187:         };
   188:         vector::destroy_empty(coins);
```

**Recommendation:** Add overflow checks with assert! statements

---

### 27. 🟡 Unchecked Multiplication

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/nft.move
**Line:** 112
**Confidence:** MEDIUM

**Description:** Multiplication operation without overflow protection: platform_fee_amount = price * fees

**Code:**
```move
   110:     
   111:     let payment_amount = coin::value(&payment);
→  112:     let platform_fee_amount = price * fees.platform_fee / 10000;
   113:     let seller_amount = price - platform_fee_amount;
   114:     
```

**Recommendation:** Add overflow checks with assert! statements

---

### 28. 🟡 Unchecked Subtraction

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/nft.move
**Line:** 113
**Confidence:** MEDIUM

**Description:** Subtraction operation without underflow protection: seller_amount = price - platform_fee_amount

**Code:**
```move
   111:     let payment_amount = coin::value(&payment);
   112:     let platform_fee_amount = price * fees.platform_fee / 10000;
→  113:     let seller_amount = price - platform_fee_amount;
   114:     
   115:     let platform_fee = coin::split(&mut payment, platform_fee_amount, ctx);
```

**Recommendation:** Add underflow checks with assert! statements

---

### 29. 🟡 Unchecked Addition

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/nft.move
**Line:** 223
**Confidence:** MEDIUM

**Description:** Addition operation without overflow protection: i = i + 1

**Code:**
```move
   221:         
   222:         transfer::transfer(nft, recipient);
→  223:         i = i + 1;
   224:     };
   225: }
```

**Recommendation:** Add overflow checks with assert! statements

---

### 30. 🟡 Missing Input Validation

**Severity:** MEDIUM
**Category:** Input Validation
**File:** test/sources/nft.move
**Line:** 227
**Confidence:** MEDIUM

**Description:** Function accepts numeric parameters without validation: public fun calculate_royalty(sale_price: u64, royalty_rate: u64

**Code:**
```move
   225: }
   226: 
→  227: public fun calculate_royalty(sale_price: u64, royalty_rate: u64): u64 {
   228:     sale_price * royalty_rate / 10000
   229: }
```

**Recommendation:** Add input validation with appropriate bounds checking

---

### 31. 🟡 Unchecked Multiplication

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/nft.move
**Line:** 239
**Confidence:** MEDIUM

**Description:** Multiplication operation without overflow protection: royalty = sale_price * collection

**Code:**
```move
   237: ) {
   238:     let sale_price = coin::value(&payment);
→  239:     let royalty = sale_price * collection.royalty_rate / 10000;
   240:     let seller_amount = sale_price - royalty;
   241:     
```

**Recommendation:** Add overflow checks with assert! statements

---

### 32. 🟡 Unchecked Subtraction

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/nft.move
**Line:** 240
**Confidence:** MEDIUM

**Description:** Subtraction operation without underflow protection: seller_amount = sale_price - royalty

**Code:**
```move
   238:     let sale_price = coin::value(&payment);
   239:     let royalty = sale_price * collection.royalty_rate / 10000;
→  240:     let seller_amount = sale_price - royalty;
   241:     
   242:     let royalty_payment = coin::split(&mut payment, royalty, ctx);
```

**Recommendation:** Add underflow checks with assert! statements

---

### 33. 🟡 State Change After External Call

**Severity:** MEDIUM
**Category:** State Consistency
**File:** test/sources/nft.move
**Line:** 68
**Confidence:** MEDIUM

**Description:** State modification after external call violates CEI pattern: collection.total_supply = collection.total_supply + 1;

**Code:**
```move
    66:     ctx: &mut TxContext
    67: ) {
→   68:     collection.total_supply = collection.total_supply + 1;
    69:     let nft = NFT {
    70:         id: object::new(ctx),
```

**Recommendation:** Move state changes before external calls (Checks-Effects-Interactions)

---

### 34. 🟡 State Change After External Call

**Severity:** MEDIUM
**Category:** State Consistency
**File:** test/sources/nft.move
**Line:** 163
**Confidence:** MEDIUM

**Description:** State modification after external call violates CEI pattern: auction.highest_bid = bid_amount;

**Code:**
```move
   161:     };
   162:     
→  163:     auction.highest_bid = bid_amount;
   164:     auction.highest_bidder = tx_context::sender(ctx);
   165:     
```

**Recommendation:** Move state changes before external calls (Checks-Effects-Interactions)

---

### 35. 🟡 State Change After External Call

**Severity:** MEDIUM
**Category:** State Consistency
**File:** test/sources/nft.move
**Line:** 247
**Confidence:** MEDIUM

**Description:** State modification after external call violates CEI pattern: nft.owner = to;

**Code:**
```move
   245:     transfer::public_transfer(payment, nft.owner);
   246:     
→  247:     nft.owner = to;
   248:     transfer::transfer(nft, to);
   249: }
```

**Recommendation:** Move state changes before external calls (Checks-Effects-Interactions)

---

### 36. 🟡 State Change After External Call

**Severity:** MEDIUM
**Category:** State Consistency
**File:** test/sources/nft.move
**Line:** 247
**Confidence:** MEDIUM

**Description:** State modification after external call violates CEI pattern: nft.owner = to;

**Code:**
```move
   245:     transfer::public_transfer(payment, nft.owner);
   246:     
→  247:     nft.owner = to;
   248:     transfer::transfer(nft, to);
   249: }
```

**Recommendation:** Move state changes before external calls (Checks-Effects-Interactions)

---

### 37. 🟡 Missing Zero Coin Check

**Severity:** MEDIUM
**Category:** Coin Operations
**File:** test/sources/test.move
**Line:** 25
**Confidence:** MEDIUM

**Description:** Coin operation without checking if the coin value is zero: balance.join(

**Code:**
```move
    23: 
    24: public fun add_balance<T>(user: &mut Bank<T>, user_coin: Coin<T>) {
→   25:     user.balance.join(user_coin.into_balance());
    26: }
    27: 
```

**Recommendation:** Add zero value check before coin operations to prevent unnecessary gas consumption and logical issues

---

### 38. 🟡 Unchecked Addition

**Severity:** MEDIUM
**Category:** Integer Operations
**File:** test/sources/token_contract.move
**Line:** 47
**Confidence:** MEDIUM

**Description:** Addition operation without overflow protection: total_deduction = amount + fee

**Code:**
```move
    45:         let new_balance = balance::value(&from_balance.balance) - amount;
    46:         let fee = amount / 100;
→   47:         let total_deduction = amount + fee;
    48:         let coins = coin::take(&mut from_balance.balance, total_deduction, ctx);
    49:         transfer::public_transfer(coins, to);
```

**Recommendation:** Add overflow checks with assert! statements

---

### 39. 🟡 Missing Input Validation

**Severity:** MEDIUM
**Category:** Input Validation
**File:** test/sources/token_contract.move
**Line:** 53
**Confidence:** MEDIUM

**Description:** Function accepts numeric parameters without validation: public fun admin_set_supply(cap: &mut TokenCap, new_supply: u64

**Code:**
```move
    51:     }
    52: 
→   53:     public fun admin_set_supply(cap: &mut TokenCap, new_supply: u64) {
    54:         cap.total_supply = new_supply;
    55:     }
```

**Recommendation:** Add input validation with appropriate bounds checking

---

### 40. 🟡 Missing Input Validation

**Severity:** MEDIUM
**Category:** Input Validation
**File:** test/sources/token_contract.move
**Line:** 57
**Confidence:** MEDIUM

**Description:** Function accepts numeric parameters without validation: public fun vote_and_execute(proposal_id: u64, votes: u64

**Code:**
```move
    55:     }
    56: 
→   57:     public fun vote_and_execute(proposal_id: u64, votes: u64, ctx: &mut TxContext) {
    58:         if (votes > 1000) {
    59:             execute_proposal(proposal_id, ctx);
```

**Recommendation:** Add input validation with appropriate bounds checking

---

### 41. 🟡 Missing Timelock

**Severity:** MEDIUM
**Category:** Governance
**File:** test/sources/token_contract.move
**Line:** 57
**Confidence:** MEDIUM

**Description:** Governance operation without timelock delay: vote_and_execute

**Code:**
```move
    55:     }
    56: 
→   57:     public fun vote_and_execute(proposal_id: u64, votes: u64, ctx: &mut TxContext) {
    58:         if (votes > 1000) {
    59:             execute_proposal(proposal_id, ctx);
```

**Recommendation:** Implement timelock mechanism between voting and execution

---

### 42. 🟡 Missing Input Validation

**Severity:** MEDIUM
**Category:** Input Validation
**File:** test/sources/token_contract.move
**Line:** 78
**Confidence:** MEDIUM

**Description:** Function accepts numeric parameters without validation: public fun calculate_fee(amount: u64

**Code:**
```move
    76:     }
    77: 
→   78:     public fun calculate_fee(amount: u64): u64 {
    79:         if (amount > 1000000) {
    80:             amount / 100
```

**Recommendation:** Add input validation with appropriate bounds checking

---

### 43. 🟡 State Change After External Call

**Severity:** MEDIUM
**Category:** State Consistency
**File:** test/sources/token_contract.move
**Line:** 50
**Confidence:** MEDIUM

**Description:** State modification after external call violates CEI pattern: from_balance.owner = to;

**Code:**
```move
    48:         let coins = coin::take(&mut from_balance.balance, total_deduction, ctx);
    49:         transfer::public_transfer(coins, to);
→   50:         from_balance.owner = to;
    51:     }
    52: 
```

**Recommendation:** Move state changes before external calls (Checks-Effects-Interactions)

---

### 44. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/defi.move
**Line:** 43
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 1000000

**Code:**
```move
    41:             reserve_a: coin::into_balance(initial_a),
    42:             reserve_b: coin::into_balance(initial_b),
→   43:             total_shares: 1000000, 
    44:             admin: tx_context::sender(ctx),
    45:         };
```

**Recommendation:** Define constants for magic numbers

---

### 45. 🔵 Missing Error Code in Assert

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/defi.move
**Line:** 96
**Confidence:** MEDIUM

**Description:** Assert statement without error code for debugging: assert!(tx_context::sender(ctx) == pool.admin)

**Code:**
```move
    94:         ctx: &mut TxContext
    95:     ): (Coin<A>, Coin<B>) {
→   96:         assert!(tx_context::sender(ctx) == pool.admin);
    97:         let all_a = balance::value(&pool.reserve_a);
    98:         let all_b = balance::value(&pool.reserve_b);
```

**Recommendation:** Add error codes to assert! statements

---

### 46. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/defi.move
**Line:** 133
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 10000

**Code:**
```move
   131: 
   132:     public fun calculate_interest(principal: u64, rate: u64, time: u64): u64 {
→  133:         principal * rate * time / 10000
   134:     }
   135: 
```

**Recommendation:** Define constants for magic numbers

---

### 47. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/defi.move
**Line:** 151
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 100

**Code:**
```move
   149:         ctx: &mut TxContext
   150:     ): Coin<T> {
→  151:         let liquidation_threshold = debt_amount * collateral_price / 100;
   152:         pool.total_borrowed = pool.total_borrowed - debt_amount;
   153:         coin::take(&mut pool.total_deposits, liquidation_threshold, ctx)
```

**Recommendation:** Define constants for magic numbers

---

### 48. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/nft.move
**Line:** 112
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 10000

**Code:**
```move
   110:     
   111:     let payment_amount = coin::value(&payment);
→  112:     let platform_fee_amount = price * fees.platform_fee / 10000;
   113:     let seller_amount = price - platform_fee_amount;
   114:     
```

**Recommendation:** Define constants for magic numbers

---

### 49. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/nft.move
**Line:** 228
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 10000

**Code:**
```move
   226: 
   227: public fun calculate_royalty(sale_price: u64, royalty_rate: u64): u64 {
→  228:     sale_price * royalty_rate / 10000
   229: }
   230: 
```

**Recommendation:** Define constants for magic numbers

---

### 50. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/nft.move
**Line:** 239
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 10000

**Code:**
```move
   237: ) {
   238:     let sale_price = coin::value(&payment);
→  239:     let royalty = sale_price * collection.royalty_rate / 10000;
   240:     let seller_amount = sale_price - royalty;
   241:     
```

**Recommendation:** Define constants for magic numbers

---

### 51. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/token_contract.move
**Line:** 46
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 100

**Code:**
```move
    44:     ) {
    45:         let new_balance = balance::value(&from_balance.balance) - amount;
→   46:         let fee = amount / 100;
    47:         let total_deduction = amount + fee;
    48:         let coins = coin::take(&mut from_balance.balance, total_deduction, ctx);
```

**Recommendation:** Define constants for magic numbers

---

### 52. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/token_contract.move
**Line:** 58
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 1000

**Code:**
```move
    56: 
    57:     public fun vote_and_execute(proposal_id: u64, votes: u64, ctx: &mut TxContext) {
→   58:         if (votes > 1000) {
    59:             execute_proposal(proposal_id, ctx);
    60:         };
```

**Recommendation:** Define constants for magic numbers

---

### 53. 🔵 Missing Error Code in Assert

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/token_contract.move
**Line:** 75
**Confidence:** MEDIUM

**Description:** Assert statement without error code for debugging: assert!(amount > 0)

**Code:**
```move
    73: 
    74:     public fun validate_amount(amount: u64) {
→   75:         assert!(amount > 0);
    76:     }
    77: 
```

**Recommendation:** Add error codes to assert! statements

---

### 54. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/token_contract.move
**Line:** 79
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 1000000

**Code:**
```move
    77: 
    78:     public fun calculate_fee(amount: u64): u64 {
→   79:         if (amount > 1000000) {
    80:             amount / 100
    81:         } else {
```

**Recommendation:** Define constants for magic numbers

---

### 55. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/token_contract.move
**Line:** 80
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 100

**Code:**
```move
    78:     public fun calculate_fee(amount: u64): u64 {
    79:         if (amount > 1000000) {
→   80:             amount / 100
    81:         } else {
    82:             amount / 1000
```

**Recommendation:** Define constants for magic numbers

---

### 56. 🔵 Magic Number

**Severity:** LOW
**Category:** Best Practices
**File:** test/sources/token_contract.move
**Line:** 82
**Confidence:** MEDIUM

**Description:** Hard-coded number should be a named constant: 1000

**Code:**
```move
    80:             amount / 100
    81:         } else {
→   82:             amount / 1000
    83:         }
    84:     }
```

**Recommendation:** Define constants for magic numbers

---

## 🛠️ Remediation Priority

1. **Critical & High**: Fix immediately before deployment
2. **Medium**: Address in next development cycle
3. **Low & Info**: Consider for code quality improvements

---
*Generated by Move Security Auditor*