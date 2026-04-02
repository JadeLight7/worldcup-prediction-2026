const hre = require("hardhat");

async function main() {
  // 合约地址
  const ORACLE_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

  // 获取合约实例（使用第一个账户，即部署者）
  const [owner] = await hre.ethers.getSigners();
  console.log("调用账户:", owner.address);
  console.log("时间:", new Date().toLocaleString());

  const oracle = await hre.ethers.getContractAt(
    "WorldCupDataOracle",
    ORACLE_ADDRESS,
    owner
  );

  console.log("\n=== 更新2026世界杯附加赛结果 ===\n");

  // 查询当前状态
  const [currentBefore, totalBefore] = await oracle.getQualifiedCount();
  console.log(`更新前: ${currentBefore}/${totalBefore} 支球队\n`);

  // ==========================================
  // 填写实际比赛结果（2026年3月31日附加赛）
  // ==========================================

  // 欧洲区附加赛（4支晋级）
  // 意大利 vs 波黑
  // 瑞典 vs 波兰
  // 土耳其 vs 科索沃
  // 丹麦 vs 捷克
  const uefaQualified = ["意大利", "瑞典", "土耳其", "丹麦"];
  const uefaEliminated = ["波黑", "波兰", "科索沃", "捷克"];

  // 洲际附加赛（2支晋级）
  // 牙买加 vs 刚果金
  // 玻利维亚 vs 伊拉克
  const interQualified = ["牙买加", "伊拉克"];
  const interEliminated = ["刚果金", "玻利维亚"];

  // 合并所有结果
  const qualifiedTeams = [...uefaQualified, ...interQualified];
  const eliminatedTeams = [...uefaEliminated, ...interEliminated];

  console.log("📊 欧洲区附加赛结果:");
  console.log("   晋级:", uefaQualified.join(", "));
  console.log("   淘汰:", uefaEliminated.join(", "));

  console.log("\n📊 洲际附加赛结果:");
  console.log("   晋级:", interQualified.join(", "));
  console.log("   淘汰:", interEliminated.join(", "));

  console.log("\n📊 总计:");
  console.log(`   晋级: ${qualifiedTeams.length} 支`);
  console.log(`   淘汰: ${eliminatedTeams.length} 支`);

  try {
    // 调用更新函数
    console.log("\n⏳ 发送交易...");
    const tx = await oracle.updatePlayoffResults(
      qualifiedTeams,
      eliminatedTeams
    );

    console.log("📤 交易哈希:", tx.hash);
    console.log("⏳ 等待确认...");

    // 等待交易确认
    const receipt = await tx.wait();
    console.log("✅ 交易已确认!");
    console.log(`   区块号: ${receipt.blockNumber}`);
    console.log(`   Gas使用: ${receipt.gasUsed.toString()}`);

    // 验证更新结果
    const [currentAfter, totalAfter] = await oracle.getQualifiedCount();
    console.log(`\n📈 更新后: ${currentAfter}/${totalAfter} 支球队`);
    console.log(`   新增晋级: ${currentAfter - currentBefore} 支`);

    // 查询新晋级球队
    console.log("\n✅ 验证新晋级球队:");
    for (const team of qualifiedTeams) {
      const isQualified = await oracle.isTeamQualified(team);
      const info = await oracle.teams(team);
      console.log(
        `   ${isQualified ? "✓" : "✗"} ${team} (${info.region}) - ${
          isQualified ? "已晋级" : "未晋级"
        }`
      );
    }

    console.log("\n🎉 世界杯48支参赛球队全部确定!");
    console.log("\n📅 下一步:");
    console.log("   - 等待小组赛抽签（预计2026年4月）");
    console.log("   - 抽签后更新小组分组信息");
  } catch (error) {
    console.error("\n❌ 错误:", error.message);

    if (error.message.includes("resolutionTime")) {
      console.log("\n⚠️  附加赛时间未到（合约限制3月31日后才能更新）");
    } else if (error.message.includes("Ownable")) {
      console.log("\n⚠️  你不是合约owner，无法执行更新");
      console.log("   合约owner地址:", await oracle.owner());
      console.log("   你的地址:", owner.address);
    } else {
      console.log("\n可能原因:");
      console.log("  1. Hardhat 网络已重启，合约需要重新部署");
      console.log("  2. 合约地址错误");
      console.log("  3. 网络连接问题");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
