/**
 * 市场结算脚本
 *
 * 用法: node scripts/resolve-market.js <market-address> <winning-outcome-index>
 *
 * 示例: node scripts/resolve-market.js 0x1234...5678 0
 */

const hre = require('hardhat');

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('用法: node scripts/resolve-market.js <market-address> <winning-outcome-index>');
    console.log('示例: node scripts/resolve-market.js 0x1234...5678 0');
    process.exit(1);
  }

  const marketAddress = args[0];
  const winningOutcome = parseInt(args[1]);

  console.log(`结算市场: ${marketAddress}`);
  console.log(`获胜选项索引: ${winningOutcome}`);

  // 获取签名者
  const [deployer] = await hre.ethers.getSigners();
  console.log(`结算者地址: ${deployer.address}`);

  // 连接到市场合约
  const PredictionMarket = await hre.ethers.getContractFactory('PredictionMarket');
  const market = PredictionMarket.attach(marketAddress);

  // 获取市场信息
  const marketInfo = await market.getMarketInfo();
  console.log(`市场问题: ${marketInfo._question}`);
  console.log(`选项数量: ${marketInfo._outcomes.length}`);

  if (winningOutcome >= marketInfo._outcomes.length) {
    console.error('错误: 获胜选项索引超出范围');
    process.exit(1);
  }

  console.log(`获胜选项: ${marketInfo._outcomes[winningOutcome]}`);

  // 结算市场
  console.log('\n正在结算市场...');
  const tx = await market.resolve(winningOutcome);
  await tx.wait();

  console.log('市场结算成功!');
  console.log(`交易哈希: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
