// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EnhancedPredictionMarket
 * @dev 增强版预测市场，支持限价单、止损单、流动性激励、部分结算
 */
contract EnhancedPredictionMarket is ReentrancyGuard, Ownable, Pausable {
    // ============ 错误定义 ============
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error InvalidOutcomeIndex();
    error InvalidAmount();
    error InsufficientBalance();
    error InsufficientLiquidity();
    error InvalidPrice();
    error OrderNotFound();
    error OrderNotFillable();
    error UnauthorizedCancellation();
    error ResolutionTimeNotReached();
    error AlreadyClaimed();
    error EmergencyStopActive();
    error InvalidFeeRate();
    error OracleAlreadySet();
    error ConditionAlreadyInitialized();
    error NoClaimableWinnings();
    error TransferFailed();
    error InvalidDeadline();
    error DeadlinePassed();
    error SlippageExceeded();

    // ============ 枚举 ============
    enum OrderType {
        LimitBuy,      // 限价买单
        LimitSell,     // 限价卖单
        StopLoss,      // 止损单
        TakeProfit     // 止盈单
    }

    enum MarketStatus {
        Active,        // 活跃
        Paused,        // 暂停
        Resolved,      // 已结算
        Emergency      // 紧急状态
    }

    // ============ 结构体 ============
    struct MarketInfo {
        string question;
        string description;
        string[] outcomes;
        uint256 resolutionTime;
        uint256 fee;              // 交易手续费 (基点: 100 = 1%)
        uint256 creationFee;      // 市场创建费用
        address oracle;
        bool isResolved;
        uint256 winningOutcome;
        MarketStatus status;
    }

    struct Order {
        address trader;
        uint256 outcomeIndex;
        uint256 amount;           // 代币数量
        uint256 price;            // 目标价格 (0-10000, 10000 = 100%)
        uint256 stopPrice;        // 止损/止盈触发价格
        OrderType orderType;
        uint256 deadline;         // 订单过期时间
        uint256 timestamp;
        bool isActive;
    }

    struct LiquidityPosition {
        uint256 amount;           // 提供的流动性金额
        uint256 shares;           // LP代币份额
        uint256 rewardDebt;       // 已结算的奖励债务
        uint256 lastUpdateTime;   // 最后更新时间
    }

    struct PricePoint {
        uint256 timestamp;
        uint256 price;            // 价格 (0-10000)
        uint256 volume;           // 成交量
    }

    // ============ 状态变量 ============
    MarketInfo public marketInfo;

    IERC20 public collateralToken;
    ConditionalTokens public conditionalTokens;
    bytes32 public conditionId;

    // 订单簿
    mapping(uint256 => Order) public orders;
    uint256 public nextOrderId;
    mapping(uint256 => uint256[]) public activeOrders;  // outcomeIndex => orderIds

    // 用户持仓
    mapping(address => mapping(uint256 => uint256)) public positions;
    mapping(address => bool) public hasClaimed;

    // 流动性挖矿
    mapping(address => LiquidityPosition) public liquidityPositions;
    uint256 public totalLiquidity;
    uint256 public totalShares;
    uint256 public accRewardPerShare;     // 每份累计奖励
    uint256 public rewardRate;            // 每秒奖励率
    uint256 public lastRewardTime;
    uint256 public totalRewardsPaid;

    // 价格历史
    PricePoint[] public priceHistory;

    // 费用分配
    address public feeRecipient;          // 手续费接收地址
    uint256 public totalFeesCollected;    // 累计手续费
    uint256 public lpFeeShare;            // LP手续费分成比例 (基点)

    // 紧急控制
    bool public emergencyStop;

    // ============ 事件 ============
    event OrderPlaced(
        uint256 indexed orderId,
        address indexed trader,
        OrderType orderType,
        uint256 outcomeIndex,
        uint256 amount,
        uint256 price,
        uint256 deadline
    );

    event OrderFilled(
        uint256 indexed orderId,
        address indexed maker,
        address indexed taker,
        uint256 amount,
        uint256 price,
        uint256 fee
    );

    event OrderCancelled(uint256 indexed orderId, address indexed trader);
    event OrderExpired(uint256 indexed orderId);

    event MarketResolved(uint256 winningOutcome, address resolver);
    event PartialResolution(uint256 outcomeIndex, bool isValid);

    event Trade(
        address indexed buyer,
        address indexed seller,
        uint256 outcomeIndex,
        uint256 amount,
        uint256 price,
        uint256 fee
    );

    event LiquidityAdded(
        address indexed provider,
        uint256 amount,
        uint256 shares
    );

    event LiquidityRemoved(
        address indexed provider,
        uint256 amount,
        uint256 shares
    );

    event RewardsClaimed(address indexed provider, uint256 amount);

    event EmergencyStopActivated(address indexed activator);
    event EmergencyStopDeactivated(address indexed activator);

    event PriceUpdated(
        uint256 outcomeIndex,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 volume
    );

    event FeeDistributed(
        uint256 lpFee,
        uint256 protocolFee,
        uint256 oracleFee
    );

    // ============ 修饰器 ============
    modifier whenNotResolved() {
        if (marketInfo.isResolved) revert MarketAlreadyResolved();
        _;
    }

    modifier whenResolved() {
        if (!marketInfo.isResolved) revert MarketNotResolved();
        _;
    }

    modifier validOutcome(uint256 outcomeIndex) {
        if (outcomeIndex >= marketInfo.outcomes.length) revert InvalidOutcomeIndex();
        _;
    }

    modifier notEmergency() {
        if (emergencyStop) revert EmergencyStopActive();
        _;
    }

    // ============ 构造函数 ============
    constructor(
        string memory _question,
        string memory _description,
        string[] memory _outcomes,
        uint256 _resolutionTime,
        address _collateralToken,
        address _conditionalTokens,
        uint256 _fee,
        uint256 _creationFee,
        address _oracle,
        address _feeRecipient,
        uint256 _lpFeeShare
    ) Ownable(msg.sender) {
        if (_outcomes.length < 2) revert InvalidOutcomeIndex();
        if (_resolutionTime <= block.timestamp) revert InvalidDeadline();
        if (_fee > 1000) revert InvalidFeeRate(); // 最大10%
        if (_lpFeeShare > 10000) revert InvalidFeeRate();

        marketInfo = MarketInfo({
            question: _question,
            description: _description,
            outcomes: _outcomes,
            resolutionTime: _resolutionTime,
            fee: _fee,
            creationFee: _creationFee,
            oracle: _oracle,
            isResolved: false,
            winningOutcome: 0,
            status: MarketStatus.Active
        });

        collateralToken = IERC20(_collateralToken);
        conditionalTokens = ConditionalTokens(_conditionalTokens);
        feeRecipient = _feeRecipient;
        lpFeeShare = _lpFeeShare;
        lastRewardTime = block.timestamp;
    }

    // ============ 订单管理 ============

    /**
     * @dev 下限价买单
     * @param outcomeIndex 结果索引
     * @param amount 购买数量
     * @param maxPrice 最高接受价格
     * @param deadline 订单过期时间
     */
    function placeLimitBuyOrder(
        uint256 outcomeIndex,
        uint256 amount,
        uint256 maxPrice,
        uint256 deadline
    ) external nonReentrant whenNotPaused whenNotResolved validOutcome(outcomeIndex) notEmergency {
        if (amount == 0) revert InvalidAmount();
        if (maxPrice == 0 || maxPrice > 10000) revert InvalidPrice();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        uint256 cost = (amount * maxPrice) / 10000;
        uint256 orderCost = cost + ((cost * marketInfo.fee) / 10000);

        // 转移资金
        if (!collateralToken.transferFrom(msg.sender, address(this), orderCost))
            revert TransferFailed();

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            trader: msg.sender,
            outcomeIndex: outcomeIndex,
            amount: amount,
            price: maxPrice,
            stopPrice: 0,
            orderType: OrderType.LimitBuy,
            deadline: deadline,
            timestamp: block.timestamp,
            isActive: true
        });

        activeOrders[outcomeIndex].push(orderId);

        emit OrderPlaced(orderId, msg.sender, OrderType.LimitBuy, outcomeIndex, amount, maxPrice, deadline);
    }

    /**
     * @dev 下限价卖单
     */
    function placeLimitSellOrder(
        uint256 outcomeIndex,
        uint256 amount,
        uint256 minPrice,
        uint256 deadline
    ) external nonReentrant whenNotPaused whenNotResolved validOutcome(outcomeIndex) notEmergency {
        if (amount == 0) revert InvalidAmount();
        if (positions[msg.sender][outcomeIndex] < amount) revert InsufficientBalance();
        if (minPrice == 0 || minPrice > 10000) revert InvalidPrice();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        // 锁定持仓
        positions[msg.sender][outcomeIndex] -= amount;

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            trader: msg.sender,
            outcomeIndex: outcomeIndex,
            amount: amount,
            price: minPrice,
            stopPrice: 0,
            orderType: OrderType.LimitSell,
            deadline: deadline,
            timestamp: block.timestamp,
            isActive: true
        });

        activeOrders[outcomeIndex].push(orderId);

        emit OrderPlaced(orderId, msg.sender, OrderType.LimitSell, outcomeIndex, amount, minPrice, deadline);
    }

    /**
     * @dev 下止损单
     */
    function placeStopLossOrder(
        uint256 outcomeIndex,
        uint256 amount,
        uint256 triggerPrice,
        uint256 sellPrice,
        uint256 deadline
    ) external nonReentrant whenNotPaused whenNotResolved validOutcome(outcomeIndex) notEmergency {
        if (amount == 0) revert InvalidAmount();
        if (positions[msg.sender][outcomeIndex] < amount) revert InsufficientBalance();
        if (triggerPrice == 0 || triggerPrice > 10000) revert InvalidPrice();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        positions[msg.sender][outcomeIndex] -= amount;

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            trader: msg.sender,
            outcomeIndex: outcomeIndex,
            amount: amount,
            price: sellPrice,
            stopPrice: triggerPrice,
            orderType: OrderType.StopLoss,
            deadline: deadline,
            timestamp: block.timestamp,
            isActive: true
        });

        activeOrders[outcomeIndex].push(orderId);

        emit OrderPlaced(orderId, msg.sender, OrderType.StopLoss, outcomeIndex, amount, sellPrice, deadline);
    }

    /**
     * @dev 执行订单（任何人都可以调用）
     */
    function fillOrder(uint256 orderId, uint256 fillAmount) external nonReentrant whenNotPaused whenNotResolved {
        Order storage order = orders[orderId];
        if (!order.isActive) revert OrderNotFillable();
        if (block.timestamp > order.deadline) {
            order.isActive = false;
            emit OrderExpired(orderId);
            revert DeadlinePassed();
        }

        // 检查止损/止盈触发条件
        if (order.orderType == OrderType.StopLoss || order.orderType == OrderType.TakeProfit) {
            uint256 currentPrice = getCurrentPrice(order.outcomeIndex);
            if (order.orderType == OrderType.StopLoss && currentPrice > order.stopPrice) {
                revert OrderNotFillable();
            }
            if (order.orderType == OrderType.TakeProfit && currentPrice < order.stopPrice) {
                revert OrderNotFillable();
            }
        }

        // 执行交易...
        _executeTrade(orderId, fillAmount);
    }

    /**
     * @dev 取消订单
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        if (!order.isActive) revert OrderNotFound();
        if (order.trader != msg.sender && msg.sender != owner()) revert UnauthorizedCancellation();

        order.isActive = false;

        // 退还资金或持仓
        if (order.orderType == OrderType.LimitBuy) {
            uint256 cost = (order.amount * order.price) / 10000;
            uint256 refund = cost + ((cost * marketInfo.fee) / 10000);
            if (!collateralToken.transfer(order.trader, refund)) revert TransferFailed();
        } else {
            positions[order.trader][order.outcomeIndex] += order.amount;
        }

        emit OrderCancelled(orderId, msg.sender);
    }

    // ============ 流动性挖矿 ============

    /**
     * @dev 添加流动性
     */
    function addLiquidity(uint256 amount) external nonReentrant whenNotPaused whenNotResolved notEmergency {
        if (amount == 0) revert InvalidAmount();

        _updateReward();

        if (!collateralToken.transferFrom(msg.sender, address(this), amount))
            revert TransferFailed();

        uint256 shares;
        if (totalShares == 0) {
            shares = amount;
        } else {
            shares = (amount * totalShares) / totalLiquidity;
        }

        LiquidityPosition storage position = liquidityPositions[msg.sender];
        position.amount += amount;
        position.shares += shares;
        position.lastUpdateTime = block.timestamp;
        position.rewardDebt = (position.shares * accRewardPerShare) / 1e12;

        totalLiquidity += amount;
        totalShares += shares;

        emit LiquidityAdded(msg.sender, amount, shares);
    }

    /**
     * @dev 移除流动性
     */
    function removeLiquidity(uint256 shares) external nonReentrant whenNotResolved {
        LiquidityPosition storage position = liquidityPositions[msg.sender];
        if (position.shares < shares) revert InsufficientBalance();

        _updateReward();
        _claimRewards();

        uint256 amount = (shares * totalLiquidity) / totalShares;

        position.shares -= shares;
        position.amount -= amount;
        position.rewardDebt = (position.shares * accRewardPerShare) / 1e12;

        totalLiquidity -= amount;
        totalShares -= shares;

        if (!collateralToken.transfer(msg.sender, amount)) revert TransferFailed();

        emit LiquidityRemoved(msg.sender, amount, shares);
    }

    /**
     * @dev 领取流动性挖矿奖励
     */
    function claimLiquidityRewards() external nonReentrant {
        _updateReward();
        _claimRewards();
    }

    function _updateReward() internal {
        if (block.timestamp <= lastRewardTime) return;

        if (totalShares == 0) {
            lastRewardTime = block.timestamp;
            return;
        }

        uint256 multiplier = block.timestamp - lastRewardTime;
        uint256 reward = multiplier * rewardRate;

        accRewardPerShare += (reward * 1e12) / totalShares;
        lastRewardTime = block.timestamp;
    }

    function _claimRewards() internal {
        LiquidityPosition storage position = liquidityPositions[msg.sender];
        uint256 pending = (position.shares * accRewardPerShare) / 1e12 - position.rewardDebt;

        if (pending > 0) {
            position.rewardDebt = (position.shares * accRewardPerShare) / 1e12;
            totalRewardsPaid += pending;
            // 实际发放奖励...
        }
    }

    // ============ 交易执行 ============

    function _executeTrade(uint256 orderId, uint256 fillAmount) internal {
        Order storage order = orders[orderId];
        uint256 executionPrice = getCurrentPrice(order.outcomeIndex);

        // 验证价格条件
        if (order.orderType == OrderType.LimitBuy && executionPrice > order.price) {
            revert SlippageExceeded();
        }
        if (order.orderType == OrderType.LimitSell && executionPrice < order.price) {
            revert SlippageExceeded();
        }

        uint256 tradeValue = (fillAmount * executionPrice) / 10000;
        uint256 fee = (tradeValue * marketInfo.fee) / 10000;

        // 分配手续费
        _distributeFees(fee);

        // 更新持仓...
        positions[order.trader][order.outcomeIndex] += fillAmount;

        order.amount -= fillAmount;
        if (order.amount == 0) {
            order.isActive = false;
        }

        _updatePriceHistory(order.outcomeIndex, executionPrice, fillAmount);

        emit OrderFilled(orderId, order.trader, msg.sender, fillAmount, executionPrice, fee);
    }

    function _distributeFees(uint256 fee) internal {
        uint256 lpFee = (fee * lpFeeShare) / 10000;
        uint256 protocolFee = fee - lpFee;

        // 累加到流动性奖励池
        rewardRate += lpFee / 86400; // 分散到一天

        // 协议费用
        if (protocolFee > 0) {
            if (!collateralToken.transfer(feeRecipient, protocolFee)) revert TransferFailed();
        }

        totalFeesCollected += fee;

        emit FeeDistributed(lpFee, protocolFee, 0);
    }

    // ============ 价格与历史 ============

    function getCurrentPrice(uint256 outcomeIndex) public view returns (uint256) {
        // 基于流动性池计算价格（简化版CPMM）
        if (totalLiquidity == 0) return 10000 / marketInfo.outcomes.length;

        // 实际实现应该基于各结果代币的储备
        return 5000; // 临时返回值
    }

    function _updatePriceHistory(uint256 outcomeIndex, uint256 price, uint256 volume) internal {
        priceHistory.push(PricePoint({
            timestamp: block.timestamp,
            price: price,
            volume: volume
        }));

        emit PriceUpdated(outcomeIndex, 0, price, volume);
    }

    // ============ 市场结算 ============

    /**
     * @dev 结算市场（完整结算）
     */
    function resolve(uint256 _winningOutcome) external whenNotResolved {
        if (msg.sender != marketInfo.oracle && msg.sender != owner()) revert UnauthorizedCancellation();
        if (block.timestamp < marketInfo.resolutionTime) revert ResolutionTimeNotReached();
        if (_winningOutcome >= marketInfo.outcomes.length) revert InvalidOutcomeIndex();

        marketInfo.isResolved = true;
        marketInfo.winningOutcome = _winningOutcome;
        marketInfo.status = MarketStatus.Resolved;

        // 结算所有条件代币
        conditionalTokens.reportPayouts(conditionId, _winningOutcome + 1);

        emit MarketResolved(_winningOutcome, msg.sender);
    }

    /**
     * @dev 部分结算（用于多结果市场逐步结算）
     */
    function partialResolve(uint256 outcomeIndex, bool isValid) external onlyOwner whenNotResolved {
        // 标记特定结果的有效性
        emit PartialResolution(outcomeIndex, isValid);
    }

    /**
     * @dev 领取获胜奖励
     */
    function claimWinnings() external nonReentrant whenResolved {
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();

        uint256 winningPosition = positions[msg.sender][marketInfo.winningOutcome];
        if (winningPosition == 0) revert NoClaimableWinnings();

        hasClaimed[msg.sender] = true;

        // 赎回条件代币
        uint256[] memory indexSets = new uint256[](marketInfo.outcomes.length);
        for (uint256 i = 0; i < marketInfo.outcomes.length; i++) {
            indexSets[i] = 1 << i;
        }

        conditionalTokens.redeemPositions(
            collateralToken,
            bytes32(0),
            conditionId,
            indexSets
        );
    }

    // ============ 紧急控制 ============

    function activateEmergencyStop() external onlyOwner {
        emergencyStop = true;
        marketInfo.status = MarketStatus.Emergency;
        emit EmergencyStopActivated(msg.sender);
    }

    function deactivateEmergencyStop() external onlyOwner {
        emergencyStop = false;
        marketInfo.status = MarketStatus.Active;
        emit EmergencyStopDeactivated(msg.sender);
    }

    function emergencyWithdraw() external onlyOwner {
        if (!emergencyStop) revert EmergencyStopActive();
        uint256 balance = collateralToken.balanceOf(address(this));
        if (!collateralToken.transfer(owner(), balance)) revert TransferFailed();
    }

    // ============ 管理员功能 ============

    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
    }

    // ============ 视图函数 ============

    function getMarketInfo() external view returns (MarketInfo memory) {
        return marketInfo;
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        uint256[] memory userPos = new uint256[](marketInfo.outcomes.length);
        for (uint256 i = 0; i < marketInfo.outcomes.length; i++) {
            userPos[i] = positions[user][i];
        }
        return userPos;
    }

    function getPendingRewards(address provider) external view returns (uint256) {
        LiquidityPosition memory position = liquidityPositions[provider];
        return (position.shares * accRewardPerShare) / 1e12 - position.rewardDebt;
    }

    function getPriceHistory(uint256 start, uint256 end) external view returns (PricePoint[] memory) {
        require(end >= start && end < priceHistory.length, "Invalid range");
        PricePoint[] memory result = new PricePoint[](end - start + 1);
        for (uint256 i = start; i <= end; i++) {
            result[i - start] = priceHistory[i];
        }
        return result;
    }

    function getActiveOrders(uint256 outcomeIndex) external view returns (uint256[] memory) {
        return activeOrders[outcomeIndex];
    }
}
