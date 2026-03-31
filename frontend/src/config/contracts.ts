export const CONTRACT_ADDRESSES = {
  MockUSDC: import.meta.env.VITE_MOCK_USDC_ADDRESS || '',
  ConditionalTokens: import.meta.env.VITE_CONDITIONAL_TOKENS_ADDRESS || '',
  PredictionMarketFactory: import.meta.env.VITE_FACTORY_ADDRESS || '',
}

// 合约 ABI（简化版，实际需要完整ABI）
export const FACTORY_ABI = [
  {
    "inputs": [],
    "name": "getMarketCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "start", "type": "uint256" }, { "internalType": "uint256", "name": "limit", "type": "uint256" }],
    "name": "getMarkets",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string[]", "name": "outcomes", "type": "string[]" }, { "internalType": "uint256", "name": "resolutionTime", "type": "uint256" }],
    "name": "createMarket",
    "outputs": [{ "internalType": "address", "name": "marketAddress", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export const MARKET_ABI = [
  {
    "inputs": [],
    "name": "getMarketInfo",
    "outputs": [
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "string[]", "name": "_outcomes", "type": "string[]" },
      { "internalType": "uint256", "name": "_resolutionTime", "type": "uint256" },
      { "internalType": "bool", "name": "_isResolved", "type": "bool" },
      { "internalType": "uint256", "name": "_winningOutcome", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalVolume", "type": "uint256" },
      { "internalType": "uint256", "name": "_fee", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPrices",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserPositions",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "outcomeIndex", "type": "uint256" }, { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }],
    "name": "buy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "outcomeIndex", "type": "uint256" }, { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }],
    "name": "sell",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export const ERC20_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
