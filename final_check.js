const fs = require('fs');
const content = fs.readFileSync('src/app/sklep/page.tsx', 'utf8');
const lines = content.split('\n');
let stack = [];
const openDiv = /<div(?![^>]*\/>)[^>]*>/g;
const closeDiv = /<\/div>/g;
const openFrag = /<>/g;
const closeFrag = /<\/>/g;
for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    let match;
    let tokens = [];
    while ((match = openDiv.exec(line)) !== null) tokens.push({type: 'div', pos: match.index, op: true});
    while ((match = closeDiv.exec(line)) !== null) tokens.push({type: 'div', pos: match.index, op: false});
    while ((match = openFrag.exec(line)) !== null) tokens.push({type: 'frag', pos: match.index, op: true});
    while ((match = closeFrag.exec(line)) !== null) tokens.push({type: 'frag', pos: match.index, op: false});
    tokens.sort((a, b) => a.pos - b.pos);
    for (let token of tokens) {
        if (token.op) stack.push({type: token.type, line: i + 1});
        else {
            if (stack.length === 0) console.log(`Extra close ${token.type} at line ${i + 1}`);
            else {
                let last = stack.pop();
                if (last.type !== token.type) console.log(`Mismatch at line ${i + 1}: expected ${last.type} (from ${last.line}), got ${token.type}`);
            }
        }
    }
}
if (stack.length > 0) {
    console.log('Unclosed:');
    stack.forEach(s => console.log(`- ${s.type} line ${s.line}`));
} else {
    console.log('PERFECT');
}
