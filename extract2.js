const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'public');
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

let mergeCount = 0;

for (const filePath of filesToProcess) {
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // A crude regex to merge duplicate classes on the exact same HTML element tag
  // Example: <div class="a" class="b"> -> <div class="a b">
  // Since we replaced style="..." with class="iv-style-X", these are often on elements that already had a class.
  // Wait, regex for duplicate properties in tags is tricky: <tagName ... class="foo" ... class="iv-style-10" ... >
  // Let's iterate all tags manually.
  
  let newContent = content.replace(/<[a-zA-Z0-9\-]+(?:[^>]*?)>/g, (tagMatch) => {
    const classRegex = /class=["']([^"']*)["']/gi;
    let combinedClasses = '';
    let matches = [];
    let match;
    while ((match = classRegex.exec(tagMatch)) !== null) {
      matches.push(match);
      combinedClasses += match[1] + ' ';
    }
    
    if (matches.length > 1) {
      mergeCount++;
      // remove all class occurrences from the tag
      let cleanTag = tagMatch.replace(/class=["'][^"']*["']/gi, '').replace(/\s+>/, '>');
      
      // Inject the combined class back into the clean tag right after the tagName
      combinedClasses = combinedClasses.trim().replace(/\s+/g, ' ');
      // Regex to insert right after the first space or before the closing bracket if no space
      let finalTag = cleanTag.replace(/<([a-zA-Z0-9\-]+)/, `<$1 class="${combinedClasses}"`);
      return finalTag;
    }
    return tagMatch;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

console.log('Merged ' + mergeCount + ' elements with duplicate classes.');
