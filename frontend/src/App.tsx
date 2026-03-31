import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Home from './pages/Home'
import MarketDetail from './pages/MarketDetail'
import Portfolio from './pages/Portfolio'
import CreateMarket from './pages/CreateMarket'
import { TrendingUp, PieChart, PlusCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'

function App() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: '市场', icon: TrendingUp },
    { path: '/portfolio', label: '投资组合', icon: PieChart },
    { path: '/create', label: '创建市场', icon: PlusCircle },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Navigation */}
      <nav className="pm-nav sticky top-0 z-50">
        <div className="pm-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3fb950] to-[#2ea043] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WC</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg tracking-tight">WorldCup</span>
                <span className="text-[#3fb950] font-bold text-lg">Predict</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`pm-nav-link flex items-center gap-2 ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus="address"
              />

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-[#8b949e] hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#30363d] bg-[#161b22]">
            <div className="px-4 py-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-[#21262d] text-white'
                      : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px-200px)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market/:address" element={<MarketDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/create" element={<CreateMarket />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] mt-20">
        <div className="pm-container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3fb950] to-[#2ea043] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WC</span>
              </div>
              <span className="font-semibold">WorldCupPredict</span>
            </div>

            <p className="text-[#8b949e] text-sm">
              2026 FIFA World Cup Prediction Market • 仅供学习娱乐使用
            </p>

            <div className="flex items-center gap-6 text-sm text-[#8b949e]">
              <a href="#" className="hover:text-white transition-colors">文档</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
