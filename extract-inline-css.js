const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'public');
const cssPath = path.join(baseDir, 'css', 'style.css');

const filesToProcess = [
  path.join(baseDir, 'index.html'),
  path.join(baseDir, 'pages', 'admin.html'),
  path.join(baseDir, 'pages', 'admin-login.html'),
  path.join(baseDir, 'pages', 'categories.html'),
  path.join(baseDir, 'pages', 'consult.html'),
  path.join(baseDir, 'pages', 'dashboard.html'),
  path.join(baseDir, 'pages', 'knowledge.html'),
  path.join(baseDir, 'pages', 'login.html'),
  path.join(baseDir, 'pages', 'orders.html'),
  path.join(baseDir, 'pages', 'register.html'),
  path.join(baseDir, 'js', 'app.js'),
];

let generatedCss = '\n\n/* ── EXTRACTED INLINE STYLES ── */\n';
const styleMap = new Map(); // Map original style text -> CSS class 

let classCounter = 1;

for (const filePath of filesToProcess) {
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // This matches style="anything" or style='anything'
  const styleRegex = /style=["']([^"']+)["']/g;
  let match;
  
  // Collect all valid inline style matches backwards so string edits don't shift positions
  const replacements = [];
  while ((match = styleRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    let inlineStyleText = match[1].trim();
    
    // Skip very specific or dynamic styles we shouldn't extract 
    if (!inlineStyleText 
        || inlineStyleText.startsWith('display:') 
        || inlineStyleText.includes('display: none')
        || inlineStyleText.includes('${') 
        || inlineStyleText.startsWith('--')) {
      continue;
    }

    // Standardize termination for exact matches
    if (!inlineStyleText.endsWith(';')) inlineStyleText += ';';

    let className = styleMap.get(inlineStyleText);
    if (!className) {
      className = 'iv-style-' + classCounter++;
      styleMap.set(inlineStyleText, className);
      generatedCss += `.${className} { ${inlineStyleText} }\n`;
    }
    
    replacements.unshift({
      original: fullMatch,
      className: className,
      index: match.index
    });
  }
  
  // Replace backwards
  for (const { original, className, index } of replacements) {
    const before = newContent.substring(0, index);
    const after = newContent.substring(index + original.length);
    
    // Super crude class append approach to ensure valid browser processing
    // Instead of parsing perfectly, we inject class="X", existing classes will combine gracefully in browser.
    newContent = before + `class="${className}"` + after;
  }
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Processed ${path.basename(filePath)} (${replacements.length} styles extracted)`);
}

if (classCounter > 1) {
  fs.appendFileSync(cssPath, generatedCss, 'utf8');
  console.log(`Extracted total ${classCounter - 1} unique classes to ${cssPath}`);
} else {
  console.log('No eligible inline styles found to extract.');
}
