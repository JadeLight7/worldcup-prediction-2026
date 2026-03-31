# 🚀 快速开始

本指南将帮助你在 5 分钟内启动并运行世界杯预测市场。

## 📋 前置要求

| 工具 | 版本 | 下载链接 |
|------|------|----------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org/) |
| npm | v9+ | 随 Node.js 安装 |
| Git | 任意 | [git-scm.com](https://git-scm.com/) |
| MetaMask | 最新 | [metamask.io](https://metamask.io/) |

## 🛠️ 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/worldcup-prediction-2026.git
cd worldcup-prediction-2026
```

### 2. 安装依赖

```bash
# 安装合约依赖
cd contracts
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 启动本地区块链

```bash
cd contracts
npm run node
```

这将启动一个本地 Hardhat 节点：
- 网络名称: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- 链 ID: 31337
- 创建了 10 个测试账户，每个有 10,000 ETH

### 4. 部署智能合约

在**新终端窗口**中：

```bash
cd contracts
npm run deploy:local
```

部署成功后，你会看到类似输出：
```
MockUSDC 部署到: 0x...
ConditionalTokens 部署到: 0x...
EnhancedPredictionMarketFactory 部署到: 0x...
WorldCupDataOracle 部署到: 0x...
```

合约地址会自动保存到 `contracts/deployment.json`。

### 5. 配置前端

```bash
cd frontend
cp .env.example .env
```

合约地址已在部署时自动配置，通常无需手动修改。

### 6. 启动前端开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用 🎉

## 🦊 配置 MetaMask

### 添加本地网络

1. 打开 MetaMask 扩展
2. 点击网络选择器（默认显示 "Ethereum Mainnet"）
3. 点击 "Add network" → "Add network manually"
4. 填写以下信息：
   - **网络名称**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **链 ID**: 31337
   - **货币符号**: ETH
   - **区块浏览器**: （留空）
5. 点击 "Save"

### 导入测试账户

1. 在 Hardhat 节点终端中找到私钥（前几个账户）：
   ```
   Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

2. 在 MetaMask 中：
   - 点击账户图标 → "Import account"
   - 粘贴私钥
   - 点击 "Import"

## 🎮 使用指南

### 获取测试代币

1. 连接钱包后，点击右上角的 "Connect Wallet"
2. 选择导入的测试账户
3. 在页面中找到 "水龙头" 按钮
4. 点击获取模拟 USDC 代币

### 创建预测市场

1. 点击导航栏的 "创建市场"
2. 选择模板：
   - 🏆 冠军预测
   - ✅ 晋级预测
   - ⚽ 金靴奖
3. 输入预测问题（如："阿根廷会赢得2026世界杯冠军吗？"）
4. 设置结算时间（必须晚于实际比赛结束）
5. 点击 "创建市场" 并确认交易

### 交易预测份额

1. 在首页浏览市场列表
2. 点击感兴趣的市场进入详情页
3. 查看当前价格和赔率
4. 选择 "买入 Yes" 或 "买入 No"
5. 输入 USDC 金额
6. 查看潜在收益
7. 点击 "确认买入" 并签署交易

### 提供流动性

1. 在市场详情页点击 "提供流动性"
2. 输入 USDC 数量
3. 获得 LP 代币份额
4. 开始赚取交易手续费和挖矿奖励

## 🧪 测试数据

项目包含预设的 2026 世界杯市场：

| 类型 | 数量 | 示例 |
|------|------|------|
| 冠军预测 | 6 | 阿根廷、法国、巴西等 |
| 金靴奖 | 4 | 姆巴佩、哈兰德、梅西等 |
| 小组出线 | 8 | 各小组球队出线预测 |
| 单场赛事 | 3 | 美国vs墨西哥揭幕战等 |
| 特定球员 | 3 | 梅西进球、C罗参赛等 |
| 附加赛 | 3 | 3月31日决定 |

**总计**: 27 个市场

## 📊 市场结算

### 自动结算

比赛结果确认后，预言机将自动调用结算函数。

### 手动结算（开发测试）

```bash
cd contracts
npx hardhat run scripts/resolve-market.js --network localhost
```

或调用合约函数：
```javascript
await market.resolve(0) // 0 = 第一个选项获胜
```

### 领取奖励

1. 市场结算后，获胜方向的份额可兑换 1 USDC
2. 在 "投资组合" 页面找到已结算的市场
3. 点击 "领取奖励"

## 🐛 常见问题

### "网络连接失败"

**问题**: 前端无法连接区块链

**解决**:
1. 确保 Hardhat 节点正在运行 (`npm run node`)
2. 检查 MetaMask 网络配置是否正确
3. 尝试刷新页面

### "合约部署失败"

**问题**: 部署脚本报错

**解决**:
1. 确保 Hardhat 节点正在运行
2. 删除 `cache/` 和 `artifacts/` 目录重试
3. 检查 `hardhat.config.js` 配置

### "交易失败"

**问题**: MetaMask 显示交易失败

**解决**:
1. 确保账户有足够的 ETH 支付 gas
2. 确保市场未结算
3. 确保输入的金额正确
4. 查看浏览器控制台获取详细错误信息

### "价格显示错误"

**问题**: 市场价格不显示或显示为 0

**解决**:
1. 确保市场有流动性（有人提供流动性）
2. 检查浏览器控制台的 Web3 错误
3. 刷新页面重试

## 📚 下一步

- 阅读 [README.md](README.md) 了解项目架构
- 查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何贡献
- 探索 [智能合约](contracts/contracts/) 源代码
- 查看 [前端组件](frontend/src/)

## 💡 提示

- 使用第一个 Hardhat 账户作为 "管理员" 账户
- 使用第二个账户作为 "用户" 账户进行测试
- 所有交易在本地链上都是即时的
- 刷新页面会重置前端状态，但链上数据保持不变

---

遇到问题？在 GitHub Issues 中提问！
