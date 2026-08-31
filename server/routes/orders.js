const express = require('express');
const db      = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router  = express.Router();

// POST /api/orders
router.post('/', requireAuth, (req, res) => {
  const { items, total_amount, address, payment_id } = req.body;
  if (!items || !items.length || !total_amount)
    return res.status(400).json({ error: 'items and total_amount required.' });

  const orderId = 'ORD' + Date.now();
  const id = db.insert(
    'INSERT INTO orders (order_id,user_id,items,total_amount,payment_id,address) VALUES (?,?,?,?,?,?)',
    [orderId, req.user.id, JSON.stringify(items), total_amount, payment_id || 'demo', JSON.stringify(address || {})]
  );
  db.run('UPDATE users SET orders_count = orders_count + 1 WHERE id = ?', [req.user.id]);
  db.run('INSERT INTO notifications (user_id,title,body,type) VALUES (?,?,?,?)',
    [req.user.id, `✅ Order Placed — #${orderId}`, `Your order for ₹${total_amount} is confirmed.`, 'order']);
  res.json({ success: true, orderId, id });
});

// GET /api/orders/my
router.get('/my', requireAuth, (req, res) => {
  const orders = db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.user.id]);
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address) })));
});

// GET /api/orders/:id
router.get('/:id', requireAuth, (req, res) => {
  const o = db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!o) return res.status(404).json({ error: 'Order not found.' });
  res.json({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address) });
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', requireAuth, (req, res) => {
  const o = db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!o) return res.status(404).json({ error: 'Order not found.' });
  if (['Shipped', 'Delivered'].includes(o.status))
    return res.status(400).json({ error: 'Cannot cancel at this stage.' });
  db.run("UPDATE orders SET status='Cancelled', updated_at=datetime('now') WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

// GET /api/orders (admin: all)
router.get('/', requireAdmin, (req, res) => {
  const orders = db.all(`
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC LIMIT 100
  `, []);
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), address: JSON.parse(o.address) })));
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const valid = ['Processing','Confirmed','Packed','Shipped','Out for Delivery','Delivered','Cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  const o = db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!o) return res.status(404).json({ error: 'Order not found.' });
  db.run("UPDATE orders SET status=?, updated_at=datetime('now') WHERE id=?", [status, req.params.id]);
  db.run('INSERT INTO notifications (user_id,title,body,type) VALUES (?,?,?,?)',
    [o.user_id, `📦 Order ${status}`, `Your order #${o.order_id} is now ${status}.`, 'order_update']);
  res.json({ success: true });
});

module.exports = router;
