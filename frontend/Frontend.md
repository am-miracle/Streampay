// STATE MANAGEMENT
1. ALWAYS use optimistic UI updates - don't wait for blockchain confirmation
2. Reconcile with on-chain state every 30 seconds (poll getStreamedAmount)
3. Store streamId in localStorage - survive page refresh
4. Clear interval timers on component unmount (prevent memory leaks)
5. Show loading states for ALL blockchain interactions

// COUNTER LOGIC
const updateCounter = () => {
  // Client-side ONLY until stop
  const elapsed = (Date.now() - startTime) / 1000;
  const amount = Math.min(elapsed * ratePerSecond, maxDeposit);
  setDisplayAmount(amount.toFixed(4)); // Never more than 4 decimals
};

// CRITICAL: Update every 100ms for smooth animation
// DO NOT poll blockchain every 100ms (rate limit + cost)

// ERROR HANDLING
try {
  await tx.wait();
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    // User rejected - silent fail
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    showError("Insufficient USDC balance");
  } else {
    showError("Transaction failed - try again");
    // Log to monitoring service
  }
}

// WALLET CONNECTION
1. Check if user has smart account, create if not
2. ALWAYS wrap wallet with Biconomy SDK before any contract calls
3. Cache smart account address - don't recreate each transaction
4. Show clear "Gasless" badge when paymaster active

// TRANSACTION FLOW
const startStream = async () => {
  setLoading(true);
  try {
    // 1. Check USDC balance
    if (balance < deposit) throw new Error("Insufficient USDC");
    
    // 2. Check/request allowance
    if (allowance < deposit) {
      await approveUSDC();
    }
    
    // 3. Create stream (gasless)
    const tx = await smartAccount.sendTransaction({
      to: CONTRACT_ADDRESS,
      data: createStreamCalldata,
    });
    
    // 4. Optimistic update (don't wait for confirmation)
    setStreamActive(true);
    setStartTime(Date.now());
    startCounter();
    
    // 5. Wait for confirmation in background
    tx.wait().then(receipt => {
      const streamId = parseStreamId(receipt);
      setStreamId(streamId);
      localStorage.setItem('activeStreamId', streamId);
    });
  } finally {
    setLoading(false);
  }
};

// FORBIDDEN PATTERNS
- NO raw BigNumber display (always format with ethers.utils.formatUnits)
- NO naked promises (always wrap in try/catch)
- NO hard-coded addresses (use env vars)
- NO mixing testnet/mainnet RPC URLs
