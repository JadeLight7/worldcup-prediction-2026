import {
  MarketCreated,
  FeeConfigUpdated,
} from '../generated/EnhancedPredictionMarketFactory/EnhancedPredictionMarketFactory'
import { Market, User, FactoryStats } from '../generated/schema'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  EnhancedPredictionMarket,
} from '../generated/templates'

// Helper to get or create user
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

// Helper to get or create factory stats
function getOrCreateFactoryStats(): FactoryStats {
  let stats = FactoryStats.load('1')
  if (stats == null) {
    stats = new FactoryStats('1')
    stats.totalMarkets = 0
    stats.totalVolume = BigInt.fromI32(0).toBigDecimal()
    stats.totalFeesCollected = BigInt.fromI32(0).toBigDecimal()
    stats.totalLiquidity = BigInt.fromI32(0).toBigDecimal()
    stats.totalRewardsPaid = BigInt.fromI32(0).toBigDecimal()
    stats.updatedAt = BigInt.fromI32(0)
    stats.save()
  }
  return stats
}

export function handleMarketCreated(event: MarketCreated): void {
  let market = new Market(event.params.marketAddress.toHex())
  let creator = getOrCreateUser(event.params.creator)

  market.address = event.params.marketAddress
  market.creator = creator.id
  market.question = event.params.question
  market.description = ''
  market.outcomes = []
  market.outcomeCount = event.params.outcomeCount.toI32()
  market.resolutionTime = event.params.resolutionTime
  market.fee = BigInt.fromI32(0)
  market.creationFee = BigInt.fromI32(0)
  market.oracle = Address.fromString('0x0000000000000000000000000000000000000000')
  market.isResolved = false
  market.status = 'Active'
  market.conditionId = event.params.conditionId

  market.totalVolume = BigInt.fromI32(0).toBigDecimal()
  market.totalLiquidity = BigInt.fromI32(0).toBigDecimal()
  market.totalFeesCollected = BigInt.fromI32(0).toBigDecimal()
  market.totalRewardsPaid = BigInt.fromI32(0).toBigDecimal()

  market.createdAt = event.block.timestamp
  market.updatedAt = event.block.timestamp

  market.save()

  // Update factory stats
  let stats = getOrCreateFactoryStats()
  stats.totalMarkets += 1
  stats.updatedAt = event.block.timestamp
  stats.save()

  // Start indexing the market
  EnhancedPredictionMarket.create(event.params.marketAddress)
}

export function handleFeeConfigUpdated(event: FeeConfigUpdated): void {
  // Could track fee changes over time if needed
}
