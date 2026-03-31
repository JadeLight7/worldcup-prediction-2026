const hre = require("hardhat");

async function main() {
  // 合约地址
  const ORACLE_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

  // 获取合约实例
  const oracle = await hre.ethers.getContractAt("WorldCupDataOracle", ORACLE_ADDRESS);

  console.log("=== 调用 WorldCupDataOracle ===\n");

  // 1. 获取晋级球队数量
  const [current, total] = await oracle.getQualifiedCount();
  console.log(`📊 晋级球队: ${current}/${total}`);

  // 2. 获取所有晋级球队
  const teams = await oracle.getQualifiedTeams();
  console.log(`\n⚽ 已晋级球队列表 (前10支):`);
  for (let i = 0; i < Math.min(10, teams.length); i++) {
    console.log(`   ${i + 1}. ${teams[i]}`);
  }

  // 3. 查询特定球队
  const isArgentinaQualified = await oracle.isTeamQualified("阿根廷");
  const isChinaQualified = await oracle.isTeamQualified("中国");
  console.log(`\n✅ 阿根廷已晋级: ${isArgentinaQualified}`);
  console.log(`❌ 中国已晋级: ${isChinaQualified}`);

  // 4. 获取球队详情
  const brazilInfo = await oracle.teams("巴西");
  console.log(`\n🇧🇷 巴西队详情:`);
  console.log(`   - 名称: ${brazilInfo.name}`);
  console.log(`   - 地区: ${brazilInfo.region}`);
  console.log(`   - 是否晋级: ${brazilInfo.qualified}`);
  console.log(`   - 小组: ${brazilInfo.group || "未分组"}`);

  // 5. 获取统计信息
  const totalQualified = await oracle.totalQualifiedTeams();
  const lastUpdate = await oracle.lastUpdateTime();
  console.log(`\n📈 统计信息:`);
  console.log(`   - 总晋级数: ${totalQualified}`);
  console.log(`   - 上次更新: ${new Date(Number(lastUpdate) * 1000).toLocaleString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
