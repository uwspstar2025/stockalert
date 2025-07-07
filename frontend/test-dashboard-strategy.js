// Test script to verify dashboard strategy display
console.log('=== DASHBOARD STRATEGY TEST ===');

// Clear any existing data
localStorage.removeItem('selectedStocks');
localStorage.removeItem('stockStrategyMapping');
localStorage.removeItem('selectedStockData');

// Set up TSLA as selected stock
localStorage.setItem('selectedStocks', JSON.stringify(['TSLA']));

// Create a test strategy with proper trigger objects
const testStrategy = {
  id: 'test-strategy-1',
  name: '动量交易策略',
  description: '基于技术指标的短期交易策略',
  category: '技术分析',
  riskLevel: '中等',
  expectedReturn: '15-25%',
  timeFrame: '1-3个月',
  minInvestment: 10000,
  buyTrigger: {
    type: 'price_change',
    value: 5,
    unit: '%',
    description: '价格上涨超过5%时买入'
  },
  sellTrigger: {
    type: 'price_change',
    value: -3,
    unit: '%',
    description: '价格下跌超过3%时卖出'
  },
  features: ['快速响应', '适合波动市场']
};

// Set up strategy mapping for TSLA
const strategyMapping = {
  'TSLA': testStrategy
};
localStorage.setItem('stockStrategyMapping', JSON.stringify(strategyMapping));

// Set up stock data
const stockData = [{
  symbol: 'TSLA',
  name: 'Tesla, Inc.',
  price: 315.35,
  change: 7.63,
  changePercent: 2.48,
  volume: 45000000
}];
localStorage.setItem('selectedStockData', JSON.stringify(stockData));

console.log('Test data set up:');
console.log('Selected stocks:', localStorage.getItem('selectedStocks'));
console.log('Strategy mapping:', localStorage.getItem('stockStrategyMapping'));
console.log('Stock data:', localStorage.getItem('selectedStockData'));
console.log('Now refresh the dashboard to see the strategy display!');
