const fs = require('fs');
const casualCache = JSON.parse(fs.readFileSync('casual-cache.json', 'utf8'));

for (let i = 0; i <= 5; i++) {
  let formalText = fs.readFileSync(`src/data/pillar-${i}.ts`, 'utf8');
  let casualText = casualCache[i];
  
  const regex = /id:\s*'([^']+)'[\s\S]*?content:\s*(`|')([\s\S]*?)\2,[\s\S]*?why:\s*(`|')([\s\S]*?)\4,[\s\S]*?mistake:\s*(`|')([\s\S]*?)\6,/g;
  
  let match;
  const casualData = {};
  while ((match = regex.exec(casualText)) !== null) {
    casualData[match[1]] = {
      content: match[3],
      why: match[5],
      mistake: match[7],
      q1: match[2],
      q2: match[4],
      q3: match[6]
    };
  }
  
  const fRegex = /id:\s*'([^']+)'[\s\S]*?content:\s*(`|')([\s\S]*?)\2,[\s\S]*?why:\s*(`|')([\s\S]*?)\4,[\s\S]*?mistake:\s*(`|')([\s\S]*?)\6,/g;
  
  let newFormalText = formalText.replace(fRegex, (matchStr, id, q1, content, q2, why, q3, mistake) => {
    if (casualData[id] && (casualData[id].content !== content)) {
      const casual = casualData[id];
      return matchStr + `\n      content_casual: ${casual.q1}${casual.content}${casual.q1},\n      why_casual: ${casual.q2}${casual.why}${casual.q2},\n      mistake_casual: ${casual.q3}${casual.mistake}${casual.q3},`;
    }
    return matchStr;
  });
  
  fs.writeFileSync(`src/data/pillar-${i}.ts`, newFormalText);
  console.log('Processed pillar ' + i);
}
