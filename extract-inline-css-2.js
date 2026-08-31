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

let generatedCss = '';
let classCounter = 200;
const styleMap = new Map(); 

for (const filePath of filesToProcess) {
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  let styleRegex = /style=["'](.*?)["']/g;
  let match;
  let replacements = [];
  
  while ((match = styleRegex.exec(content)) !== null) {
    let fullMatch = match[0];
    let styleText = match[1].trim();
    if (!styleText || 
        styleText.includes('display:none') || 
        styleText.includes('display: none') || 
        styleText.includes('${') || 
        styleText.startsWith('--')) {
      continue;
    }

    if (!styleText.endsWith(';')) styleText += ';';
    
    let className = styleMap.get(styleText);
    if (!className) {
      className = 'iv-style-' + classCounter++;
      styleMap.set(styleText, className);
      generatedCss += `.${className} { ${styleText} }\n`;
    }
    
    replacements.unshift({
      original: fullMatch,
      className: className,
      index: match.index
    });
  }
  
  let newContent = content;
  for (const { original, className, index } of replacements) {
    const before = newContent.substring(0, index);
    const after = newContent.substring(index + original.length);
    newContent = before + `class="${className}"` + after;
  }
  
  // Actually merge the classes nicely
  // We need to carefully avoid clobbering JS strings so do this ONLY for HTML files
  if (filePath.endsWith('.html')) {
    newContent = newContent.replace(/<([a-zA-Z0-9\-]+)([^>]*?)>/g, (fullTag, tagName, attributes) => {
      const classRegex = /class=["']([^"']*)["']/g;
      let classes = [];
      let attrMatch, hasMatches = false;
      let mergedAttributes = attributes;

      while ((attrMatch = classRegex.exec(attributes)) !== null) {
        if (attrMatch[1].trim()) {
          // split existing classes and add individually
          classes.push(...attrMatch[1].trim().split(/\s+/));
        }
        hasMatches = true;
      }

      if (hasMatches) {
        // remove all class="..." instances
        mergedAttributes = mergedAttributes.replace(/\s*class=(["'])(?:(?!\1).)*\1/gi, '');
        // dedup classes
        const uniqueClasses = [...new Set(classes)].join(' ');
        // Inject back at start of attributes
        mergedAttributes = ` class="${uniqueClasses}"` + mergedAttributes;
        return `<${tagName}${mergedAttributes}>`;
      }
      return fullTag;
    });
  } else {
    // For Javascript, finding <div ...> is exactly the same essentially since these are HTML literals
    newContent = newContent.replace(/<([a-zA-Z0-9\-]+)([^>]*?)>/g, (fullTag, tagName, attributes) => {
      const classRegex = /class=["']([^"']*)["']/g;
      let classes = [];
      let attrMatch, hasMatches = false;
      let mergedAttributes = attributes;

      while ((attrMatch = classRegex.exec(attributes)) !== null) {
        if (attrMatch[1].trim()) {
            // split existing classes and add individually
            classes.push(...attrMatch[1].trim().split(/\s+/));
        }
        hasMatches = true;
      }

      if (hasMatches) {
        // avoid overwriting JS logic inside tags, so do conservative class removal
        mergedAttributes = mergedAttributes.replace(/\s*class=(["'])(?:(?!\1).)*\1/gi, '');
        const uniqueClasses = [...new Set(classes)].join(' ');
        mergedAttributes = ` class="${uniqueClasses}"` + mergedAttributes;
        return `<${tagName}${mergedAttributes}>`;
      }
      return fullTag;
    });
  }

  fs.writeFileSync(filePath, newContent, 'utf8');
}

if (generatedCss) {
  fs.appendFileSync(cssPath, generatedCss, 'utf8');
  console.log('Cleanup step 2 complete. Extracted new styles.');
} else {
  console.log('No new styles extracted.');
}
