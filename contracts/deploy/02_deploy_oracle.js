const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);

  // 部署 WorldCupDataOracle
  const WorldCupDataOracle = await hre.ethers.getContractFactory("WorldCupDataOracle");
  const oracle = await WorldCupDataOracle.deploy();
  await oracle.waitForDeployment();

  const oracleAddress = await oracle.getAddress();
  console.log("WorldCupDataOracle 部署到:", oracleAddress);

  // 获取当前晋级球队数
  const [current, total] = await oracle.getQualifiedCount();
  console.log(`当前晋级球队: ${current}/${total}`);

  // 获取所有晋级球队
  const teams = await oracle.getQualifiedTeams();
  console.log(`已晋级球队数: ${teams.length}`);
  console.log("部分球队示例:");
  for (let i = 0; i < Math.min(5, teams.length); i++) {
    const team = await oracle.teams(teams[i]);
    console.log(`  - ${team.name} (${team.region})`);
  }

  // 保存部署信息
  const fs = require("fs");
  const deploymentInfo = {
    oracleAddress,
    qualifiedCount: current.toString(),
    totalCount: total.toString(),
    deployTime: new Date().toISOString()
  };
  fs.writeFileSync("oracle-deployment.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("\n部署信息已保存到 oracle-deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
