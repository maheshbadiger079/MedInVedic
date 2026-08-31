const fs = require('fs');
const files = [
  'pages/healing-hub.html',
  'pages/herbal-formulator.html',
  'pages/consult.html',
  'pages/categories.html',
  'pages/ai-vision.html',
  'index.html',
  'js/app.js'
];
files.forEach(f => {
  try {
    let p = 'c:/RESUME/MedInVedic/public/' + f;
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/👤 Sign In \/ Account/g, '👤 Sign In');
    fs.writeFileSync(p, text);
    console.log('Updated ' + f);
  } catch (e) {
    console.error('Error on ' + f, e.message);
  }
});
