console.log('=== DEBUGGING STRATEGY SELECTION ISSUE ===');

// Check current localStorage state
console.log('1. Current localStorage state:');
console.log('selectedStocks:', localStorage.getItem('selectedStocks'));
console.log('stockStrategyMapping:', localStorage.getItem('stockStrategyMapping'));
console.log('configureStrategyFor:', localStorage.getItem('configureStrategyFor'));
console.log('selectedStrategy:', localStorage.getItem('selectedStrategy'));

// Parse and examine the strategy mapping
try {
  const mapping = JSON.parse(localStorage.getItem('stockStrategyMapping') || '{}');
  console.log('2. Parsed strategy mapping:', mapping);
  console.log('TSLA strategy:', mapping['TSLA']);
  
  if (mapping['TSLA']) {
    console.log('TSLA strategy details:');
    console.log('- name:', mapping['TSLA'].name);
    console.log('- buyTrigger:', mapping['TSLA'].buyTrigger);
    console.log('- sellTrigger:', mapping['TSLA'].sellTrigger);
  }
} catch (e) {
  console.error('Error parsing strategy mapping:', e);
}

// Check selected stocks
try {
  const stocks = JSON.parse(localStorage.getItem('selectedStocks') || '[]');
  console.log('3. Selected stocks:', stocks);
  console.log('Is TSLA selected?', stocks.includes('TSLA'));
} catch (e) {
  console.error('Error parsing selected stocks:', e);
}

console.log('4. Open browser console and run this script to see the data');
