import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import {
  ArrowLeft,
  DollarSign,
  Users,
  Share2,
  Bookmark,
  Info,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { getMarketById, formatNumber } from '../data/markets'

// 生成模拟价格历史数据
function generatePriceHistory(currentPrice: number) {
  const data = []
  const now = new Date()
  let price = currentPrice

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    // 随机波动
    price = price * (1 + (Math.random() - 0.5) * 0.1)
    price = Math.max(0.05, Math.min(0.95, price))
    data.push({
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      price: Math.round(price * 100)
    })
  }
  return data
}

function MarketDetail() {
  const { address } = useParams<{ address: string }>()
  const { isConnected } = useAccount()
  const [tradeType, setTradeType] = useState<'yes' | 'no'>('yes')
  const [amount, setAmount] = useState('')

  // 获取市场数据
  const market = useMemo(() => {
    return getMarketById(address || '1')
  }, [address])

  // 如果市场不存在
  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">市场不存在</h1>
          <Link to="/" className="text-[#3fb950] hover:underline">
            返回市场列表
          </Link>
        </div>
      </div>
    )
  }

  // 生成价格历史
  const priceHistory = useMemo(() => {
    const mainOutcome = market.outcomes[0]
    return generatePriceHistory(mainOutcome.price)
  }, [market])

  // 计算剩余天数
  const daysLeft = useMemo(() => {
    const end = new Date(market.endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [market.endDate])

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) return
    alert(`买入 ${amount} USDC 的 ${tradeType.toUpperCase()}`)
  }

  const selectedOutcome = market.outcomes.find(o =>
    tradeType === 'yes' ? o.name === '是' : o.name === '否'
  ) || market.outcomes[0]

  const selectedPrice = selectedOutcome.price
  const potentialReturn = amount ? (parseFloat(amount) / selectedPrice).toFixed(2) : '0'
  const profit = amount ? (parseFloat(potentialReturn) - parseFloat(amount)).toFixed(2) : '0'

  // 计算涨跌幅颜色
  const changeColor = market.change24h && market.change24h >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'
  const ChangeIcon = market.change24h && market.change24h >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-[#30363d]">
        <div className="pm-container py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span>返回市场</span>
          </Link>
        </div>
      </div>

      <div className="pm-container py-8">
        {/* Market Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-medium text-[#3fb950] bg-[#3fb950]/10 px-2 py-1 rounded">
              {market.category}
            </span>
            {market.group && (
              <span className="text-xs font-medium text-[#58a6ff] bg-[#58a6ff]/10 px-2 py-1 rounded">
                {market.group}
              </span>
            )}
            <span className="text-xs text-[#8b949e]">
              {daysLeft > 0 ? `${daysLeft} 天后结算` : '即将结算'}
            </span>
            {market.change24h !== undefined && (
              <span className={`text-xs font-medium flex items-center gap-1 ${changeColor}`}>
                <ChangeIcon size={12} />
                {market.change24h >= 0 ? '+' : ''}{market.change24h}% (24h)
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3">{market.question}</h1>
          <p className="text-[#8b949e] max-w-3xl">{market.description}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2 text-[#8b949e]">
              <DollarSign size={16} />
              <span>交易量 <span className="text-white font-medium">{formatNumber(market.volume)}</span></span>
            </div>
            <div className="flex items-center gap-2 text-[#8b949e]">
              <Users size={16} />
              <span>流动性 <span className="text-white font-medium">{formatNumber(market.liquidity)}</span></span>
            </div>
            <div className="flex items-center gap-2 text-[#8b949e]">
              <Clock size={16} />
              <span>结算日期 <span className="text-white font-medium">{market.endDate}</span></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Display */}
            <div className="pm-card p-6">
              <div className={`grid gap-4 ${market.outcomes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {market.outcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className={`text-center p-6 rounded-xl border ${
                      outcome.name === '是' || idx === 0
                        ? 'bg-[#3fb950]/10 border-[#3fb950]/30'
                        : outcome.name === '否' || idx === 1
                          ? 'bg-[#f85149]/10 border-[#f85149]/30'
                          : 'bg-[#58a6ff]/10 border-[#58a6ff]/30'
                    }`}
                  >
                    <p className="text-[#8b949e] text-sm mb-1">{outcome.name}</p>
                    <p className={`text-4xl font-black ${
                      outcome.name === '是' || idx === 0 ? 'text-[#3fb950]' :
                        outcome.name === '否' || idx === 1 ? 'text-[#f85149]' : 'text-[#58a6ff]'
                    }`}>
                      {(outcome.price * 100).toFixed(0)}¢
                    </p>
                    <p className={`text-sm mt-1 ${
                      outcome.name === '是' || idx === 0 ? 'text-[#3fb950]' :
                        outcome.name === '否' || idx === 1 ? 'text-[#f85149]' : 'text-[#58a6ff]'
                    }`}>
                      赔率 {(1 / outcome.price).toFixed(2)}x
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Chart */}
            <div className="pm-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Activity size={18} />
                价格走势 (30天)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3fb950" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="date" stroke="#6e7681" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6e7681" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}¢`, '价格']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#3fb950"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* About */}
            <div className="pm-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Info size={18} />
                关于此市场
              </h3>
              <div className="space-y-2 text-[#8b949e] text-sm">
                <p>• {market.description}</p>
                <p>• 市场将在 {market.endDate} 结算</p>
                <p>• 如果你的预测正确，每份份额将获得 1 USDC</p>
                <p>• 交易手续费为 2%</p>
                {market.group && <p>• 所属小组: {market.group}</p>}
              </div>
            </div>
          </div>

          {/* Right Column - Trade Panel */}
          <div>
            <div className="sticky top-24 space-y-4">
              {/* Trade Card */}
              <div className="pm-card p-6">
                <h3 className="font-bold text-lg mb-4">交易</h3>

                {/* Trade Type Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setTradeType('yes')}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                      tradeType === 'yes'
                        ? 'bg-[#3fb950] text-black'
                        : 'bg-[#3fb950]/10 text-[#3fb950] hover:bg-[#3fb950]/20'
                    }`}
                  >
                    买入 Yes
                  </button>
                  <button
                    onClick={() => setTradeType('no')}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                      tradeType === 'no'
                        ? 'bg-[#f85149] text-white'
                        : 'bg-[#f85149]/10 text-[#f85149] hover:bg-[#f85149]/20'
                    }`}
                  >
                    买入 No
                  </button>
                </div>

                {!isConnected ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#21262d] rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="text-[#6e7681]" size={24} />
                    </div>
                    <p className="text-[#8b949e]">连接钱包开始交易</p>
                  </div>
                ) : (
                  <>
                    {/* Price Info */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-[#0d1117] rounded-lg">
                      <span className="text-[#8b949e] text-sm">当前价格</span>
                      <span className={`font-bold ${
                        tradeType === 'yes' ? 'text-[#3fb950]' : 'text-[#f85149]'
                      }`}>
                        {(selectedPrice * 100).toFixed(0)}¢
                      </span>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-4">
                      <label className="block text-sm text-[#8b949e] mb-2">金额 (USDC)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="pm-input pr-16 text-lg font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e7681] font-medium">
                          USDC
                        </span>
                      </div>
                    </div>

                    {/* Quick Amounts */}
                    <div className="flex gap-2 mb-4">
                      {['10', '50', '100', '500'].map((value) => (
                        <button
                          key={value}
                          onClick={() => setAmount(value)}
                          className="flex-1 py-2 text-sm font-medium bg-[#21262d] hover:bg-[#30363d] rounded-lg transition-colors"
                        >
                          {value}
                        </button>
                      ))}
                    </div>

                    {/* Estimates */}
                    {amount && (
                      <div className="space-y-2 mb-4 p-4 bg-[#0d1117] rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#8b949e]">获得份额</span>
                          <span className="font-medium">{potentialReturn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8b949e]">潜在收益</span>
                          <span className={`font-bold ${
                            tradeType === 'yes' ? 'text-[#3fb950]' : 'text-[#f85149]'
                          }`}>
                            +{profit} USDC
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8b949e]">手续费 (2%)</span>
                          <span>{(parseFloat(amount) * 0.02).toFixed(2)} USDC</span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleTrade}
                      disabled={!amount || parseFloat(amount) <= 0}
                      className={`w-full pm-btn disabled:opacity-50 disabled:cursor-not-allowed ${
                        tradeType === 'yes' ? 'pm-btn-primary' : 'bg-[#f85149] text-white'
                      }`}
                    >
                      确认买入 {tradeType.toUpperCase()}
                    </button>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 pm-btn pm-btn-secondary">
                  <Share2 size={16} />
                  分享
                </button>
                <button className="flex-1 pm-btn pm-btn-secondary">
                  <Bookmark size={16} />
                  收藏
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketDetail
