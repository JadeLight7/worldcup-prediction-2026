// WorldCupDataOracle 合约配置
export const ORACLE_ADDRESS = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'

export const ORACLE_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "getQualifiedCount",
    "outputs": [
      { "internalType": "uint256", "name": "current", "type": "uint256" },
      { "internalType": "uint256", "name": "total", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getQualifiedTeams",
    "outputs": [
      { "internalType": "string[]", "name": "", "type": "string[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "teamName", "type": "string" }],
    "name": "isTeamQualified",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalQualifiedTeams",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isGroupStageDrawn",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastUpdateTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "name": "teams",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "region", "type": "string" },
      { "internalType": "bool", "name": "qualified", "type": "bool" },
      { "internalType": "uint256", "name": "qualifiedAt", "type": "uint256" },
      { "internalType": "string", "name": "group", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string[]", "name": "qualifiedTeams", "type": "string[]" },
      { "internalType": "string[]", "name": "eliminatedTeams", "type": "string[]" }
    ],
    "name": "updatePlayoffResults",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "qualifiedCount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DataUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "teamName", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TeamQualified",
    "type": "event"
  }
] as const

// 数据更新时间
export const DATA_UPDATED_AT = '2026-03-28T00:00:00Z'

// 附加赛结束时间（2026年3月31日 UTC）
export const PLAYOFF_END_TIME = new Date('2026-03-31T00:00:00Z').getTime()
