// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./PredictionMarket.sol";
import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionMarketFactory
 * @dev 预测市场工厂，用于创建新的预测市场
 */
contract PredictionMarketFactory is Ownable {

    // 所有创建的市场
    address[] public allMarkets;

    // 市场地址 => 是否为本工厂创建
    mapping(address => bool) public isMarketFromFactory;

    // 条件代币合约（单例）
    ConditionalTokens public conditionalTokens;

    // 抵押代币
    address public collateralToken;

    // 默认手续费 (2% = 200)
    uint256 public defaultFee = 200;

    // 默认预言机地址
    address public defaultOracle;

    // 事件
    event MarketCreated(
        address indexed marketAddress,
        string question,
        bytes32 indexed conditionId,
        uint256 outcomeCount
    );

    constructor(
        address _conditionalTokens,
        address _collateralToken,
        address _defaultOracle
    ) Ownable(msg.sender) {
        conditionalTokens = ConditionalTokens(_conditionalTokens);
        collateralToken = _collateralToken;
        defaultOracle = _defaultOracle;
    }

    /**
     * @dev 创建新的预测市场
     * @param question 问题描述
     * @param outcomes 结果选项数组
     * @param resolutionTime 结算时间戳
     * @return marketAddress 新创建的市场地址
     */
    function createMarket(
        string memory question,
        string[] memory outcomes,
        uint256 resolutionTime
    ) public returns (address marketAddress) {
        require(outcomes.length >= 2, unicode"至少需要2个结果");
        require(resolutionTime > block.timestamp, unicode"结算时间必须在将来");
        require(bytes(question).length > 0, unicode"问题不能为空");

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

        // 创建新的市场合约
        PredictionMarket market = new PredictionMarket(
            question,
            outcomes,
            resolutionTime,
            collateralToken,
            address(conditionalTokens),
            defaultFee,
            defaultOracle
        );

        marketAddress = address(market);

        // 初始化条件
        market.initializeCondition(conditionId);

        // 转移市场所有权给调用者
        market.transferOwnership(msg.sender);

        // 记录市场
        allMarkets.push(marketAddress);
        isMarketFromFactory[marketAddress] = true;

        emit MarketCreated(marketAddress, question, conditionId, outcomes.length);

        return marketAddress;
    }

    /**
     * @dev 创建二元市场（Yes/No）
     */
    function createBinaryMarket(
        string memory question,
        uint256 resolutionTime
    ) external returns (address) {
        string[] memory outcomes = new string[](2);
        outcomes[0] = "No";
        outcomes[1] = "Yes";

        return createMarket(question, outcomes, resolutionTime);
    }

    /**
     * @dev 获取所有市场数量
     */
    function getMarketCount() external view returns (uint256) {
        return allMarkets.length;
    }

    /**
     * @dev 分页获取市场列表
     */
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

    /**
     * @dev 更新默认手续费
     */
    function setDefaultFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, unicode"手续费不能超过10%");
        defaultFee = _fee;
    }

    /**
     * @dev 更新默认预言机
     */
    function setDefaultOracle(address _oracle) external onlyOwner {
        defaultOracle = _oracle;
    }

    /**
     * @dev 更新抵押代币
     */
    function setCollateralToken(address _token) external onlyOwner {
        collateralToken = _token;
    }
}
