const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'backend', 'medinvedic.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, name, type, category FROM products LIMIT 5", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Products count:", rows.length);
        console.log(JSON.stringify(rows, null, 2));
    }
    db.get("SELECT COUNT(*) as cnt FROM products", (err, row) => {
        console.log("Total products in DB:", row.cnt);
        process.exit(0);
    });
});
