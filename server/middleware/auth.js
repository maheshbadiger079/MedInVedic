/**
 * middleware/auth.js — JWT authentication & RBAC middleware
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'medinvedic_jwt_secret_change_in_production';

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;  // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    const role = (req.user.role || '').toLowerCase();
    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(403).json({ error: 'Access Forbidden: Administrator credentials required' });
    }
    next();
  });
}

function requireSuperAdmin(req, res, next) {
  requireAuth(req, res, () => {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Access Forbidden: Super Administrator authorization required' });
    }
    next();
  });
}

function requireDoctorVerifier(req, res, next) {
  requireAuth(req, res, () => {
    const role = (req.user.role || '').toLowerCase();
    if (!['admin', 'super_admin', 'doctor_verifier'].includes(role)) {
      return res.status(403).json({ error: 'Doctor verification permission required' });
    }
    next();
  });
}

function requirePharmacist(req, res, next) {
  requireAuth(req, res, () => {
    const role = (req.user.role || '').toLowerCase();
    if (!['admin', 'super_admin', 'pharmacist'].includes(role)) {
      return res.status(403).json({ error: 'Pharmacist access required' });
    }
    next();
  });
}

module.exports = { 
  requireAuth, 
  requireAdmin, 
  requireSuperAdmin, 
  requireDoctorVerifier, 
  requirePharmacist, 
  JWT_SECRET 
};
