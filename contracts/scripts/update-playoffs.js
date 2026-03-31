const hre = require("hardhat");

async function main() {
  // 合约地址
  const ORACLE_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

  // 获取合约实例（使用第一个账户，即部署者）
  const [owner] = await hre.ethers.getSigners();
  console.log("调用账户:", owner.address);

  const oracle = await hre.ethers.getContractAt("WorldCupDataOracle", ORACLE_ADDRESS, owner);

  console.log("\n=== 更新附加赛结果 ===\n");

  // 模拟 2026年3月31日附加赛结果
  // 假设以下球队晋级（实际情况以比赛结果为准）
  const qualifiedTeams = [
    "意大利",    // 欧洲附加赛1胜者
    "瑞典",      // 欧洲附加赛2胜者
    "土耳其",    // 欧洲附加赛3胜者
    "丹麦",      // 欧洲附加赛4胜者
    "牙买加",    // 洲际附加赛1胜者
    "伊拉克"     // 洲际附加赛2胜者
  ];

  const eliminatedTeams = [
    "波黑",
    "波兰",
    "科索沃",
    "捷克",
    "刚果金",
    "玻利维亚"
  ];

  console.log("晋级的球队:");
  qualifiedTeams.forEach((team, i) => console.log(`  ${i + 1}. ${team}`));

  console.log("\n淘汰的球队:");
  eliminatedTeams.forEach((team, i) => console.log(`  ${i + 1}. ${team}`));

  try {
    // 调用更新函数（需要合约owner权限）
    const tx = await oracle.updatePlayoffResults(qualifiedTeams, eliminatedTeams);
    console.log("\n⏳ 交易发送中...", tx.hash);

    // 等待交易确认
    await tx.wait();
    console.log("✅ 交易已确认！");

    // 验证更新结果
    const [current, total] = await oracle.getQualifiedCount();
    console.log(`\n📊 更新后晋级球队: ${current}/${total}`);

    // 查询新晋级球队
    for (const team of qualifiedTeams.slice(0, 3)) {
      const isQualified = await oracle.isTeamQualified(team);
      console.log(`   ${team}: ${isQualified ? '✅ 已晋级' : '❌ 未晋级'}`);
    }

  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    console.log("\n可能原因:");
    console.log("  1. 你不是合约 owner（只有部署者可以更新）");
    console.log("  2. 附加赛时间未到（合约限制3月31日后才能更新）");
    console.log("  3. Hardhat 网络已重启，合约需要重新部署");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
