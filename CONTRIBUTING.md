# 贡献指南

感谢您对本项目的关注！我们欢迎各种形式的贡献，包括但不限于：

- 提交 Bug 报告
- 提出新功能建议
- 改进文档
- 提交代码修复或新功能

## 开发流程

### 1. Fork 项目

点击 GitHub 页面右上角的 "Fork" 按钮创建您自己的项目副本。

### 2. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/worldcup-prediction-2026.git
cd worldcup-prediction-2026
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
```

分支命名规范：
- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `refactor/` - 代码重构

### 4. 安装依赖

```bash
# 安装合约依赖
cd contracts && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 5. 开发和测试

```bash
# 启动本地链
cd contracts
npx hardhat node

# 部署合约（新终端）
npx hardhat run deploy/01_deploy_contracts.js --network localhost

# 启动前端（新终端）
cd ../frontend
npm run dev
```

### 6. 提交更改

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

提交信息规范：
- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式（不影响功能）
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建过程或辅助工具的变动

### 7. 创建 Pull Request

1. 访问您的 Fork 页面
2. 点击 "New Pull Request"
3. 选择您的分支和主分支
4. 填写 PR 描述，说明更改内容和原因
5. 等待审核

## 代码规范

### Solidity

- 使用 Solidity 0.8.26
- 遵循 [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- 使用中文注释（考虑到中国用户）
- 函数必须包含 NatSpec 注释

```solidity
/**
 * @dev 计算购买成本
 * @param outcomeIndex 结果索引
 * @param tokenAmount 购买数量
 * @return cost 总成本（含手续费）
 */
function calculateBuyCost(
    uint256 outcomeIndex,
    uint256 tokenAmount
) public view returns (uint256 cost) {
    // 实现代码
}
```

### TypeScript/React

- 使用 TypeScript 严格模式
- 组件使用函数式编程
- 使用自定义 Hooks 封装逻辑
- 遵循 ESLint 配置

```typescript
// 好的示例
interface MarketCardProps {
  market: Market;
  onTrade: (amount: number) => void;
}

export function MarketCard({ market, onTrade }: MarketCardProps) {
  const { data } = useMarketData(market.id);

  return (
    <div className="pm-card">
      <h3>{market.question}</h3>
      {/* ... */}
    </div>
  );
}
```

## 测试要求

### 合约测试

- 所有合约函数必须有测试覆盖
- 测试边界条件和异常情况
- 使用 Hardhat 测试框架

```bash
cd contracts
npx hardhat test
```

### 前端测试

- 关键组件需要有单元测试
- 使用 React Testing Library

```bash
cd frontend
npm run test
```

## 安全准则

- 不要提交私钥或敏感信息
- 使用 `.env.example` 作为环境变量模板
- 合约变更需要安全审查
- 遵循 [OpenZeppelin 安全最佳实践](https://docs.openzeppelin.com/learn/)

## 文档更新

- 更新 README.md 以反映新功能
- 更新技术文档以反映架构变更
- 添加 JSDoc 注释到公共函数

## 社区行为准则

- 尊重所有贡献者
- 欢迎新手，耐心指导
- 建设性的反馈和讨论
- 禁止骚扰和歧视

## 需要帮助？

- 查看 [README.md](README.md) 了解项目概述
- 查看 [QUICKSTART.md](QUICKSTART.md) 了解快速开始
- 在 Issue 中提问
- 加入 Discord 讨论

感谢您的贡献！🎉
