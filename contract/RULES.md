// CRITICAL RULES
1. All rates MUST be in wei per second (divide by 1e6 for USDC display)
2. ALWAYS use SafeERC20 for token transfers
3. NEVER allow unchecked arithmetic - Solidity 0.8+ only
4. Cap deposits at reasonable max (e.g., $100) to limit exposure
5. Emit events for EVERY state change (indexing + frontend updates)
6. Use ReentrancyGuard on ALL external functions that transfer tokens
7. Calculate owed as: min(elapsed * rate, deposit) to prevent overflow
8. Store block.timestamp, NOT block.number for time calculations
9. Refund excess deposit in stopStream(), don't leave funds locked
10. Use uint256 for all amounts, never uint128 (gas savings not worth precision risk)
11. NEVER use require except necessary all use custom error.
12. MUST Follow best practice like CEI
13. It must be scalable and reusable. any thing that can 
14. Only add comment to the interface directory

GOLDEN RULES:
1. Rates in wei/sec, display in $/min
2. All contract calls wrapped in try/catch
3. Counter updates client-side (100ms), reconcile on-chain (30sec)
4. Gasless = route through Biconomy SmartAccount
5. Emit events for everything (frontend needs them)
6. Never poll chain rapidly (use client calculation + periodic sync)
7. Store streamId in localStorage (survive refresh)
8. Min deposit $0.10, max $100 (safety limits)
9. Test on Polygon testnet before any mainnet deployment
10. Monitor paymaster balance (alert at 20%)

// FORBIDDEN PATTERNS
- NO pull payments without timeout mechanism
- NO direct ETH transfers (use USDC only)
- NO floating point math (everything in wei)
- NO unbounded loops (gas DoS risk)
- NO tx.origin for auth (use msg.sender)
