import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/auth';
import { EmailService } from '../services/email.service';

const prisma = new PrismaClient();

const router = Router();

/**
 * GET /api/admin/users
 * Get all users (ADMIN or SUPERADMIN only)
 */
router.get('/users', authMiddleware, requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        lastActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    next(error);
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Change user role (SUPERADMIN only)
 */
router.patch('/users/:id/role', authMiddleware, requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['STUDENT', 'ADMIN', 'SUPERADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    console.log(`Role changed for ${user.email} to ${role}`);

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    next(error);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user (ADMIN or SUPERADMIN)
 */
router.delete('/users/:id', authMiddleware, requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (id === userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const user = await prisma.user.delete({
      where: { id },
      select: { email: true, name: true },
    });

    console.log(`User deleted: ${user.email}`);

    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    console.error('Error deleting user:', error);
    next(error);
  }
});

/**
 * POST /api/admin/send-email
 * Send email to user (ADMIN or SUPERADMIN)
 */
router.post('/send-email', authMiddleware, requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, subject, message } = req.body;

    if (!userId || !subject || !message) {
      res.status(400).json({ error: 'userId, subject, and message are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await EmailService.sendCustomEmail(user.email, user.name, subject, message);

    console.log(`Email sent to ${user.email}`);

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    next(error);
  }
});

/**
 * POST /api/admin/admin-request
 * Request admin rights (SUPERADMIN reviews)
 */
router.post('/admin-request', authMiddleware, requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'STUDENT') {
      res.status(400).json({ error: 'Only students can request admin rights' });
      return;
    }

    const message = `
      <p>Потребител ${user.name} (${user.email}) искам да стане админ.</p>
      <p>За да одобриш/отхвърлиш заявката, отидете в админ панела.</p>
    `;

    await EmailService.sendAdminNotification('marsrewq@gmail.com', 'Admin Request', message);

    res.json({ message: 'Admin request sent to superadmin' });
  } catch (error) {
    console.error('Error processing admin request:', error);
    next(error);
  }
});

export default router;
