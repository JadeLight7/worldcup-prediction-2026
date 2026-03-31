// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./EnhancedPredictionMarket.sol";
import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EnhancedPredictionMarketFactory
 * @dev 增强版预测市场工厂，支持限价单、止损单、流动性挖矿
 */
contract EnhancedPredictionMarketFactory is Ownable {
    // ============ 错误定义 ============
    error InvalidOutcomeCount();
    error InvalidResolutionTime();
    error EmptyQuestion();
    error InvalidFeeRate();
    error MarketCreationFailed();

    // ============ 状态变量 ============

    // 所有创建的市场
    address[] public allMarkets;

    // 市场地址 => 是否为本工厂创建
    mapping(address => bool) public isMarketFromFactory;

    // 条件代币合约（单例）
    ConditionalTokens public conditionalTokens;

    // 抵押代币
    address public collateralToken;

    // 默认配置
    uint256 public defaultFee = 200;           // 2% 交易手续费
    uint256 public creationFee = 100e6;        // 100 USDC 创建费用
    uint256 public lpFeeShare = 5000;          // 50% 手续费分给LP
    address public defaultOracle;
    address public feeRecipient;

    // 奖励代币（可选，用于流动性挖矿）
    address public rewardToken;
    uint256 public baseRewardRate = 1e15;      // 基础每秒奖励率

    // ============ 事件 ============
    event MarketCreated(
        address indexed marketAddress,
        address indexed creator,
        string question,
        bytes32 indexed conditionId,
        uint256 outcomeCount,
        uint256 resolutionTime
    );

    event FeeConfigUpdated(
        uint256 defaultFee,
        uint256 creationFee,
        uint256 lpFeeShare
    );

    event RewardConfigUpdated(
        address rewardToken,
        uint256 baseRewardRate
    );

    // ============ 构造函数 ============
    constructor(
        address _conditionalTokens,
        address _collateralToken,
        address _defaultOracle,
        address _feeRecipient
    ) Ownable(msg.sender) {
        conditionalTokens = ConditionalTokens(_conditionalTokens);
        collateralToken = _collateralToken;
        defaultOracle = _defaultOracle;
        feeRecipient = _feeRecipient;
    }

    // ============ 市场创建 ============

    /**
     * @dev 创建新的增强版预测市场
     * @param question 问题描述
     * @param description 详细描述
     * @param outcomes 结果选项数组
     * @param resolutionTime 结算时间戳
     * @return marketAddress 新创建的市场地址
     */
    function createMarket(
        string memory question,
        string memory description,
        string[] memory outcomes,
        uint256 resolutionTime
    ) public returns (address marketAddress) {
        if (outcomes.length < 2) revert InvalidOutcomeCount();
        if (resolutionTime <= block.timestamp) revert InvalidResolutionTime();
        if (bytes(question).length == 0) revert EmptyQuestion();

        // 收取创建费用
        if (creationFee > 0) {
            require(
                IERC20(collateralToken).transferFrom(msg.sender, feeRecipient, creationFee),
                unicode"创建费用转账失败"
            );
        }

        // 创建条件ID
        bytes32 questionId = keccak256(abi.encodePacked(
            question,
            block.timestamp,
            msg.sender
        ));

        bytes32 conditionId = keccak256(abi.encodePacked(
            address(this),
            questionId,
            outcomes.length
        ));

        // 在ConditionalTokens中准备条件
        conditionalTokens.prepareCondition(
            address(this),
            questionId,
            outcomes.length
        );

        // 创建增强版市场合约
        EnhancedPredictionMarket market = new EnhancedPredictionMarket(
            question,
            description,
            outcomes,
            resolutionTime,
            collateralToken,
            address(conditionalTokens),
            defaultFee,
            creationFee,
            defaultOracle,
            feeRecipient,
            lpFeeShare
        );

        marketAddress = address(market);

        // 设置奖励率
        market.setRewardRate(baseRewardRate);

        // 转移市场所有权给调用者
        market.transferOwnership(msg.sender);

        // 记录市场
        allMarkets.push(marketAddress);
        isMarketFromFactory[marketAddress] = true;

        emit MarketCreated(
            marketAddress,
            msg.sender,
            question,
            conditionId,
            outcomes.length,
            resolutionTime
        );

        return marketAddress;
    }

    /**
     * @dev 创建二元市场（是/否）
     */
    function createBinaryMarket(
        string memory question,
        string memory description,
        uint256 resolutionTime
    ) external returns (address) {
        string[] memory outcomes = new string[](2);
        outcomes[0] = unicode"否";
        outcomes[1] = unicode"是";

        return createMarket(question, description, outcomes, resolutionTime);
    }

    /**
     * @dev 批量创建相关市场（如小组出线系列）
     */
    function createGroupMarkets(
        string memory groupName,
        string[] memory teams,
        uint256 resolutionTime
    ) external returns (address[] memory marketAddresses) {
        marketAddresses = new address[](teams.length);

        for (uint256 i = 0; i < teams.length; i++) {
            string memory question = string(abi.encodePacked(
                teams[i],
                unicode"能从",
                groupName,
                unicode"出线吗？"
            ));
            string memory description = string(abi.encodePacked(
                groupName,
                unicode"出线预测：",
                teams[i]
            ));

            marketAddresses[i] = createMarket(
                question,
                description,
                _createBinaryOutcomes(),
                resolutionTime
            );
        }
    }

    /**
     * @dev 创建冠军预测市场（多结果）
     */
    function createChampionMarket(
        string memory tournament,
        string[] memory teams,
        uint256 resolutionTime
    ) external returns (address) {
        string memory question = string(abi.encodePacked(
            unicode"哪支球队会赢得",
            tournament,
            unicode"冠军？"
        ));

        return createMarket(question, "", teams, resolutionTime);
    }

    // ============ 视图函数 ============

    function getMarketCount() external view returns (uint256) {
        return allMarkets.length;
    }

    function getMarkets(
        uint256 start,
        uint256 limit
    ) external view returns (address[] memory) {
        require(start < allMarkets.length, unicode"起始索引超出范围");

        uint256 end = start + limit;
        if (end > allMarkets.length) {
            end = allMarkets.length;
        }

        address[] memory result = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = allMarkets[i];
        }

        return result;
    }

    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    function getRecentMarkets(uint256 count) external view returns (address[] memory) {
        uint256 limit = count > allMarkets.length ? allMarkets.length : count;
        address[] memory result = new address[](limit);

        for (uint256 i = 0; i < limit; i++) {
            result[i] = allMarkets[allMarkets.length - 1 - i];
        }

        return result;
    }

    // ============ 管理员功能 ============

    function setDefaultFee(uint256 _fee) external onlyOwner {
        if (_fee > 1000) revert InvalidFeeRate(); // 最大10%
        defaultFee = _fee;
        emit FeeConfigUpdated(defaultFee, creationFee, lpFeeShare);
    }

    function setCreationFee(uint256 _fee) external onlyOwner {
        creationFee = _fee;
        emit FeeConfigUpdated(defaultFee, creationFee, lpFeeShare);
    }

    function setLpFeeShare(uint256 _share) external onlyOwner {
        if (_share > 10000) revert InvalidFeeRate();
        lpFeeShare = _share;
        emit FeeConfigUpdated(defaultFee, creationFee, lpFeeShare);
    }

    function setDefaultOracle(address _oracle) external onlyOwner {
        defaultOracle = _oracle;
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }

    function setRewardConfig(
        address _rewardToken,
        uint256 _baseRate
    ) external onlyOwner {
        rewardToken = _rewardToken;
        baseRewardRate = _baseRate;
        emit RewardConfigUpdated(_rewardToken, _baseRate);
    }

    // ============ 内部函数 ============

    function _createBinaryOutcomes() internal pure returns (string[] memory) {
        string[] memory outcomes = new string[](2);
        outcomes[0] = unicode"否";
        outcomes[1] = unicode"是";
        return outcomes;
    }
}
