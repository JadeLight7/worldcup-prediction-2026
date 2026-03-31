import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useContractRead } from 'wagmi'
import { Clock, Users, ArrowUpRight, Zap, Activity, Trophy, Flame, AlertCircle } from 'lucide-react'
import { marketsData, categories, formatNumber, getFeaturedMarkets, getMarketsByCategory, Market } from '../data/markets'
import { ORACLE_ADDRESS, ORACLE_ABI, DATA_UPDATED_AT, PLAYOFF_END_TIME } from '../config/oracle'

// 2026世界杯开幕日期
const WORLD_CUP_START = new Date('2026-06-11T00:00:00')

// 计算倒计时
function getCountdown(): { days: number; hours: number; minutes: number } {
  const now = new Date()
  const diff = WORLD_CUP_START.getTime() - now.getTime()

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes }
}

function Home() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [countdown, setCountdown] = useState(getCountdown())

  // 实时更新倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // 读取预言机数据 - 晋级球队数量
  const { data: qualifiedCount, isError } = useContractRead({
    address: ORACLE_ADDRESS,
    abi: ORACLE_ABI,
    functionName: 'getQualifiedCount',
    watch: true,
  })

  // 格式化晋级数量显示
  const qualifiedDisplay = useMemo(() => {
    if (qualifiedCount && Array.isArray(qualifiedCount)) {
      return `${qualifiedCount[0]}/${qualifiedCount[1]}`
    }
    return '42/48' // 默认值
  }, [qualifiedCount])

  // 检查是否需要提示更新
  const needsUpdate = Date.now() > PLAYOFF_END_TIME

  // 格式化数据更新时间
  const dataUpdateTime = useMemo(() => {
    return new Date(DATA_UPDATED_AT).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }, [])

  // 计算统计数据
  const stats = useMemo(() => {
    const totalVolume = marketsData.reduce((sum, m) => sum + m.volume, 0)
    const totalLiquidity = marketsData.reduce((sum, m) => sum + m.liquidity, 0)
    return {
      totalVolume,
      totalLiquidity,
      marketCount: marketsData.length,
      traderCount: 2847
    }
  }, [])

  const filteredMarkets = useMemo(() =>
    getMarketsByCategory(activeCategory),
    [activeCategory]
  )

  const featuredMarkets = useMemo(() => getFeaturedMarkets(), [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#30363d]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3fb950]/5 via-transparent to-[#58a6ff]/5" />

        <div className="pm-container relative py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3fb950] to-[#2ea043] flex items-center justify-center">
                  <Trophy className="text-white" size={20} />
                </div>
                <span className="text-[#3fb950] font-semibold">2026 FIFA World Cup</span>
                <span className="px-2 py-0.5 bg-[#21262d] text-[#8b949e] text-xs rounded-full">
                  48队扩军
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                预测<span className="text-[#3fb950]">2026</span>美加墨世界杯
              </h1>

              <p className="text-lg text-[#8b949e] mb-6 max-w-xl">
                参与去中心化预测市场，预测冠军归属、金靴得主、小组出线等。透明、安全、实时结算。
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#3fb950]" />
                  <span className="text-[#8b949e]">总交易量</span>
                  <span className="font-bold">{formatNumber(stats.totalVolume)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#58a6ff]" />
                  <span className="text-[#8b949e]">活跃市场</span>
                  <span className="font-bold">{stats.marketCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[#a371f7]" />
                  <span className="text-[#8b949e]">总流动性</span>
                  <span className="font-bold">{formatNumber(stats.totalLiquidity)}</span>
                </div>
              </div>
            </div>

            {/* Right Countdown Card */}
            <div className="pm-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={18} className="text-[#3fb950]" />
                <span className="font-semibold">世界杯开幕倒计时</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <div className="text-3xl font-black text-[#3fb950]">{countdown.days}</div>
                  <div className="text-xs text-[#8b949e] mt-1">天</div>
                </div>
                <div className="text-center p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <div className="text-3xl font-black">{countdown.hours}</div>
                  <div className="text-xs text-[#8b949e] mt-1">时</div>
                </div>
                <div className="text-center p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <div className="text-3xl font-black">{countdown.minutes}</div>
                  <div className="text-xs text-[#8b949e] mt-1">分</div>
                </div>
              </div>

              <div className="text-center text-sm text-[#8b949e]">
                2026年6月11日 • 美国 · 加拿大 · 墨西哥
              </div>

              <div className="mt-4 pt-4 border-t border-[#30363d]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#8b949e]">已确定参赛</span>
                  <span className="text-[#3fb950] font-medium">{qualifiedDisplay} 支球队</span>
                </div>
                {needsUpdate && (
                  <div className="flex items-center gap-1.5 text-xs text-[#f0883e]">
                    <AlertCircle size={12} />
                    <span>附加赛已结束，数据待更新</span>
                  </div>
                )}
                {isError && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
                    <span>数据更新于 {dataUpdateTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-10 border-b border-[#30363d]">
        <div className="pm-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Flame size={20} className="text-[#f0883e]" />
              热门市场
            </h2>
            <button
              onClick={() => setActiveCategory('热门')}
              className="text-sm text-[#3fb950] hover:underline"
            >
              查看全部
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredMarkets.map((market) => (
              <FeaturedMarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      </section>

      {/* All Markets */}
      <section className="py-10">
        <div className="pm-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold">全部市场</h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-[#3fb950] text-black'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Markets Table */}
          <div className="space-y-3">
            {filteredMarkets.map((market) => (
              <MarketRow key={market.id} market={market} />
            ))}
          </div>

          {filteredMarkets.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#8b949e]">暂无该分类的市场</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// 热门市场卡片
function FeaturedMarketCard({ market }: { market: Market }) {
  const yesOutcome = market.outcomes.find(o => o.name === '是') || market.outcomes[0]
  const noOutcome = market.outcomes.find(o => o.name === '否') || market.outcomes[1]
  const yesPercent = yesOutcome ? Math.round(yesOutcome.price * 100) : 50

  return (
    <Link
      to={`/market/${market.id}`}
      className="pm-card p-5 hover:border-[#3fb950]/50 transition-all group block"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#3fb950] bg-[#3fb950]/10 px-2 py-1 rounded">
          {market.category}
        </span>
        <ArrowUpRight size={16} className="text-[#8b949e] group-hover:text-[#3fb950] transition-colors" />
      </div>

      <h3 className="font-bold mb-4 line-clamp-2 min-h-[3rem]">{market.question}</h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#3fb950] font-bold">{yesOutcome.name}</span>
          <span className="text-[#f85149] font-bold">{noOutcome?.name || '否'}</span>
        </div>
        <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#3fb950] to-[#2ea043] rounded-full transition-all"
            style={{ width: `${yesPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-[#3fb950]">{yesPercent}¢</span>
          <span className="text-[#f85149]">{100 - yesPercent}¢</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#8b949e] pt-3 border-t border-[#30363d]">
        <span>Vol {formatNumber(market.volume)}</span>
        {market.change24h !== undefined && (
          <span className={market.change24h >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}>
            {market.change24h >= 0 ? '+' : ''}{market.change24h}%
          </span>
        )}
      </div>
    </Link>
  )
}

// 市场列表行
function MarketRow({ market }: { market: Market }) {
  const mainOutcome = market.outcomes[0]
  const secondaryOutcome = market.outcomes[1]
  const price = mainOutcome.price

  return (
    <Link
      to={`/market/${market.id}`}
      className="pm-card p-4 hover:border-[#484f58] transition-all block"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#3fb950] bg-[#3fb950]/10 px-2 py-0.5 rounded">
              {market.category}
            </span>
            {market.group && (
              <span className="text-xs text-[#58a6ff] bg-[#58a6ff]/10 px-2 py-0.5 rounded">
                {market.group}
              </span>
            )}
            <span className="text-xs text-[#8b949e]">截止 {market.endDate}</span>
          </div>
          <h3 className="font-medium text-sm truncate">{market.question}</h3>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#8b949e]">交易量</p>
            <p className="font-medium text-sm">{formatNumber(market.volume)}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-[#3fb950]">
                {(price * 100).toFixed(0)}¢
              </p>
              <p className="text-xs text-[#8b949e]">{mainOutcome.name}</p>
            </div>

            {secondaryOutcome && (
              <div className="text-right">
                <p className="text-lg font-bold text-[#f85149]">
                  {(secondaryOutcome.price * 100).toFixed(0)}¢
                </p>
                <p className="text-xs text-[#8b949e]">{secondaryOutcome.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Home
