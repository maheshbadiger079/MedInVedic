const express = require('express');
const db      = require('../database');
const { requireAdmin } = require('../middleware/auth');
const router  = express.Router();

// GET /api/products
router.get('/', (req, res) => {
  const { tag, category, q, limit = 50 } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const p = [];
  if (tag)      { sql += ' AND tag = ?';      p.push(tag); }
  if (category) { sql += ' AND category = ?'; p.push(category); }
  if (q) {
    sql += ' AND (name LIKE ? OR keywords LIKE ? OR description LIKE ?)';
    p.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ' LIMIT ?';
  p.push(parseInt(limit));
  res.json(db.all(sql, p));
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const p = db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

// POST /api/products (admin)
router.post('/', requireAdmin, (req, res) => {
  const { name, category, tag, price, emoji, description, keywords, stock } = req.body;
  if (!name || !category || !tag || !price)
    return res.status(400).json({ error: 'name, category, tag, price required.' });
  const id = db.insert(
    'INSERT INTO products (name,category,tag,price,emoji,description,keywords,stock) VALUES (?,?,?,?,?,?,?,?)',
    [name, category, tag, price, emoji || '💊', description || '', keywords || '', stock || 100]
  );
  res.json({ success: true, id });
});

// PUT /api/products/:id (admin)
router.put('/:id', requireAdmin, (req, res) => {
  const { name, category, tag, price, emoji, description, keywords, stock } = req.body;
  db.run('UPDATE products SET name=?,category=?,tag=?,price=?,emoji=?,description=?,keywords=?,stock=? WHERE id=?',
    [name, category, tag, price, emoji, description, keywords, stock, req.params.id]);
  res.json({ success: true });
});

// DELETE /api/products/:id (admin)
router.delete('/:id', requireAdmin, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', (req, res) => {
  const reviews = db.all(`
    SELECT r.*, u.name as user_name FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 20
  `, [req.params.id]);
  res.json(reviews);
});

module.exports = router;
