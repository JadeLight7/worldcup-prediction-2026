// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WorldCupDataOracle
 * @dev 世界杯数据预言机，用于自动更新球队晋级状态
 */
contract WorldCupDataOracle is Ownable {

    // 球队信息
    struct Team {
        string name;
        string region;      // 大洲
        bool qualified;     // 是否已晋级
        uint256 qualifiedAt;// 晋级时间戳
        string group;       // 小组赛分组
    }

    // 比赛结果
    struct MatchResult {
        string homeTeam;
        string awayTeam;
        uint256 homeScore;
        uint256 awayScore;
        bool finished;
        uint256 timestamp;
    }

    // 状态
    uint256 public totalQualifiedTeams;
    uint256 public lastUpdateTime;
    bool public isGroupStageDrawn;  // 是否已抽签分组

    // 数据存储
    mapping(string => Team) public teams;
    string[] public allTeamNames;
    mapping(uint256 => MatchResult) public matchResults;

    // 事件
    event TeamQualified(string teamName, uint256 timestamp);
    event MatchResultUpdated(string homeTeam, string awayTeam, uint256 homeScore, uint256 awayScore);
    event GroupStageDrawn(uint256 timestamp);
    event DataUpdated(uint256 qualifiedCount, uint256 timestamp);

    constructor() Ownable(msg.sender) {
        // 初始化已确定的42支球队
        _initializeQualifiedTeams();
        totalQualifiedTeams = 42;
        lastUpdateTime = block.timestamp;
    }

    function _initializeQualifiedTeams() internal {
        // Hosts
        _addTeam(unicode"美国", "CONCACAF", true);
        _addTeam(unicode"加拿大", "CONCACAF", true);
        _addTeam(unicode"墨西哥", "CONCACAF", true);

        // UEFA
        _addTeam(unicode"英格兰", "UEFA", true);
        _addTeam(unicode"法国", "UEFA", true);
        _addTeam(unicode"西班牙", "UEFA", true);
        _addTeam(unicode"德国", "UEFA", true);
        _addTeam(unicode"葡萄牙", "UEFA", true);
        _addTeam(unicode"荷兰", "UEFA", true);
        _addTeam(unicode"比利时", "UEFA", true);
        _addTeam(unicode"克罗地亚", "UEFA", true);
        _addTeam(unicode"瑞士", "UEFA", true);
        _addTeam(unicode"奥地利", "UEFA", true);
        _addTeam(unicode"挪威", "UEFA", true);
        _addTeam(unicode"苏格兰", "UEFA", true);

        // CONMEBOL
        _addTeam(unicode"阿根廷", "CONMEBOL", true);
        _addTeam(unicode"巴西", "CONMEBOL", true);
        _addTeam(unicode"哥伦比亚", "CONMEBOL", true);
        _addTeam(unicode"乌拉圭", "CONMEBOL", true);
        _addTeam(unicode"厄瓜多尔", "CONMEBOL", true);
        _addTeam(unicode"巴拉圭", "CONMEBOL", true);

        // AFC
        _addTeam(unicode"日本", "AFC", true);
        _addTeam(unicode"伊朗", "AFC", true);
        _addTeam(unicode"韩国", "AFC", true);
        _addTeam(unicode"澳大利亚", "AFC", true);
        _addTeam(unicode"乌兹别克斯坦", "AFC", true);
        _addTeam(unicode"约旦", "AFC", true);
        _addTeam(unicode"卡塔尔", "AFC", true);
        _addTeam(unicode"沙特", "AFC", true);

        // CAF
        _addTeam(unicode"摩洛哥", "CAF", true);
        _addTeam(unicode"阿尔及利亚", "CAF", true);
        _addTeam(unicode"埃及", "CAF", true);
        _addTeam(unicode"塞内加尔", "CAF", true);
        _addTeam(unicode"突尼斯", "CAF", true);
        _addTeam(unicode"加纳", "CAF", true);
        _addTeam(unicode"科特迪瓦", "CAF", true);
        _addTeam(unicode"南非", "CAF", true);
        _addTeam(unicode"佛得角", "CAF", true);

        // CONCACAF
        _addTeam(unicode"巴拿马", "CONCACAF", true);
        _addTeam(unicode"库拉索", "CONCACAF", true);
        _addTeam(unicode"海地", "CONCACAF", true);

        // OFC
        _addTeam(unicode"新西兰", "OFC", true);
    }

    function _addTeam(string memory name, string memory region, bool qualified) internal {
        teams[name] = Team({
            name: name,
            region: region,
            qualified: qualified,
            qualifiedAt: block.timestamp,
            group: ""
        });
        allTeamNames.push(name);
    }

    // 更新附加赛结果（3月31日后调用）
    function updatePlayoffResults(
        string[] memory qualifiedTeams,
        string[] memory eliminatedTeams
    ) external onlyOwner {
        require(block.timestamp >= 1711843200, unicode"附加赛尚未结束"); // 2026-03-31 00:00:00 UTC

        for (uint i = 0; i < qualifiedTeams.length; i++) {
            teams[qualifiedTeams[i]].qualified = true;
            teams[qualifiedTeams[i]].qualifiedAt = block.timestamp;
            totalQualifiedTeams++;
            emit TeamQualified(qualifiedTeams[i], block.timestamp);
        }

        lastUpdateTime = block.timestamp;
        emit DataUpdated(totalQualifiedTeams, block.timestamp);
    }

    // 更新小组赛抽签结果
    function updateGroupStage(string[] memory teamNames, string[] memory groupAssignments) external onlyOwner {
        require(teamNames.length == groupAssignments.length, unicode"数组长度不匹配");
        require(totalQualifiedTeams == 48, unicode"48支球队尚未全部确定");

        for (uint i = 0; i < teamNames.length; i++) {
            teams[teamNames[i]].group = groupAssignments[i];
        }

        isGroupStageDrawn = true;
        emit GroupStageDrawn(block.timestamp);
    }

    // 获取已晋级球队列表
    function getQualifiedTeams() external view returns (string[] memory) {
        string[] memory result = new string[](totalQualifiedTeams);
        uint256 count = 0;

        for (uint i = 0; i < allTeamNames.length; i++) {
            if (teams[allTeamNames[i]].qualified) {
                result[count] = allTeamNames[i];
                count++;
            }
        }

        return result;
    }

    // 获取球队信息
    function getTeamInfo(string memory teamName) external view returns (Team memory) {
        return teams[teamName];
    }

    // 检查球队是否已晋级
    function isTeamQualified(string memory teamName) external view returns (bool) {
        return teams[teamName].qualified;
    }

    // 前端可以轮询这个值显示 "43/48 支球队"
    function getQualifiedCount() external view returns (uint256 current, uint256 total) {
        return (totalQualifiedTeams, 48);
    }
}
