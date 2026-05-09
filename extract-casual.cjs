const fs = require('fs');

const casualMap = {};

for (let i = 0; i <= 5; i++) {
  const content = fs.readFileSync(`src/data/pillar-${i}.ts`, 'utf8');
  casualMap[i] = content;
}

fs.writeFileSync('casual-cache.json', JSON.stringify(casualMap, null, 2));
console.log('Saved casual content');
