const fs = require('fs');

const casualCache = JSON.parse(fs.readFileSync('casual-cache.json', 'utf8'));

for (let i = 0; i <= 5; i++) {
  let formalText = fs.readFileSync(`src/data/pillar-${i}.ts`, 'utf8');
  let casualText = casualCache[i];
  
  const formalTopics = formalText.split('    {\n      id:');
  const casualTopics = casualText.split('    {\n      id:');
  
  let newFormalText = formalTopics[0];
  
  for (let j = 1; j < formalTopics.length; j++) {
    let fTopic = formalTopics[j];
    let cTopic = casualTopics[j];
    
    const cContentMatch = cTopic.match(/content: (`|')([\s\S]*?)\1,\n      why:/);
    const cWhyMatch = cTopic.match(/why: (`|')([\s\S]*?)\1,\n      mistake:/);
    const cMistakeMatch = cTopic.match(/mistake: (`|')([\s\S]*?)\1,\n      interview:/);
    
    if (cContentMatch && cWhyMatch && cMistakeMatch) {
      const fContentMatch = fTopic.match(/content: (`|')([\s\S]*?)\1,\n      why:/);
      
      if (fContentMatch && cContentMatch[2] !== fContentMatch[2]) {
        const fMistakeMatch = fTopic.match(/mistake: (`|')([\s\S]*?)\1,\n      interview:/);
        if (fMistakeMatch) {
          const replacement = `mistake: ${fMistakeMatch[1]}${fMistakeMatch[2]}${fMistakeMatch[1]},\n      content_casual: ${cContentMatch[1]}${cContentMatch[2]}${cContentMatch[1]},\n      why_casual: ${cWhyMatch[1]}${cWhyMatch[2]}${cWhyMatch[1]},\n      mistake_casual: ${cMistakeMatch[1]}${cMistakeMatch[2]}${cMistakeMatch[1]},\n      interview:`;
          
          fTopic = fTopic.replace(/mistake: (`|')([\s\S]*?)\1,\n      interview:/, replacement);
        }
      }
    }
    
    newFormalText += '    {\n      id:' + fTopic;
  }
  
  fs.writeFileSync(`src/data/pillar-${i}.ts`, newFormalText);
}
console.log('Merged casual content successfully!');
