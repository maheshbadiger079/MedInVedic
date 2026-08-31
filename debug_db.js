const db = require('./backend/database');
db.all("SELECT DISTINCT category, type FROM products", [], (err, rows) => {
    if (err) console.error(err);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
});
