import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Extend Express Request to include user info
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ id: userId, email, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

/**
 * Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

/**
 * Require ADMIN or SUPERADMIN role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

/**
 * Require SUPERADMIN role only
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'SUPERADMIN') {
    res.status(403).json({ error: 'SuperAdmin access required' });
    return;
  }

  next();
}
