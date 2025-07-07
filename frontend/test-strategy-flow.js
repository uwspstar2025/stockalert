// Test script to simulate the strategy selection flow
console.log('=== TESTING STRATEGY SELECTION FLOW ===');

// 1. Clear existing data
localStorage.removeItem('selectedStocks');
localStorage.removeItem('stockStrategyMapping');
localStorage.removeItem('selectedStrategy');
localStorage.removeItem('configureStrategyFor');

// 2. Set up TSLA as selected stock
localStorage.setItem('selectedStocks', JSON.stringify(['TSLA']));
console.log('✓ Added TSLA to selected stocks');

// 3. Simulate clicking "配置策略" for TSLA
localStorage.setItem('configureStrategyFor', 'TSLA');
console.log('✓ Set configureStrategyFor to TSLA');

// 4. Simulate selecting the "经典4%-20%策略"
const selectedStrategy = {
  id: 'classic-4-20',
  name: '经典4%-20%策略',
  description: '稳健型策略，适合中长期投资',
  category: '稳健型',
  riskLevel: '低',
  expectedReturn: '15-25%',
  timeFrame: '3-6个月',
  minInvestment: 1000,
  buyTrigger: {
    type: 'price_change',
    value: -4,
    unit: '%',
    description: '当股价下跌4%时买入'
  },
  sellTrigger: {
    type: 'price_change',
    value: 20,
    unit: '%',
    description: '当股价上涨20%时卖出'
  },
  features: ['风险较低', '适合新手', '长期持有']
};

// 5. Simulate the strategy configuration process
const existingMapping = JSON.parse(localStorage.getItem('stockStrategyMapping') || '{}');
existingMapping['TSLA'] = selectedStrategy;
localStorage.setItem('stockStrategyMapping', JSON.stringify(existingMapping));
localStorage.setItem('selectedStrategy', JSON.stringify(selectedStrategy));

console.log('✓ Strategy configured for TSLA');
console.log('Strategy mapping:', existingMapping);

// 6. Set dashboard refresh flag
localStorage.setItem('dashboardNeedsRefresh', 'true');

// 7. Clean up
localStorage.removeItem('configureStrategyFor');

// 8. Verify the final state
console.log('\n=== FINAL STATE ===');
console.log('selectedStocks:', localStorage.getItem('selectedStocks'));
console.log('stockStrategyMapping:', localStorage.getItem('stockStrategyMapping'));
console.log('selectedStrategy:', localStorage.getItem('selectedStrategy'));
console.log('dashboardNeedsRefresh:', localStorage.getItem('dashboardNeedsRefresh'));

// Parse and show TSLA strategy
const finalMapping = JSON.parse(localStorage.getItem('stockStrategyMapping') || '{}');
console.log('\nTSLA strategy details:');
console.log('- name:', finalMapping['TSLA']?.name);
console.log('- buyTrigger:', finalMapping['TSLA']?.buyTrigger);
console.log('- sellTrigger:', finalMapping['TSLA']?.sellTrigger);

console.log('\n✓ Test completed. Now refresh the dashboard page to see the result.');
