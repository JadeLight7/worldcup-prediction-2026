import { useState } from 'react'
import { useAccount } from 'wagmi'
import {
  Wallet,
  History,
  Package,
  ArrowUpRight,
  DollarSign,
  Clock
} from 'lucide-react'
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface Position {
  id: string
  market: string
  outcome: string
  shares: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  type: 'yes' | 'no'
}

const positions: Position[] = [
  {
    id: '1',
    market: '阿根廷会赢得2026世界杯冠军吗？',
    outcome: '是',
    shares: 100,
    avgPrice: 0.25,
    currentPrice: 0.28,
    pnl: 3.00,
    pnlPercent: 12.0,
    type: 'yes'
  },
  {
    id: '2',
    market: '梅西会在2026世界杯获得金靴奖吗？',
    outcome: '是',
    shares: 500,
    avgPrice: 0.20,
    currentPrice: 0.25,
    pnl: 25.00,
    pnlPercent: 25.0,
    type: 'yes'
  },
  {
    id: '3',
    market: '巴西能从小组赛出线吗？',
    outcome: '否',
    shares: 50,
    avgPrice: 0.15,
    currentPrice: 0.12,
    pnl: -1.50,
    pnlPercent: -10.0,
    type: 'no'
  }
]

const portfolioData = [
  { name: '冠军预测', value: 45, color: '#3fb950' },
  { name: '金靴奖', value: 30, color: '#58a6ff' },
  { name: '晋级预测', value: 15, color: '#a371f7' },
  { name: '单场赛事', value: 10, color: '#f0883e' }
]

function Portfolio() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions')

  const totalValue = positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)
  const totalCost = positions.reduce((sum, p) => sum + p.shares * p.avgPrice, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPercent = totalCost > 0 ? ((totalPnl / totalCost) * 100).toFixed(1) : '0'

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#21262d] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet size={32} className="text-[#6e7681]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">连接钱包</h2>
          <p className="text-[#8b949e]">连接钱包查看你的投资组合</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="pm-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">投资组合</h1>
          <p className="text-[#8b949e]">查看和管理你的持仓</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="pm-stat md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#3fb950]/10 rounded-lg">
                <DollarSign size={20} className="text-[#3fb950]" />
              </div>
              <span className="text-[#8b949e] font-medium">总资产价值</span>
            </div>
            <div className="text-3xl font-bold">{totalValue.toFixed(2)} USDC</div>
            <div className={`mt-2 font-medium ${totalPnl >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} ({totalPnlPercent}%)
            </div>
          </div>

          <div className="pm-stat">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#58a6ff]/10 rounded-lg">
                <Package size={20} className="text-[#58a6ff]" />
              </div>
              <span className="text-[#8b949e] font-medium">持仓数量</span>
            </div>
            <div className="text-3xl font-bold">{positions.length}</div>
          </div>

          <div className="pm-stat">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#a371f7]/10 rounded-lg">
                <Clock size={20} className="text-[#a371f7]" />
              </div>
              <span className="text-[#8b949e] font-medium">活跃市场</span>
            </div>
            <div className="text-3xl font-bold">3</div>
          </div>
        </div>

        {/* Chart & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 pm-card p-6">
            <h3 className="font-bold mb-4">盈亏走势</h3>
            <div className="h-64 flex items-center justify-center text-[#8b949e]">
              <p>图表功能开发中...</p>
            </div>
          </div>

          <div className="pm-card p-6">
            <h3 className="font-bold mb-4">投资组合分布</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: '8px'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {portfolioData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#8b949e]">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('positions')}
            className={`pm-btn flex items-center gap-2 ${
              activeTab === 'positions' ? 'pm-btn-primary' : 'pm-btn-secondary'
            }`}
          >
            <Package size={16} />
            持仓 ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pm-btn flex items-center gap-2 ${
              activeTab === 'history' ? 'pm-btn-primary' : 'pm-btn-secondary'
            }`}
          >
            <History size={16} />
            历史记录
          </button>
        </div>

        {/* Positions List */}
        {activeTab === 'positions' && (
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="pm-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        position.type === 'yes'
                          ? 'bg-[#3fb950]/10 text-[#3fb950]'
                          : 'bg-[#f85149]/10 text-[#f85149]'
                      }`}>
                        {position.outcome}
                      </span>
                      <span className="text-[#8b949e] text-sm">{position.shares} 份额</span>
                    </div>
                    <h3 className="font-bold">{position.market}</h3>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[#8b949e] text-sm">买入价格</p>
                      <p className="font-medium">{(position.avgPrice * 100).toFixed(0)}¢</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8b949e] text-sm">当前价格</p>
                      <p className="font-medium">{(position.currentPrice * 100).toFixed(0)}¢</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8b949e] text-sm">盈亏</p>
                      <p className={`font-bold ${position.pnl >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                        {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)} USDC
                      </p>
                      <p className={`text-xs ${position.pnl >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                        {position.pnlPercent > 0 ? '+' : ''}{position.pnlPercent}%
                      </p>
                    </div>
                    <button className="pm-btn pm-btn-primary">
                      卖出
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="pm-card p-16 text-center">
            <History size={48} className="text-[#21262d] mx-auto mb-4" />
            <p className="text-[#8b949e]">暂无历史记录</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio
