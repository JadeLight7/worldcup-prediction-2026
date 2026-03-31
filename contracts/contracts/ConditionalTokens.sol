// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ConditionalTokens
 * @dev ERC1155 实现的条件代币，用于表示预测市场的不同结果
 */
contract ConditionalTokens is ERC1155, Ownable, ReentrancyGuard {

    // 条件ID => 是否已经拆分
    mapping(bytes32 => bool) public isSplit;

    // 条件ID => 结算结果（0表示未结算）
    mapping(bytes32 => uint256) public outcome;

    // 条件ID => 抵押代币
    mapping(bytes32 => address) public collateralToken;

    // 条件ID => 结果数量
    mapping(bytes32 => uint256) public outcomeSlotCount;

    event ConditionPreparation(
        bytes32 indexed conditionId,
        address indexed oracle,
        bytes32 indexed questionId,
        uint256 outcomeSlotCount
    );

    event PositionSplit(
        address indexed stakeholder,
        IERC20 collateralToken,
        bytes32 indexed parentCollectionId,
        bytes32 indexed conditionId,
        uint256[] partition,
        uint256 amount
    );

    event PositionsMerge(
        address indexed stakeholder,
        IERC20 collateralToken,
        bytes32 indexed parentCollectionId,
        bytes32 indexed conditionId,
        uint256[] partition,
        uint256 amount
    );

    event ConditionResolution(
        bytes32 indexed conditionId,
        uint256 outcome
    );

    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @dev 准备条件（创建预测市场）
     * @param oracle 预言机地址（结算者）
     * @param questionId 问题ID
     * @param outcomeSlotCount 结果数量
     */
    function prepareCondition(
        address oracle,
        bytes32 questionId,
        uint256 outcomeSlotCount
    ) external returns (bytes32) {
        require(outcomeSlotCount > 1, unicode"至少需要2个结果");

        bytes32 conditionId = keccak256(
            abi.encodePacked(oracle, questionId, outcomeSlotCount)
        );

        require(collateralToken[conditionId] == address(0), unicode"条件已存在");

        collateralToken[conditionId] = address(0); // 稍后设置
        ConditionalTokens.outcomeSlotCount[conditionId] = outcomeSlotCount;

        emit ConditionPreparation(conditionId, oracle, questionId, outcomeSlotCount);

        return conditionId;
    }

    /**
     * @dev 拆分位置 - 用抵押品换取条件代币
     */
    function splitPosition(
        IERC20 _collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, unicode"金额必须大于0");
        require(partition.length == outcomeSlotCount[conditionId], unicode"分区数量不匹配");

        // 转移抵押品到合约
        require(
            _collateralToken.transferFrom(msg.sender, address(this), amount),
            unicode"抵押品转移失败"
        )
        ;

        // 铸造条件代币
        for (uint256 i = 0; i < partition.length; i++) {
            bytes32 positionId = getPositionId(_collateralToken,
                keccak256(abi.encodePacked(parentCollectionId, conditionId, partition[i]))
            );
            _mint(msg.sender, uint256(positionId), amount, "");
        }

        emit PositionSplit(
            msg.sender,
            _collateralToken,
            parentCollectionId,
            conditionId,
            partition,
            amount
        );
    }

    /**
     * @dev 合并位置 - 用条件代币换回抵押品
     */
    function mergePositions(
        IERC20 _collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, unicode"金额必须大于0");

        // 销毁条件代币
        for (uint256 i = 0; i < partition.length; i++) {
            bytes32 positionId = getPositionId(_collateralToken,
                keccak256(abi.encodePacked(parentCollectionId, conditionId, partition[i]))
            );
            _burn(msg.sender, uint256(positionId), amount);
        }

        // 返还抵押品
        require(
            _collateralToken.transfer(msg.sender, amount),
            unicode"抵押品返还失败"
        );

        emit PositionsMerge(
            msg.sender,
            _collateralToken,
            parentCollectionId,
            conditionId,
            partition,
            amount
        );
    }

    /**
     * @dev 结算条件
     */
    function reportPayouts(
        bytes32 conditionId,
        uint256 _outcome
    ) external onlyOwner {
        require(outcome[conditionId] == 0, unicode"条件已结算");
        require(_outcome > 0 && _outcome <= outcomeSlotCount[conditionId], unicode"无效结果");

        outcome[conditionId] = _outcome;

        emit ConditionResolution(conditionId, _outcome);
    }

    /**
     * @dev 赎回获胜代币
     */
    function redeemPositions(
        IERC20 _collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata indexSets
    ) external nonReentrant {
        require(outcome[conditionId] != 0, unicode"条件未结算");

        uint256 totalPayout = 0;
        uint256 winningOutcome = outcome[conditionId];

        for (uint256 i = 0; i < indexSets.length; i++) {
            if (indexSets[i] == winningOutcome) {
                bytes32 positionId = getPositionId(_collateralToken,
                    keccak256(abi.encodePacked(parentCollectionId, conditionId, indexSets[i]))
                );
                uint256 balance = balanceOf(msg.sender, uint256(positionId));
                if (balance > 0) {
                    totalPayout += balance;
                    _burn(msg.sender, uint256(positionId), balance);
                }
            }
        }

        require(totalPayout > 0, unicode"没有可赎回的代币");

        require(
            _collateralToken.transfer(msg.sender, totalPayout),
            unicode"赔付转移失败"
        );
    }

    /**
     * @dev 获取位置ID
     */
    function getPositionId(
        IERC20 _collateralToken,
        bytes32 collectionId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_collateralToken, collectionId));
    }

    /**
     * @dev 获取条件状态
     */
    function getConditionState(bytes32 conditionId) external view returns (
        uint256 _outcomeSlotCount,
        uint256 _outcome,
        bool _isResolved
    ) {
        return (
            outcomeSlotCount[conditionId],
            outcome[conditionId],
            outcome[conditionId] != 0
        );
    }
}
