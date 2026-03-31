import { useState } from 'react'
import { Trophy, Plus, Trash2, AlertCircle, ChevronRight, Check } from 'lucide-react'

const templates = [
  {
    name: '冠军预测',
    icon: '🏆',
    question: '2026世界杯冠军是哪个国家？',
    outcomes: ['阿根廷', '法国', '巴西', '德国', '其他'],
    description: '预测最终的冠军队伍'
  },
  {
    name: '晋级预测',
    icon: '✅',
    question: '某球队能从小组赛晋级吗？',
    outcomes: ['否', '是'],
    description: '预测球队能否从小组出线'
  },
  {
    name: '金靴预测',
    icon: '⚽',
    question: '谁会获得金靴奖？',
    outcomes: ['梅西', '姆巴佩', '哈兰德', '其他'],
    description: '预测最佳射手'
  }
]

const popularTeams = [
  '阿根廷', '法国', '巴西', '英格兰', '西班牙', '德国',
  '葡萄牙', '荷兰', '比利时', '意大利', '乌拉圭', '克罗地亚'
]

function CreateMarket() {
  const [step, setStep] = useState(1)
  const [question, setQuestion] = useState('')
  const [outcomes, setOutcomes] = useState(['', ''])
  const [resolutionDate, setResolutionDate] = useState('')
  const [marketType, setMarketType] = useState<'binary' | 'custom'>('binary')

  const addOutcome = () => setOutcomes([...outcomes, ''])

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index))
    }
  }

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes]
    newOutcomes[index] = value
    setOutcomes(newOutcomes)
  }

  const applyTemplate = (template: typeof templates[0]) => {
    setQuestion(template.question)
    setOutcomes([...template.outcomes])
    setMarketType(template.outcomes.length === 2 ? 'binary' : 'custom')
    setStep(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('市场创建功能需要部署合约后才能使用')
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="pm-container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] text-sm font-medium mb-4">
            <Trophy size={14} />
            <span>创建预测市场</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">创建你的市场</h1>
          <p className="text-[#8b949e]">设计独特的预测问题，让其他人参与交易</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              step >= 1 ? 'bg-[#3fb950] text-black' : 'bg-[#21262d] text-[#8b949e]'
            }`}>
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold">
                {step > 1 ? <Check size={12} /> : '1'}
              </span>
              <span className="hidden sm:inline">选择模板</span>
            </div>
            <ChevronRight className="text-[#30363d]" size={20} />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              step >= 2 ? 'bg-[#3fb950] text-black' : 'bg-[#21262d] text-[#8b949e]'
            }`}>
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold">
                {step > 2 ? <Check size={12} /> : '2'}
              </span>
              <span className="hidden sm:inline">设置详情</span>
            </div>
            <ChevronRight className="text-[#30363d]" size={20} />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              step >= 3 ? 'bg-[#3fb950] text-black' : 'bg-[#21262d] text-[#8b949e]'
            }`}>
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold">3</span>
              <span className="hidden sm:inline">确认创建</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6">选择市场模板</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(template)}
                  className="pm-card p-6 text-left hover:border-[#3fb950] transition-colors"
                >
                  <div className="text-3xl mb-4">{template.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                  <p className="text-[#8b949e] text-sm mb-3">{template.description}</p>
                  <p className="text-[#6e7681] text-xs truncate">{template.question}</p>
                </button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-[#8b949e] mb-4">或者</p>
              <button
                onClick={() => setStep(2)}
                className="pm-card p-8 w-full max-w-md hover:border-[#3fb950] transition-colors"
              >
                <Plus className="mx-auto mb-4 text-[#3fb950]" size={32} />
                <h3 className="font-bold text-lg">自定义市场</h3>
                <p className="text-[#8b949e] text-sm mt-2">从头开始设计你的预测问题</p>
              </button>
            </div>
          </div>
        )}

        {step >= 2 && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="pm-card p-8">
              {/* Market Type */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#8b949e] mb-3">市场类型</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMarketType('binary')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      marketType === 'binary'
                        ? 'border-[#3fb950] bg-[#3fb950]/10'
                        : 'border-[#30363d] hover:border-[#484f58]'
                    }`}
                  >
                    <div className="font-bold mb-1">二元市场</div>
                    <div className="text-xs text-[#8b949e]">是 / 否</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarketType('custom')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      marketType === 'custom'
                        ? 'border-[#3fb950] bg-[#3fb950]/10'
                        : 'border-[#30363d] hover:border-[#484f58]'
                    }`}
                  >
                    <div className="font-bold mb-1">自定义市场</div>
                    <div className="text-xs text-[#8b949e]">多个选项</div>
                  </button>
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#8b949e] mb-3">
                  预测问题 <span className="text-[#f85149]">*</span>
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例如：阿根廷会赢得2026世界杯冠军吗？"
                  className="pm-input"
                  required
                />
              </div>

              {/* Outcomes */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#8b949e] mb-3">
                  预测选项 <span className="text-[#f85149]">*</span>
                </label>
                <div className="space-y-3">
                  {outcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => updateOutcome(index, e.target.value)}
                        placeholder={`选项 ${index + 1}`}
                        list="teams"
                        className="pm-input"
                        required
                      />
                      {marketType === 'custom' && outcomes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOutcome(index)}
                          className="px-4 py-3 bg-[#f85149]/10 hover:bg-[#f85149]/20 text-[#f85149] rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <datalist id="teams">
                  {popularTeams.map(team => <option key={team} value={team} />)}
                </datalist>
                {marketType === 'custom' && (
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="mt-3 flex items-center gap-2 text-[#3fb950] hover:text-[#4bc95a] font-medium"
                  >
                    <Plus size={18} />
                    添加选项
                  </button>
                )}
              </div>

              {/* Resolution Date */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#8b949e] mb-3">
                  结算时间 <span className="text-[#f85149]">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={resolutionDate}
                  onChange={(e) => setResolutionDate(e.target.value)}
                  className="pm-input"
                  required
                />
                <p className="text-xs text-[#6e7681] mt-2">
                  市场将在指定时间后结算，请确保时间在实际比赛结束后
                </p>
              </div>

              {/* Info */}
              <div className="bg-[#21262d] rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-[#58a6ff] mt-0.5" size={18} />
                  <div className="text-sm text-[#8b949e]">
                    <p className="font-medium text-[#58a6ff] mb-1">创建市场须知</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>创建市场需要支付少量的 gas 费用</li>
                      <li>市场创建后无法修改问题或选项</li>
                      <li>市场将在结算时间后由预言机结算</li>
                      <li>当前版本为测试网，使用模拟代币</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="pm-btn pm-btn-secondary"
                >
                  返回
                </button>
                <button
                  type="submit"
                  className="flex-1 pm-btn pm-btn-primary"
                >
                  创建市场
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CreateMarket
