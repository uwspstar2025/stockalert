const express = require("express");
const router = express.Router();

// 交易策略数据
const tradingStrategies = [
  {
    id: "classic-4-20",
    name: "经典4%-20%策略",
    description: "稳健型策略，适合中长期投资",
    category: "稳健型",
    buyTrigger: {
      type: "下跌百分比",
      value: 4,
      unit: "%",
      description: "当股价下跌4%时买入",
    },
    sellTrigger: {
      type: "上涨百分比",
      value: 20,
      unit: "%",
      description: "当股价上涨20%时卖出",
    },
    riskLevel: "低",
    expectedReturn: "15-25%",
    timeFrame: "3-6个月",
    minInvestment: 1000,
    features: ["风险较低", "适合新手", "长期持有"],
    popular: true,
  },
  {
    id: "aggressive-2-15",
    name: "积极2%-15%策略",
    description: "激进型策略，快速盈利机会",
    category: "激进型",
    buyTrigger: {
      type: "下跌百分比",
      value: 2,
      unit: "%",
      description: "当股价下跌2%时买入",
    },
    sellTrigger: {
      type: "上涨百分比",
      value: 15,
      unit: "%",
      description: "当股价上涨15%时卖出",
    },
    riskLevel: "高",
    expectedReturn: "10-20%",
    timeFrame: "1-3个月",
    minInvestment: 2000,
    features: ["交易频繁", "快速盈利", "需要经验"],
  },
  {
    id: "conservative-6-30",
    name: "保守6%-30%策略",
    description: "超稳健策略，适合风险厌恶投资者",
    category: "保守型",
    buyTrigger: {
      type: "下跌百分比",
      value: 6,
      unit: "%",
      description: "当股价下跌6%时买入",
    },
    sellTrigger: {
      type: "上涨百分比",
      value: 30,
      unit: "%",
      description: "当股价上涨30%时卖出",
    },
    riskLevel: "极低",
    expectedReturn: "20-35%",
    timeFrame: "6-12个月",
    minInvestment: 500,
    features: ["风险极低", "长期投资", "稳定收益"],
  },
  {
    id: "scalping-1-5",
    name: "日内1%-5%策略",
    description: "超短线策略，当日进出",
    category: "超短线",
    buyTrigger: {
      type: "下跌百分比",
      value: 1,
      unit: "%",
      description: "当股价下跌1%时买入",
    },
    sellTrigger: {
      type: "上涨百分比",
      value: 5,
      unit: "%",
      description: "当股价上涨5%时卖出",
    },
    riskLevel: "极高",
    expectedReturn: "3-8%",
    timeFrame: "1天内",
    minInvestment: 5000,
    features: ["高频交易", "当日结算", "专业级别"],
    advanced: true,
  },
  {
    id: "momentum-3-25",
    name: "动量3%-25%策略",
    description: "趋势跟踪策略，捕捉强势股",
    category: "趋势型",
    buyTrigger: {
      type: "突破上涨",
      value: 3,
      unit: "%",
      description: "当股价突破并上涨3%时买入",
    },
    sellTrigger: {
      type: "目标获利",
      value: 25,
      unit: "%",
      description: "达到25%获利目标时卖出",
    },
    riskLevel: "中高",
    expectedReturn: "18-30%",
    timeFrame: "2-4个月",
    minInvestment: 1500,
    features: ["趋势跟踪", "强势股票", "动量策略"],
  },
  {
    id: "value-8-40",
    name: "价值8%-40%策略",
    description: "价值投资策略，寻找被低估股票",
    category: "价值型",
    buyTrigger: {
      type: "深度回调",
      value: 8,
      unit: "%",
      description: "当优质股深度回调8%时买入",
    },
    sellTrigger: {
      type: "价值回归",
      value: 40,
      unit: "%",
      description: "价值回归上涨40%时卖出",
    },
    riskLevel: "中",
    expectedReturn: "25-45%",
    timeFrame: "6-18个月",
    minInvestment: 3000,
    features: ["价值投资", "长期持有", "基本面分析"],
  },
  {
    id: "grid-5-5",
    name: "网格5%-5%策略",
    description: "网格交易策略，震荡市场获利",
    category: "网格型",
    buyTrigger: {
      type: "网格买入",
      value: 5,
      unit: "%",
      description: "每下跌5%加仓买入",
    },
    sellTrigger: {
      type: "网格卖出",
      value: 5,
      unit: "%",
      description: "每上涨5%减仓卖出",
    },
    riskLevel: "中",
    expectedReturn: "12-20%",
    timeFrame: "持续运行",
    minInvestment: 10000,
    features: ["网格交易", "震荡获利", "分批操作"],
  },
  {
    id: "dividend-capture",
    name: "分红捕获策略",
    description: "专注高分红股票的投资策略",
    category: "分红型",
    buyTrigger: {
      type: "除权前买入",
      value: 2,
      unit: "天",
      description: "在除权日前2天买入",
    },
    sellTrigger: {
      type: "分红到账",
      value: 1,
      unit: "天",
      description: "分红到账后1天卖出",
    },
    riskLevel: "低",
    expectedReturn: "8-15%",
    timeFrame: "按分红周期",
    minInvestment: 2000,
    features: ["稳定分红", "现金流", "低风险"],
  },
];

// 获取所有交易策略
router.get("/", (req, res) => {
  try {
    const { category, riskLevel, popular } = req.query;

    let filteredStrategies = [...tradingStrategies];

    // 按分类筛选
    if (category) {
      filteredStrategies = filteredStrategies.filter(
        (strategy) => strategy.category === category
      );
    }

    // 按风险级别筛选
    if (riskLevel) {
      filteredStrategies = filteredStrategies.filter(
        (strategy) => strategy.riskLevel === riskLevel
      );
    }

    // 只显示热门策略
    if (popular === "true") {
      filteredStrategies = filteredStrategies.filter(
        (strategy) => strategy.popular === true
      );
    }

    res.json({
      success: true,
      data: filteredStrategies,
      total: filteredStrategies.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch trading strategies",
      message: error.message,
    });
  }
});

// 获取特定策略详情
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const strategy = tradingStrategies.find((s) => s.id === id);

    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: "Strategy not found",
        message: `Trading strategy with id ${id} not found`,
      });
    }

    res.json({
      success: true,
      data: strategy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch strategy details",
      message: error.message,
    });
  }
});

// 获取策略分类
router.get("/categories/list", (req, res) => {
  try {
    const categories = [...new Set(tradingStrategies.map((s) => s.category))];
    const riskLevels = [...new Set(tradingStrategies.map((s) => s.riskLevel))];

    res.json({
      success: true,
      data: {
        categories,
        riskLevels,
        totalStrategies: tradingStrategies.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
      message: error.message,
    });
  }
});

// 策略回测数据 (模拟)
router.get("/:id/backtest", (req, res) => {
  try {
    const { id } = req.params;
    const strategy = tradingStrategies.find((s) => s.id === id);

    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: "Strategy not found",
      });
    }

    // 模拟回测数据
    const backtestData = {
      strategyId: id,
      period: "2023-2024",
      totalTrades: Math.floor(Math.random() * 50) + 10,
      winRate: (Math.random() * 30 + 60).toFixed(1) + "%",
      totalReturn: (Math.random() * 50 + 10).toFixed(1) + "%",
      maxDrawdown: (Math.random() * 15 + 5).toFixed(1) + "%",
      sharpeRatio: (Math.random() * 2 + 1).toFixed(2),
      avgHoldingDays: Math.floor(Math.random() * 100) + 10,
      profitFactor: (Math.random() * 2 + 1.2).toFixed(2),
    };

    res.json({
      success: true,
      data: backtestData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch backtest data",
      message: error.message,
    });
  }
});

module.exports = router;
