# 智能合约交互指南

## 📋 部署状态

当前合约部署在 **Hardhat Local Network** (localhost:8545)

| 合约 | 地址 | 用途 |
|------|------|------|
| WorldCupDataOracle | `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853` | 世界杯数据预言机 |

> ⚠️ **注意**: 本地网络数据在重启后会丢失，需要重新部署。

---

## 🚀 快速调用

### 1. 查询数据（无需 Gas）

```bash
cd contracts
npx hardhat run scripts/call-oracle.js --network localhost
```

输出示例：
```
📊 晋级球队: 42/48
⚽ 已晋级球队列表 (前10支):
   1. 美国
   2. 加拿大
   3. 墨西哥
   ...
✅ 阿根廷已晋级: true
❌ 中国已晋级: false
```

### 2. 更新数据（需要 Gas + 权限）

```bash
npx hardhat run scripts/update-playoffs.js --network localhost
```

> 只有合约 owner（部署者）可以执行更新操作。

---

## 🛠️ 方式 1: Hardhat Console（交互式）

```bash
npx hardhat console --network localhost
```

```javascript
// 获取合约实例
const oracle = await ethers.getContractAt("WorldCupDataOracle", "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853");

// 查询晋级数量
await oracle.getQualifiedCount();
// [ 42n, 48n ]

// 查询球队是否晋级
await oracle.isTeamQualified("阿根廷");
// true

await oracle.isTeamQualified("中国");
// false

// 获取球队详情
await oracle.teams("巴西");
// [ '巴西', 'CONMEBOL', true, 1711875372n, '' ]

// 退出 console
.quit
```

---

## 📜 方式 2: 编写脚本

### 查询脚本示例

```javascript
const hre = require("hardhat");

async function main() {
  const oracle = await hre.ethers.getContractAt(
    "WorldCupDataOracle",
    "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
  );

  // 调用 view 函数（无需签名，不消耗 Gas）
  const count = await oracle.totalQualifiedTeams();
  console.log(`晋级球队数: ${count}`);
}

main();
```

### 发送交易示例

```javascript
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();

  const oracle = await hre.ethers.getContractAt(
    "WorldCupDataOracle",
    "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
    signer  // 使用指定账户签名
  );

  // 发送交易（需要 Gas）
  const tx = await oracle.updatePlayoffResults(
    ["意大利", "瑞典"],  // 晋级球队
    ["波黑", "波兰"]      // 淘汰球队
  );

  console.log("交易哈希:", tx.hash);

  // 等待确认
  await tx.wait();
  console.log("交易已确认!");
}

main();
```

---

## 🌐 方式 3: 前端调用

前端使用 **Wagmi** + **Ethers.js** 调用合约：

```typescript
import { useContractRead, useContractWrite } from 'wagmi';
import { ORACLE_ADDRESS, ORACLE_ABI } from '../config/oracle';

// 读取数据（自动刷新）
function useQualifiedCount() {
  return useContractRead({
    address: ORACLE_ADDRESS,
    abi: ORACLE_ABI,
    functionName: 'getQualifiedCount',
    watch: true,  // 自动轮询
  });
}

// 写入数据
function useUpdatePlayoffs() {
  return useContractWrite({
    address: ORACLE_ADDRESS,
    abi: ORACLE_ABI,
    functionName: 'updatePlayoffResults',
  });
}
```

实际应用见：`frontend/src/pages/Home.tsx`

---

## 📚 WorldCupDataOracle 合约函数

### 查询函数 (View/Pure)

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getQualifiedCount()` | - | `(current, total)` | 获取晋级数量 |
| `getQualifiedTeams()` | - | `string[]` | 获取所有晋级球队 |
| `isTeamQualified(name)` | 球队名称 | `bool` | 查询是否晋级 |
| `teams(name)` | 球队名称 | `(name, region, qualified, qualifiedAt, group)` | 球队详情 |
| `totalQualifiedTeams` | - | `uint256` | 总晋级数 |
| `isGroupStageDrawn` | - | `bool` | 是否已抽签 |
| `lastUpdateTime` | - | `uint256` | 上次更新时间 |

### 写入函数 (Transaction)

| 函数 | 参数 | 权限 | 说明 |
|------|------|------|------|
| `updatePlayoffResults(qualified, eliminated)` | `(string[], string[])` | Owner | 更新附加赛结果 |
| `updateGroupStage(teams, groups)` | `(string[], string[])` | Owner | 更新小组分组 |
| `transferOwnership(newOwner)` | `address` | Owner | 转移所有权 |

---

## 🔧 部署到新网络

### 部署到 Goerli 测试网

1. 配置环境变量

```bash
# .env
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...  // 测试账户私钥
```

2. 修改 hardhat.config.js

```javascript
networks: {
  goerli: {
    url: process.env.GOERLI_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
  }
}
```

3. 部署合约

```bash
npx hardhat run deploy/02_deploy_oracle.js --network goerli
```

4. 验证合约

```bash
npx hardhat verify --network goerli ORACLE_ADDRESS
```

---

## 🐛 常见问题

### "No Hardhat config file found"

**原因**: 不在 contracts 目录下
**解决**: `cd contracts`

### "call revert exception"

**原因**: 合约地址错误或合约未部署
**解决**: 检查地址，重新部署合约

### "execution reverted: OwnableUnauthorizedAccount"

**原因**: 不是合约 owner 调用需要权限的函数
**解决**: 使用部署账户调用，或请求 owner 执行

### Hardhat 网络重启后数据丢失

**原因**: 本地网络是内存存储
**解决**: 重新运行部署脚本

---

## 📖 相关文档

- [Hardhat 文档](https://hardhat.org/docs)
- [Ethers.js 文档](https://docs.ethers.io/)
- [Wagmi 文档](https://wagmi.sh/)
