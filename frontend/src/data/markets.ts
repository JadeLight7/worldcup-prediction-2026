// 2026世界杯市场数据 - 基于真实参赛球队
// 截至2026年4月：48/48支球队已确定（附加赛于3月31日结束）

export interface Market {
  id: string
  question: string
  description: string
  category: MarketCategory
  outcomes: Outcome[]
  volume: number
  liquidity: number
  endDate: string
  group?: string
  change24h?: number
  featured?: boolean
}

export interface Outcome {
  name: string
  price: number
}

export type MarketCategory =
  | '冠军预测'
  | '金靴奖'
  | '小组出线'
  | '单场赛事'
  | '特定球员'
  | '小组赛排名'

// 已确定晋级的48支球队（截至2026年4月1日，附加赛结束）
export const QUALIFIED_TEAMS = {
  hosts: ['美国', '加拿大', '墨西哥'],
  europe: ['英格兰', '法国', '西班牙', '德国', '葡萄牙', '荷兰', '比利时', '克罗地亚', '瑞士', '奥地利', '挪威', '苏格兰', '意大利', '瑞典', '土耳其', '丹麦'],
  southAmerica: ['阿根廷', '巴西', '哥伦比亚', '乌拉圭', '厄瓜多尔', '巴拉圭'],
  asia: ['日本', '伊朗', '韩国', '澳大利亚', '乌兹别克斯坦', '约旦', '卡塔尔', '沙特', '伊拉克'],
  africa: ['摩洛哥', '阿尔及利亚', '埃及', '塞内加尔', '突尼斯', '加纳', '科特迪瓦', '南非', '佛得角'],
  concacaf: ['巴拿马', '库拉索', '海地', '牙买加'],
  oceania: ['新西兰']
}

// 市场数据
export const marketsData: Market[] = [
  // ========== 冠军预测 ==========
  {
    id: '1',
    question: '阿根廷会赢得2026世界杯冠军吗？',
    description: '阿根廷作为卫冕冠军，梅西领衔的阵容是否能在美加墨再次夺冠？',
    category: '冠军预测',
    outcomes: [
      { name: '是', price: 0.22 },
      { name: '否', price: 0.78 }
    ],
    volume: 2457890,
    liquidity: 345230,
    endDate: '2026-07-19',
    change24h: 3.2,
    featured: true
  },
  {
    id: '2',
    question: '法国队会赢得2026世界杯冠军吗？',
    description: '拥有姆巴佩、登贝莱等球星的法国队能否捧起大力神杯？',
    category: '冠军预测',
    outcomes: [
      { name: '是', price: 0.18 },
      { name: '否', price: 0.82 }
    ],
    volume: 1892345,
    liquidity: 234560,
    endDate: '2026-07-19',
    change24h: -1.5,
    featured: true
  },
  {
    id: '3',
    question: '巴西队会赢得2026世界杯冠军吗？',
    description: '五星巴西能否在北美大陆重夺世界杯？',
    category: '冠军预测',
    outcomes: [
      { name: '是', price: 0.15 },
      { name: '否', price: 0.85 }
    ],
    volume: 1567890,
    liquidity: 198760,
    endDate: '2026-07-19',
    change24h: 0.8,
    featured: true
  },
  {
    id: '4',
    question: '英格兰队会赢得2026世界杯冠军吗？',
    description: '英格兰能否结束60年的冠军荒？',
    category: '冠军预测',
    outcomes: [
      { name: '是', price: 0.12 },
      { name: '否', price: 0.88 }
    ],
    volume: 1234567,
    liquidity: 156780,
    endDate: '2026-07-19',
    change24h: 2.1
  },
  {
    id: '5',
    question: '西班牙队会赢得2026世界杯冠军吗？',
    description: '新科欧洲杯冠军西班牙能否在世界杯延续强势？',
    category: '冠军预测',
    outcomes: [
      { name: '是', price: 0.11 },
      { name: '否', price: 0.89 }
    ],
    volume: 987654,
    liquidity: 123450,
    endDate: '2026-07-19',
    change24h: 4.5
  },
  {
    id: '6',
    question: '德国队会赢得2026世界杯冠军吗？',
    description: '东道主之一德国队能否在家门口夺冠？',
    category: '冠军预测',
    outcomes: [
      { name: '是', price: 0.10 },
      { name: '否', price: 0.90 }
    ],
    volume: 876543,
    liquidity: 109870,
    endDate: '2026-07-19',
    change24h: -0.5
  },

  // ========== 金靴奖 ==========
  {
    id: '7',
    question: '姆巴佩会获得2026世界杯金靴奖吗？',
    description: '法国巨星姆巴佩能否成为世界杯最佳射手？',
    category: '金靴奖',
    outcomes: [
      { name: '是', price: 0.16 },
      { name: '否', price: 0.84 }
    ],
    volume: 1345678,
    liquidity: 167890,
    endDate: '2026-07-19',
    change24h: 1.2
  },
  {
    id: '8',
    question: '哈兰德会获得2026世界杯金靴奖吗？',
    description: '挪威神锋哈兰德在世界杯能进多少球？',
    category: '金靴奖',
    outcomes: [
      { name: '是', price: 0.12 },
      { name: '否', price: 0.88 }
    ],
    volume: 987654,
    liquidity: 123456,
    endDate: '2026-07-19',
    change24h: 3.8
  },
  {
    id: '9',
    question: '梅西会获得2026世界杯金靴奖吗？',
    description: '39岁的梅西能否再夺金靴？',
    category: '金靴奖',
    outcomes: [
      { name: '是', price: 0.08 },
      { name: '否', price: 0.92 }
    ],
    volume: 765432,
    liquidity: 95678,
    endDate: '2026-07-19',
    change24h: -2.3
  },
  {
    id: '10',
    question: '维尼修斯会获得2026世界杯金靴奖吗？',
    description: '巴西新星维尼修斯能否在世界杯大放异彩？',
    category: '金靴奖',
    outcomes: [
      { name: '是', price: 0.09 },
      { name: '否', price: 0.91 }
    ],
    volume: 654321,
    liquidity: 81789,
    endDate: '2026-07-19',
    change24h: 5.6
  },

  // ========== 小组出线 ==========
  {
    id: '11',
    question: '美国队能从A组出线吗？',
    description: 'A组：美国、墨西哥、巴拿马、新西兰。东道主美国能否小组出线？',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 0.72 },
      { name: '否', price: 0.28 }
    ],
    volume: 567890,
    liquidity: 70986,
    endDate: '2026-06-25',
    group: 'A组'
  },
  {
    id: '12',
    question: '墨西哥队能从A组出线吗？',
    description: 'A组：美国、墨西哥、巴拿马、新西兰。东道主墨西哥能否小组出线？',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 0.68 },
      { name: '否', price: 0.32 }
    ],
    volume: 456789,
    liquidity: 57098,
    endDate: '2026-06-25',
    group: 'A组'
  },
  {
    id: '13',
    question: '阿根廷队能从B组出线吗？',
    description: 'B组：阿根廷、塞内加尔、奥地利、约旦。卫冕冠军能否顺利出线？',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 0.88 },
      { name: '否', price: 0.12 }
    ],
    volume: 789012,
    liquidity: 98626,
    endDate: '2026-06-26',
    group: 'B组'
  },
  {
    id: '14',
    question: '日本队能从C组出线吗？',
    description: 'C组：西班牙、日本、科特迪瓦、海地。亚洲冠军日本能否出线？',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 0.58 },
      { name: '否', price: 0.42 }
    ],
    volume: 432109,
    liquidity: 54013,
    endDate: '2026-06-26',
    group: 'C组'
  },
  {
    id: '15',
    question: '英格兰队能从D组出线吗？',
    description: 'D组：英格兰、阿尔及利亚、智利、巴林。英格兰能否轻松出线？',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 0.82 },
      { name: '否', price: 0.18 }
    ],
    volume: 567890,
    liquidity: 70986,
    endDate: '2026-06-27',
    group: 'D组'
  },
  {
    id: '16',
    question: '韩国队能从E组出线吗？',
    description: 'E组：比利时、韩国、乌拉圭、突尼斯。韩国能否连续三届出线？',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 0.42 },
      { name: '否', price: 0.58 }
    ],
    volume: 345678,
    liquidity: 43209,
    endDate: '2026-06-27',
    group: 'E组'
  },
  {
    id: '17',
    question: '巴西队能从G组出线吗？',
    description: 'G组：巴西、瑞士、澳大利亚、南非。巴西能否小组第一出线？',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 0.86 },
      { name: '否', price: 0.14 }
    ],
    volume: 678901,
    liquidity: 84862,
    endDate: '2026-06-28',
    group: 'G组'
  },
  {
    id: '18',
    question: '法国队能从H组出线吗？',
    description: 'H组：法国、丹麦、卡塔尔、加拿大。法国能否轻松出线？',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 0.90 },
      { name: '否', price: 0.10 }
    ],
    volume: 789012,
    liquidity: 98626,
    endDate: '2026-06-28',
    group: 'H组'
  },

  // ========== 单场赛事 ==========
  {
    id: '19',
    question: '揭幕战：美国 vs 墨西哥 谁会获胜？',
    description: '2026年6月11日，世界杯揭幕战在洛杉矶举行，两支东道主直接对话',
    category: '单场赛事',
    outcomes: [
      { name: '美国', price: 0.38 },
      { name: '墨西哥', price: 0.35 },
      { name: '平局', price: 0.27 }
    ],
    volume: 987654,
    liquidity: 123456,
    endDate: '2026-06-11'
  },
  {
    id: '20',
    question: '阿根廷 vs 塞内加尔 谁会获胜？',
    description: 'B组首轮，卫冕冠军对阵非洲劲旅',
    category: '单场赛事',
    outcomes: [
      { name: '阿根廷', price: 0.58 },
      { name: '塞内加尔', price: 0.22 },
      { name: '平局', price: 0.20 }
    ],
    volume: 654321,
    liquidity: 81789,
    endDate: '2026-06-12'
  },
  {
    id: '21',
    question: '英格兰 vs 阿尔及利亚 谁会获胜？',
    description: 'D组首轮，英格兰对阵非洲球队',
    category: '单场赛事',
    outcomes: [
      { name: '英格兰', price: 0.72 },
      { name: '阿尔及利亚', price: 0.12 },
      { name: '平局', price: 0.16 }
    ],
    volume: 543210,
    liquidity: 67901,
    endDate: '2026-06-13'
  },

  // ========== 特定球员 ==========
  {
    id: '22',
    question: '梅西会在2026世界杯进球吗？',
    description: '39岁的梅西能否在美加墨世界杯取得进球？',
    category: '特定球员',
    outcomes: [
      { name: '是', price: 0.65 },
      { name: '否', price: 0.35 }
    ],
    volume: 432109,
    liquidity: 54013,
    endDate: '2026-07-19',
    change24h: -1.2
  },
  {
    id: '23',
    question: 'C罗会参加2026世界杯吗？',
    description: '41岁的C罗能否代表葡萄牙参加2026世界杯？',
    category: '特定球员',
    outcomes: [
      { name: '是', price: 0.45 },
      { name: '否', price: 0.55 }
    ],
    volume: 567890,
    liquidity: 70986,
    endDate: '2026-06-01',
    change24h: 2.3
  },
  {
    id: '24',
    question: '姆巴佩会为法国队进球吗？',
    description: '姆巴佩能否在2026世界杯为法国队取得进球？',
    category: '特定球员',
    outcomes: [
      { name: '是', price: 0.78 },
      { name: '否', price: 0.22 }
    ],
    volume: 345678,
    liquidity: 43209,
    endDate: '2026-07-19',
    change24h: 0.5
  },

  // ========== 附加赛结果（已结算）==========
  {
    id: '25',
    question: '【已结算】意大利能从附加赛晋级吗？',
    description: '意大利vs波黑，欧洲区附加赛决赛（3月31日）- 意大利 2:0 波黑，成功晋级',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 1.0 },
      { name: '否', price: 0.0 }
    ],
    volume: 432109,
    liquidity: 54013,
    endDate: '2026-03-31',
    change24h: 0
  },
  {
    id: '26',
    question: '【已结算】瑞典能从附加赛晋级吗？',
    description: '瑞典vs波兰，欧洲区附加赛决赛（3月31日）- 瑞典 1:0 波兰，成功晋级',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 1.0 },
      { name: '否', price: 0.0 }
    ],
    volume: 234567,
    liquidity: 29320,
    endDate: '2026-03-31',
    change24h: 0
  },
  {
    id: '27',
    question: '【已结算】伊拉克能从洲际附加赛晋级吗？',
    description: '伊拉克vs玻利维亚，洲际附加赛（3月31日）- 伊拉克 2:1 玻利维亚，成功晋级',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 1.0 },
      { name: '否', price: 0.0 }
    ],
    volume: 198765,
    liquidity: 24845,
    endDate: '2026-03-31',
    change24h: 0
  },
  {
    id: '28',
    question: '【已结算】土耳其能从附加赛晋级吗？',
    description: '土耳其vs科索沃，欧洲区附加赛决赛（3月31日）- 土耳其 3:1 科索沃，成功晋级',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 1.0 },
      { name: '否', price: 0.0 }
    ],
    volume: 312456,
    liquidity: 38902,
    endDate: '2026-03-31',
    change24h: 0
  },
  {
    id: '29',
    question: '【已结算】丹麦能从附加赛晋级吗？',
    description: '丹麦vs捷克，欧洲区附加赛决赛（3月31日）- 丹麦 2:0 捷克，成功晋级',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 1.0 },
      { name: '否', price: 0.0 }
    ],
    volume: 287654,
    liquidity: 35678,
    endDate: '2026-03-31',
    change24h: 0
  },
  {
    id: '30',
    question: '【已结算】牙买加能从洲际附加赛晋级吗？',
    description: '牙买加vs刚果金，洲际附加赛（3月31日）- 牙买加 1:0 刚果金，成功晋级',
    category: '小组出线',
    outcomes: [
      { name: '是', price: 1.0 },
      { name: '否', price: 0.0 }
    ],
    volume: 178234,
    liquidity: 21987,
    endDate: '2026-03-31',
    change24h: 0
  },

  // ========== 新增：48强预测 ==========
  {
    id: '31',
    question: '意大利会在2026世界杯走多远？',
    description: '附加赛晋级的意大利队能在世界杯取得什么成绩？',
    category: '冠军预测',
    outcomes: [
      { name: '小组赛', price: 0.25 },
      { name: '16强', price: 0.35 },
      { name: '8强+', price: 0.40 }
    ],
    volume: 523456,
    liquidity: 65432,
    endDate: '2026-07-19',
    change24h: 2.1,
    featured: true
  },
  {
    id: '32',
    question: '瑞典会在2026世界杯走多远？',
    description: '附加赛晋级的瑞典队能在世界杯取得什么成绩？',
    category: '冠军预测',
    outcomes: [
      { name: '小组赛', price: 0.30 },
      { name: '16强', price: 0.40 },
      { name: '8强+', price: 0.30 }
    ],
    volume: 412345,
    liquidity: 51234,
    endDate: '2026-07-19',
    change24h: 1.5
  }
]

// 获取热门市场
export const getFeaturedMarkets = () => marketsData.filter(m => m.featured)

// 按分类获取市场
export const getMarketsByCategory = (category: string) => {
  if (category === '全部') return marketsData
  if (category === '热门') return getFeaturedMarkets()
  return marketsData.filter(m => m.category === category)
}

// 获取单个市场
export const getMarketById = (id: string) => marketsData.find(m => m.id === id)

// 分类列表
export const categories = ['全部', '热门', '冠军预测', '金靴奖', '小组出线', '单场赛事', '特定球员']

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
  return `$${num}`
}
