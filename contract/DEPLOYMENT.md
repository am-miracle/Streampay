
### 2. Testnet Deployment (Polygon Amoy)

```bash
forge script script/Deploy.s.sol \
  --rpc-url $POLYGON_AMOY_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $POLYGONSCAN_API_KEY
```

### 3. Testnet Deployment (Base Sepolia)

```bash
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```



### Run with Gas Report

```bash
forge test --gas-report
```

### Run Specific Test

```bash
forge test --match-test test_BatchStopStreams_Success -vvv
```

### Test Coverage

```bash
forge coverage
```

### Generate Coverage Report

```bash
forge coverage --report lcov
genhtml lcov.info -o coverage
open coverage/index.html
```

---
