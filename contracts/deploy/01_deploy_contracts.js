const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log('部署合约，账户:', deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('账户余额:', balance.toString());

  // 1. 部署 MockUSDC
  console.log('\n1. 部署 MockUSDC...');
  const MockUSDC = await hre.ethers.getContractFactory('MockUSDC');
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log('MockUSDC 部署到:', mockUSDCAddress);

  // 2. 部署 ConditionalTokens
  console.log('\n2. 部署 ConditionalTokens...');
  const ConditionalTokens = await hre.ethers.getContractFactory('ConditionalTokens');
  const conditionalTokens = await ConditionalTokens.deploy();
  await conditionalTokens.waitForDeployment();
  const conditionalTokensAddress = await conditionalTokens.getAddress();
  console.log('ConditionalTokens 部署到:', conditionalTokensAddress);

  // 3. 部署 PredictionMarketFactory
  console.log('\n3. 部署 PredictionMarketFactory...');
  const PredictionMarketFactory = await hre.ethers.getContractFactory('PredictionMarketFactory');
  const factory = await PredictionMarketFactory.deploy(
    conditionalTokensAddress,
    mockUSDCAddress,
    deployer.address // 默认预言机为部署者
  );
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log('PredictionMarketFactory 部署到:', factoryAddress);

  // 4. 转移 ConditionalTokens 所有权给工厂
  console.log('\n4. 设置权限...');
  await conditionalTokens.transferOwnership(factoryAddress);
  console.log('ConditionalTokens 所有权转移给工厂');

  // 5. 创建2026世界杯示例市场
  console.log('\n5. 创建2026世界杯示例市场...');

  // 5.1 冠军预测市场
  const teams = [
    '阿根廷', '法国', '西班牙', '英格兰', '巴西', '德国',
    '葡萄牙', '荷兰', '比利时', '意大利', '乌拉圭', '克罗地亚',
    '其他'
  ];
  const resolutionTime = Math.floor(new Date('2026-07-20T00:00:00Z').getTime() / 1000);

  const tx1 = await factory.createMarket(
    '2026美加墨世界杯冠军是哪个国家？',
    teams,
    resolutionTime
  );
  await tx1.wait();
  console.log('冠军预测市场创建成功');

  // 5.2 二元市场示例 - 阿根廷能否夺冠
  const tx2 = await factory.createBinaryMarket(
    '阿根廷会赢得2026世界杯冠军吗？',
    resolutionTime
  );
  await tx2.wait();
  console.log('阿根廷夺冠二元市场创建成功');

  // 5.3 另一个二元市场 - 梅西能否获得金靴
  const tx3 = await factory.createBinaryMarket(
    '梅西会在2026世界杯获得金靴奖吗？',
    resolutionTime
  );
  await tx3.wait();
  console.log('梅西金靴二元市场创建成功');

  console.log('\n======== 部署完成 ========');
  console.log('MockUSDC:', mockUSDCAddress);
  console.log('ConditionalTokens:', conditionalTokensAddress);
  console.log('PredictionMarketFactory:', factoryAddress);
  console.log('市场数量:', (await factory.getMarketCount()).toString());

  // 保存部署信息
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MockUSDC: mockUSDCAddress,
      ConditionalTokens: conditionalTokensAddress,
      PredictionMarketFactory: factoryAddress,
    },
  };

  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployment.json');
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('部署信息已保存到 deployment.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
