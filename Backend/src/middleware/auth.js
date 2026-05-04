import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/** Extract JWT from HttpOnly cookie first, then fall back to Authorization: Bearer (for Postman / tests). */
function extractToken(req) {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);
  return null;
}

export function authRequired(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Authorization required' });
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/** Attaches req.user if a valid token is present (cookie or Bearer), but never rejects. */
export function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, config.jwtSecret);
    } catch {
      // invalid/expired — treat as unauthenticated
    }
  }
  next();
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authorization required' });
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
