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
  path.join(baseDir, 'pages', 'register.html')
];

const version = Date.now();

for (const filePath of filesToProcess) {
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/css\/style\.css(\?v=[0-9]+)?/g, `css/style.css?v=${version}`)
    .replace(/js\/api\.js(\?v=[0-9]+)?/g, `js/api.js?v=${version}`)
    .replace(/js\/i18n\.js(\?v=[0-9]+)?/g, `js/i18n.js?v=${version}`)
    .replace(/js\/app\.js(\?v=[0-9]+)?/g, `js/app.js?v=${version}`)
    .replace(/\.\.\/css\/style\.css(\?v=[0-9]+)?/g, `../css/style.css?v=${version}`)
    .replace(/\.\.\/js\/api\.js(\?v=[0-9]+)?/g, `../js/api.js?v=${version}`)
    .replace(/\.\.\/js\/i18n\.js(\?v=[0-9]+)?/g, `../js/i18n.js?v=${version}`)
    .replace(/\.\.\/js\/app\.js(\?v=[0-9]+)?/g, `../js/app.js?v=${version}`);
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated cache busters in ${path.basename(filePath)}`);
  }
}
