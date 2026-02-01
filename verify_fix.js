// 模拟App.tsx的数据加载逻辑
const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('public/principles.json', 'utf-8'));
  
  console.log('✓ principles.json loaded successfully');
  console.log(`✓ receptors array exists: ${Array.isArray(data.receptors)}`);
  console.log(`✓ hypotheses array exists: ${Array.isArray(data.hypotheses)}`);
  console.log(`✓ receptors count: ${data.receptors?.length || 0}`);
  console.log(`✓ hypotheses count: ${data.hypotheses?.length || 0}`);
  
  // 模拟App.tsx第61-64行的操作
  const allPrinciples = [
    ...data.receptors.map(r => ({ ...r, type: 'receptor' })),
    ...data.hypotheses.map(h => ({ ...h, type: 'hypothesis' }))
  ];
  
  console.log(`✓ Combined principles count: ${allPrinciples.length}`);
  console.log('✓ App.tsx logic will work correctly');
  
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}
