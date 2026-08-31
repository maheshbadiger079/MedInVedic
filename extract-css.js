const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const cssFile = path.join(publicDir, 'css', 'style.css');
const htmlFiles = [];

// Recursive find HTML files
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findHtmlFiles(fullPath);
    } else if (fullPath.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
}
findHtmlFiles(publicDir);

let cssAppend = '\n/* ── EXTRACTED INLINE STYLES ── */\n';
let counter = 1;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Need to be careful. Match style="..." but not if it contains JS templating like style="${...}"
  // because those are dynamically set. Wait, HTML files don't have JS template literals in their raw text.
  // JavaScript files might, but we are only processing .html files.
  
  const styleRegex = /style="([^"]+)"/g;
  let match;
  let newContent = content;
  
  while ((match = styleRegex.exec(content)) !== null) {
    const inlineStyle = match[1].trim();
    if (!inlineStyle || inlineStyle.startsWith('display:none') || inlineStyle === 'display: none;') continue; // skip simple ones or hidden elements
    if (inlineStyle.includes('${')) continue; // skip template strings if any leaked in
    
    // Hash or simply sequence the class name
    const className = `auto-style-${counter++}`;
    
    // Create CSS rule
    cssAppend += `.${className} { ${inlineStyle} }\n`;
    
    // Replace in HTML. We need to handle if the element already has a class attribute.
    // It's tricky with regex to know if there's a class="..." before or after the style="..."
    // A simple approach is just to replace `style="..."` with `class="... existing classes ..."`
    // But since regex is hard for parsing HTML, let's just do a simple replacement: 
    // We can replace exactly  style="inlineStyle"  with  class="className" 
    // Wait, if it already has a class, `class="existing auto-style-1"`
    // Let's use string replace but we have to be careful not to replace globally if another element has the exact same style.
    // Actually, if it has the exact same style, reusing the class is GOOD.
    
    // Note: This script is a bit simplistic and might mess up if not careful.
  }
}

// Instead of automated full replacement which is risky, let me just use PowerShell and replace the known files manually or use Cheerio if installed.
