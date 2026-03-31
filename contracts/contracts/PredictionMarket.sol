// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionMarket
 * @dev 单个预测市场实例，支持订单簿交易
 */
contract PredictionMarket is ReentrancyGuard, Ownable {

    // 市场信息
    string public question;
    string[] public outcomes;
    uint256 public resolutionTime;
    uint256 public fee; // 手续费，基点 (100 = 1%)
    address public oracle; // 预言机/结算者地址
    bool public isResolved;
    uint256 public winningOutcome;

    // 抵押代币
    IERC20 public collateralToken;
    ConditionalTokens public conditionalTokens;

    // 条件ID
    bytes32 public conditionId;

    // 订单簿结构
    struct Order {
        address trader;
        uint256 outcomeIndex; // 预测的结果索引
        uint256 amount; // 代币数量
        uint256 price; // 价格 (0-1000, 1000 = 100%)
        bool isBuy; // true = 买单, false = 卖单
        uint256 timestamp;
    }

    // 订单ID => 订单
    mapping(uint256 => Order) public orders;
    uint256 public nextOrderId;

    // 结果索引 => 买单列表
    mapping(uint256 => uint256[]) public buyOrders;

    // 结果索引 => 卖单列表
    mapping(uint256 => uint256[]) public sellOrders;

    // 用户持仓: 用户 => 结果索引 => 数量
    mapping(address => mapping(uint256 => uint256)) public positions;

    // 累计交易量
    uint256 public totalVolume;

    // 价格历史记录 (用于图表)
    struct PricePoint {
        uint256 timestamp;
        uint256 price; // 当前价格 (0-1000)
    }
    PricePoint[] public priceHistory;

    // 事件
    event OrderPlaced(
        uint256 indexed orderId,
        address indexed trader,
        uint256 outcomeIndex,
        uint256 amount,
        uint256 price,
        bool isBuy
    );

    event OrderFilled(
        uint256 indexed orderId,
        address indexed maker,
        address indexed taker,
        uint256 amount,
        uint256 price
    );

    event OrderCancelled(uint256 indexed orderId);

    event Trade(
        address indexed buyer,
        address indexed seller,
        uint256 outcomeIndex,
        uint256 amount,
        uint256 price
    );

    event MarketResolved(uint256 winningOutcome);

    constructor(
        string memory _question,
        string[] memory _outcomes,
        uint256 _resolutionTime,
        address _collateralToken,
        address _conditionalTokens,
        uint256 _fee,
        address _oracle
    ) Ownable(msg.sender) {
        require(_outcomes.length >= 2, unicode"至少需要2个结果");
        require(_resolutionTime > block.timestamp, unicode"结算时间必须在将来");

        question = _question;
        outcomes = _outcomes;
        resolutionTime = _resolutionTime;
        collateralToken = IERC20(_collateralToken);
        conditionalTokens = ConditionalTokens(_conditionalTokens);
        fee = _fee;
        oracle = _oracle;
    }

    /**
     * @dev 初始化条件代币
     */
    function initializeCondition(bytes32 _conditionId) external onlyOwner {
        require(conditionId == bytes32(0), unicode"条件已初始化");
        conditionId = _conditionId;
    }

    /**
     * @dev 存入流动性（为AMM提供流动性）
     */
    function depositLiquidity(uint256 amount) external nonReentrant {
        require(!isResolved, unicode"市场已结算");
        require(amount > 0, unicode"金额必须大于0");

        // 转移抵押品
        require(
            collateralToken.transferFrom(msg.sender, address(this), amount),
            unicode"转账失败"
        );

        // 拆分位置代币并分配给LP
        uint256[] memory partition = new uint256[](outcomes.length);
        for (uint256 i = 0; i < outcomes.length; i++) {
            partition[i] = 1 << i;
        }

        // 批准并拆分
        collateralToken.approve(address(conditionalTokens), amount);
        conditionalTokens.splitPosition(
            collateralToken,
            bytes32(0),
            conditionId,
            partition,
            amount
        );

        // 记录LP份额（简化版，实际应该使用LP代币）
        // 这里简化为直接持有
    }

    /**
     * @dev 以当前市场价格购买份额（AMM方式）
     */
    function buy(uint256 outcomeIndex, uint256 tokenAmount) external nonReentrant {
        require(!isResolved, unicode"市场已结算");
        require(outcomeIndex < outcomes.length, unicode"无效结果索引");
        require(tokenAmount > 0, unicode"金额必须大于0");

        // 计算成本（简化版恒定乘积公式）
        uint256 cost = calculateBuyCost(outcomeIndex, tokenAmount);
        uint256 feeAmount = (cost * fee) / 10000;
        uint256 totalCost = cost + feeAmount;

        // 转移抵押品
        require(
            collateralToken.transferFrom(msg.sender, address(this), totalCost),
            unicode"转账失败"
        );

        // 转移条件代币给用户
        bytes32 positionId = conditionalTokens.getPositionId(
            collateralToken,
            keccak256(abi.encodePacked(
                bytes32(0),
                conditionId,
                1 << outcomeIndex
            ))
        );

        // 这里简化处理，实际应该从AMM池转移
        positions[msg.sender][outcomeIndex] += tokenAmount;

        totalVolume += totalCost;

        // 更新价格历史
        updatePriceHistory(getCurrentPrice(outcomeIndex));

        emit Trade(address(this), msg.sender, outcomeIndex, tokenAmount, cost);
    }

    /**
     * @dev 卖出份额
     */
    function sell(uint256 outcomeIndex, uint256 tokenAmount) external nonReentrant {
        require(!isResolved, unicode"市场已结算");
        require(outcomeIndex < outcomes.length, unicode"无效结果索引");
        require(tokenAmount > 0, unicode"金额必须大于0");
        require(positions[msg.sender][outcomeIndex] >= tokenAmount, unicode"持仓不足");

        // 计算卖出所得
        uint256 proceeds = calculateSellProceeds(outcomeIndex, tokenAmount);
        uint256 feeAmount = (proceeds * fee) / 10000;
        uint256 netProceeds = proceeds - feeAmount;

        // 扣除用户持仓
        positions[msg.sender][outcomeIndex] -= tokenAmount;

        // 转移抵押品给用户
        require(
            collateralToken.transfer(msg.sender, netProceeds),
            unicode"转账失败"
        );

        totalVolume += proceeds;

        updatePriceHistory(getCurrentPrice(outcomeIndex));

        emit Trade(msg.sender, address(this), outcomeIndex, tokenAmount, proceeds);
    }

    /**
     * @dev 计算购买成本（简化版LMSR）
     */
    function calculateBuyCost(
        uint256 outcomeIndex,
        uint256 tokenAmount
    ) public view returns (uint256) {
        // 简化版：假设恒定价格（实际应使用LMSR或CPMM）
        uint256 currentPrice = getCurrentPrice(outcomeIndex);
        return (tokenAmount * currentPrice) / 1000;
    }

    /**
     * @dev 计算卖出所得
     */
    function calculateSellProceeds(
        uint256 outcomeIndex,
        uint256 tokenAmount
    ) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice(outcomeIndex);
        return (tokenAmount * currentPrice) / 1000;
    }

    /**
     * @dev 获取当前价格（基于持仓比例）
     */
    function getCurrentPrice(uint256 outcomeIndex) public view returns (uint256) {
        // 简化版：基于持仓比例计算价格
        // 实际应该基于流动性池计算
        uint256 totalPositions = 0;
        for (uint256 i = 0; i < outcomes.length; i++) {
            totalPositions += getPoolBalance(i);
        }

        if (totalPositions == 0) {
            return 1000 / outcomes.length; // 均匀分布
        }

        uint256 poolBalance = getPoolBalance(outcomeIndex);
        // 价格与持仓量成反比
        return 1000 - ((poolBalance * 1000) / totalPositions);
    }

    /**
     * @dev 获取池子中某个结果的代币余额（简化版）
     */
    function getPoolBalance(uint256 outcomeIndex) public view returns (uint256) {
        // 简化：返回固定值，实际应该从ConditionalTokens查询
        return 1000;
    }

    /**
     * @dev 更新价格历史
     */
    function updatePriceHistory(uint256 price) internal {
        priceHistory.push(PricePoint({
            timestamp: block.timestamp,
            price: price
        }));
    }

    /**
     * @dev 结算市场
     */
    function resolve(uint256 _winningOutcome) external {
        require(msg.sender == oracle || msg.sender == owner(), unicode"无权结算");
        require(!isResolved, unicode"市场已结算");
        require(block.timestamp >= resolutionTime, unicode"未到结算时间");
        require(_winningOutcome < outcomes.length, unicode"无效结果");

        isResolved = true;
        winningOutcome = _winningOutcome;

        // 调用ConditionalTokens结算
        conditionalTokens.reportPayouts(conditionId, _winningOutcome + 1);

        emit MarketResolved(_winningOutcome);
    }

    /**
     * @dev 领取奖励
     */
    function claimWinnings() external nonReentrant {
        require(isResolved, unicode"市场未结算");

        uint256 userPosition = positions[msg.sender][winningOutcome];
        require(userPosition > 0, unicode"没有获胜持仓");

        positions[msg.sender][winningOutcome] = 0;

        // 赎回条件代币
        uint256[] memory indexSets = new uint256[](outcomes.length);
        for (uint256 i = 0; i < outcomes.length; i++) {
            indexSets[i] = 1 << i;
        }

        conditionalTokens.redeemPositions(
            collateralToken,
            bytes32(0),
            conditionId,
            indexSets
        );
    }

    /**
     * @dev 获取市场信息
     */
    function getMarketInfo() external view returns (
        string memory _question,
        string[] memory _outcomes,
        uint256 _resolutionTime,
        bool _isResolved,
        uint256 _winningOutcome,
        uint256 _totalVolume,
        uint256 _fee
    ) {
        return (
            question,
            outcomes,
            resolutionTime,
            isResolved,
            winningOutcome,
            totalVolume,
            fee
        );
    }

    /**
     * @dev 获取用户持仓
     */
    function getUserPositions(address user) external view returns (uint256[] memory) {
        uint256[] memory userPos = new uint256[](outcomes.length);
        for (uint256 i = 0; i < outcomes.length; i++) {
            userPos[i] = positions[user][i];
        }
        return userPos;
    }

    /**
     * @dev 获取所有当前价格
     */
    function getAllPrices() external view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](outcomes.length);
        for (uint256 i = 0; i < outcomes.length; i++) {
            prices[i] = getCurrentPrice(i);
        }
        return prices;
    }
}
