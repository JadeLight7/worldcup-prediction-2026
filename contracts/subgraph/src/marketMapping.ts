import {
  OrderPlaced,
  OrderFilled,
  OrderCancelled,
  OrderExpired,
  Trade,
  MarketResolved,
  PartialResolution,
  LiquidityAdded,
  LiquidityRemoved,
  RewardsClaimed,
  PriceUpdated,
  FeeDistributed,
} from '../generated/templates/EnhancedPredictionMarket/EnhancedPredictionMarket'
import {
  Market,
  User,
  Order,
  Trade as TradeEntity,
  PricePoint,
  LiquidityPosition,
  UserPosition,
  Outcome,
  FeeDistribution,
  FactoryStats,
} from '../generated/schema'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

// Helper functions
function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHex())
  if (user == null) {
    user = new User(address.toHex())
    user.address = address
    user.totalOrdersCreated = 0
    user.totalOrdersFilled = 0
    user.totalTrades = 0
    user.totalVolume = BigInt.fromI32(0).toBigDecimal()
    user.totalFeesPaid = BigInt.fromI32(0).toBigDecimal()
    user.totalWinningsClaimed = BigInt.fromI32(0).toBigDecimal()
    user.createdAt = BigInt.fromI32(0)
    user.updatedAt = BigInt.fromI32(0)
    user.save()
  }
  return user
}

function getOrCreateOutcome(
  marketId: string,
  index: i32,
  name: string
): Outcome {
  let id = marketId + '-' + index.toString()
  let outcome = Outcome.load(id)
  if (outcome == null) {
    outcome = new Outcome(id)
    outcome.market = marketId
    outcome.index = index
    outcome.name = name
    outcome.currentPrice = BigInt.fromI32(5000).toBigDecimal()
    outcome.totalVolume = BigInt.fromI32(0).toBigDecimal()
    outcome.totalShares = BigInt.fromI32(0).toBigDecimal()
    outcome.save()
  }
  return outcome
}

function getOrderType(type: i32): string {
  if (type == 0) return 'LimitBuy'
  if (type == 1) return 'LimitSell'
  if (type == 2) return 'StopLoss'
  if (type == 3) return 'TakeProfit'
  return 'Unknown'
}

// Event handlers
export function handleOrderPlaced(event: OrderPlaced): void {
  let marketId = event.address.toHex()
  let market = Market.load(marketId)
  if (market == null) return

  let trader = getOrCreateUser(event.params.trader)
  let orderId = marketId + '-' + event.params.orderId.toString()

  let order = new Order(orderId)
  order.orderId = event.params.orderId
  order.market = marketId
  order.trader = trader.id
  order.orderType = getOrderType(event.params.orderType)
  order.outcomeIndex = event.params.outcomeIndex.toI32()
  order.outcome = marketId + '-' + event.params.outcomeIndex.toString()
  order.amount = event.params.amount.toBigDecimal()
  order.filledAmount = BigInt.fromI32(0).toBigDecimal()
  order.price = event.params.price.toBigDecimal()
  order.stopPrice = BigInt.fromI32(0).toBigDecimal()
  order.deadline = event.params.deadline
  order.isActive = true
  order.status = 'Active'
  order.timestamp = event.block.timestamp
  order.updatedAt = event.block.timestamp

  order.save()

  trader.totalOrdersCreated += 1
  trader.updatedAt = event.block.timestamp
  trader.save()
}

export function handleOrderFilled(event: OrderFilled): void {
  let marketId = event.address.toHex()
  let orderId = marketId + '-' + event.params.orderId.toString()
  let order = Order.load(orderId)

  if (order != null) {
    order.filledAmount = order.filledAmount.plus(event.params.amount.toBigDecimal())

    if (order.filledAmount.ge(order.amount)) {
      order.isActive = false
      order.status = 'Filled'
    }

    order.updatedAt = event.block.timestamp
    order.save()

    let maker = getOrCreateUser(event.params.maker)
    maker.totalOrdersFilled += 1
    maker.updatedAt = event.block.timestamp
    maker.save()
  }
}

export function handleOrderCancelled(event: OrderCancelled): void {
  let marketId = event.address.toHex()
  let orderId = marketId + '-' + event.params.orderId.toString()
  let order = Order.load(orderId)

  if (order != null) {
    order.isActive = false
    order.status = 'Cancelled'
    order.updatedAt = event.block.timestamp
    order.save()
  }
}

export function handleOrderExpired(event: OrderExpired): void {
  let marketId = event.address.toHex()
  let orderId = marketId + '-' + event.params.orderId.toString()
  let order = Order.load(orderId)

  if (order != null) {
    order.isActive = false
    order.status = 'Expired'
    order.updatedAt = event.block.timestamp
    order.save()
  }
}

export function handleTrade(event: Trade): void {
  let marketId = event.address.toHex()
  let market = Market.load(marketId)
  if (market == null) return

  let buyer = getOrCreateUser(event.params.buyer)
  let seller = getOrCreateUser(event.params.seller)

  let tradeId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

  let trade = new TradeEntity(tradeId)
  trade.transactionHash = event.transaction.hash
  trade.logIndex = event.logIndex
  trade.market = marketId
  trade.buyer = buyer.id
  trade.seller = seller.id
  trade.outcomeIndex = event.params.outcomeIndex.toI32()
  trade.outcome = marketId + '-' + event.params.outcomeIndex.toString()
  trade.amount = event.params.amount.toBigDecimal()
  trade.price = event.params.price.toBigDecimal()
  trade.value = event.params.amount.toBigDecimal().times(event.params.price.toBigDecimal())
  trade.fee = event.params.fee.toBigDecimal()
  trade.timestamp = event.block.timestamp
  trade.blockNumber = event.block.number
  trade.save()

  // Update user stats
  buyer.totalTrades += 1
  buyer.totalVolume = buyer.totalVolume.plus(trade.value)
  buyer.totalFeesPaid = buyer.totalFeesPaid.plus(trade.fee)
  buyer.updatedAt = event.block.timestamp
  buyer.save()

  seller.totalTrades += 1
  seller.totalVolume = seller.totalVolume.plus(trade.value)
  seller.totalFeesPaid = seller.totalFeesPaid.plus(trade.fee)
  seller.updatedAt = event.block.timestamp
  seller.save()

  // Update market stats
  market.totalVolume = market.totalVolume.plus(trade.value)
  market.updatedAt = event.block.timestamp
  market.save()

  // Update factory stats
  let factoryStats = FactoryStats.load('1')
  if (factoryStats != null) {
    factoryStats.totalVolume = factoryStats.totalVolume.plus(trade.value)
    factoryStats.updatedAt = event.block.timestamp
    factoryStats.save()
  }

  // Update outcome
  let outcome = Outcome.load(marketId + '-' + event.params.outcomeIndex.toString())
  if (outcome != null) {
    outcome.currentPrice = event.params.price.toBigDecimal()
    outcome.totalVolume = outcome.totalVolume.plus(trade.value)
    outcome.totalShares = outcome.totalShares.plus(event.params.amount.toBigDecimal())
    outcome.save()
  }
}

export function handleMarketResolved(event: MarketResolved): void {
  let marketId = event.address.toHex()
  let market = Market.load(marketId)

  if (market != null) {
    market.isResolved = true
    market.winningOutcome = event.params.winningOutcome.toI32()
    market.status = 'Resolved'
    market.resolvedAt = event.block.timestamp
    market.updatedAt = event.block.timestamp
    market.save()
  }
}

export function handlePartialResolution(event: PartialResolution): void {
  // Track partial resolution events if needed
}

export function handleLiquidityAdded(event: LiquidityAdded): void {
  let marketId = event.address.toHex()
  let market = Market.load(marketId)
  if (market == null) return

  let provider = getOrCreateUser(event.params.provider)
  let positionId = marketId + '-' + event.params.provider.toHex()

  let position = LiquidityPosition.load(positionId)
  if (position == null) {
    position = new LiquidityPosition(positionId)
    position.provider = provider.id
    position.market = marketId
    position.amount = BigInt.fromI32(0).toBigDecimal()
    position.shares = BigInt.fromI32(0).toBigDecimal()
    position.rewardDebt = BigInt.fromI32(0).toBigDecimal()
    position.totalRewardsClaimed = BigInt.fromI32(0).toBigDecimal()
    position.lastUpdateTime = event.block.timestamp
    position.createdAt = event.block.timestamp
  }

  position.amount = position.amount.plus(event.params.amount.toBigDecimal())
  position.shares = position.shares.plus(event.params.shares.toBigDecimal())
  position.updatedAt = event.block.timestamp
  position.save()

  market.totalLiquidity = market.totalLiquidity.plus(event.params.amount.toBigDecimal())
  market.updatedAt = event.block.timestamp
  market.save()
}

export function handleLiquidityRemoved(event: LiquidityRemoved): void {
  let marketId = event.address.toHex()
  let market = Market.load(marketId)
  if (market == null) return

  let positionId = marketId + '-' + event.params.provider.toHex()
  let position = LiquidityPosition.load(positionId)

  if (position != null) {
    position.amount = position.amount.minus(event.params.amount.toBigDecimal())
    position.shares = position.shares.minus(event.params.shares.toBigDecimal())
    position.updatedAt = event.block.timestamp
    position.save()
  }

  market.totalLiquidity = market.totalLiquidity.minus(event.params.amount.toBigDecimal())
  market.updatedAt = event.block.timestamp
  market.save()
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  let marketId = event.address.toHex()
  let positionId = marketId + '-' + event.params.provider.toHex()
  let position = LiquidityPosition.load(positionId)

  if (position != null) {
    position.totalRewardsClaimed = position.totalRewardsClaimed.plus(event.params.amount.toBigDecimal())
    position.updatedAt = event.block.timestamp
    position.save()
  }

  let market = Market.load(marketId)
  if (market != null) {
    market.totalRewardsPaid = market.totalRewardsPaid.plus(event.params.amount.toBigDecimal())
    market.updatedAt = event.block.timestamp
    market.save()
  }
}

export function handlePriceUpdated(event: PriceUpdated): void {
  let marketId = event.address.toHex()

  let pricePointId = marketId + '-' + event.block.timestamp.toString() + '-' + event.params.outcomeIndex.toString()

  let pricePoint = new PricePoint(pricePointId)
  pricePoint.market = marketId
  pricePoint.outcomeIndex = event.params.outcomeIndex.toI32()
  pricePoint.outcome = marketId + '-' + event.params.outcomeIndex.toString()
  pricePoint.timestamp = event.block.timestamp
  pricePoint.price = event.params.newPrice.toBigDecimal()
  pricePoint.volume = event.params.volume.toBigDecimal()
  pricePoint.blockNumber = event.block.number
  pricePoint.save()
}

export function handleFeeDistributed(event: FeeDistributed): void {
  let marketId = event.address.toHex()

  let distributionId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

  let distribution = new FeeDistribution(distributionId)
  distribution.market = marketId
  distribution.transactionHash = event.transaction.hash
  distribution.lpFee = event.params.lpFee.toBigDecimal()
  distribution.protocolFee = event.params.protocolFee.toBigDecimal()
  distribution.oracleFee = event.params.oracleFee.toBigDecimal()
  distribution.timestamp = event.block.timestamp
  distribution.save()
}
