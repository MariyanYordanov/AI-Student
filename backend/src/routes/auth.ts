import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateToken, authMiddleware, requireAuth } from '../middleware/auth';
import { EmailService } from '../services/email.service';
import { randomBytes } from 'crypto';
import { checkRateLimit, getRateLimitInfo } from '../middleware/rate-limiter';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    console.log('[LOG] Registration attempt:', { email, name, passwordLength: password?.length });

    // Validate input
    if (!email || !name || !password) {
      console.log('[ERR] Validation failed: missing fields');
      res.status(400).json({ error: 'Email, name, and password are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[ERR] Email validation failed: invalid format');
      res.status(400).json({ error: 'Please provide a valid email address' });
      return;
    }

    if (password.length < 6) {
      console.log('[ERR] Password too short');
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('[ERR] User already exists:', email);
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    console.log('[OK] Validation passed, hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Check if this is the first user (should be SUPERADMIN)
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;
    const userRole = isFirstUser ? 'SUPERADMIN' : 'STUDENT';

    if (isFirstUser) {
      console.log('[OK] First user detected - creating as SUPERADMIN');
    }

    // Create user
    console.log('[OK] Creating user in database...');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: userRole,
        verificationToken,
        verificationTokenExpiry,
        emailVerified: false,
      },
    });

    console.log(`[OK] User created: ${user.id} (role: ${user.role})`);

    // Create default AilyInstance for new user
    try {
      console.log('[OK] Creating default AilyInstance for user...');
      const defaultPersonality = {
        curiosity: 0.7,
        confusionRate: 0.5,
        learningSpeed: 0.6,
      };

      await prisma.ailyInstance.create({
        data: {
          userId: user.id,
          currentCharacterId: 'curious-explorer',
          level: 0,
          totalXP: 0,
          personalityTraits: JSON.stringify(defaultPersonality),
        },
      });
      console.log('[OK] Default AilyInstance created');
    } catch (ailyError) {
      console.error('[ERR] Failed to create default AilyInstance:', ailyError);
      // Don't fail registration if AilyInstance creation fails
    }

    // Send verification email
    try {
      console.log('[OK] Sending verification email...');
      await EmailService.sendVerificationEmail(email, name, verificationToken);
      console.log('[OK] Verification email sent');
    } catch (emailError) {
      console.error('[ERR] Error sending verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    console.log('[OK] Registration successful');
    // DO NOT generate token for unverified users
    // User must verify email first before they can login

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('[ERR] Registration error:', error);
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      console.log('[ERR] Login blocked: email not verified -', email);
      res.status(403).json({
        error: 'Email not verified',
        message: 'Моля потвърди имейл адреса си преди да се логнеш. Провери своя inbox за верификационния линк.',
        requiresVerification: true
      });
      return;
    }

    // Update last active time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      token,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires auth)
 */
router.get('/me', authMiddleware, requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (frontend should delete token)
 */
router.post('/logout', authMiddleware, (_req, res) => {
  res.json({ message: 'Logged out successfully. Please delete the token from client storage.' });
});

/**
 * POST /api/auth/verify-email
 * Verify user email with token (sent in request body)
 * This is more secure than GET with token in URL
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Verification token is required' });
      return;
    }

    console.log('[VERIFY] Verifying email with token:', token.substring(0, 20) + '...');

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      console.log('[ERR] Token not found in database');
      res.status(404).json({ error: 'Invalid or expired verification token' });
      return;
    }

    console.log('[VERIFY] Found user:', user.email, 'Current emailVerified:', user.emailVerified);

    // Check if token has expired
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      console.log('[ERR] Token expired for:', user.email);
      res.status(400).json({ error: 'Verification token has expired' });
      return;
    }

    console.log('[VERIFY] Token valid, updating database...');

    // Mark email as verified and clear token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    console.log('[OK] Email verified successfully:', updatedUser.email, 'New emailVerified:', updatedUser.emailVerified);

    // Generate JWT token for auto-login
    const jwtToken = generateToken(updatedUser.id, updatedUser.email, updatedUser.role);

    res.json({
      message: 'Email verified successfully!',
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      token: jwtToken,
    });
  } catch (error) {
    console.error('[ERR] Verification error:', error);
    next(error);
  }
});

/**
 * GET /api/auth/verify-email/:token
 * Verify user email with token (legacy - deprecated)
 */
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ error: 'Verification token is required' });
      return;
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      res.status(404).json({ error: 'Invalid or expired verification token' });
      return;
    }

    // Check if token has expired
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      res.status(400).json({ error: 'Verification token has expired' });
      return;
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    res.json({
      message: 'Email verified successfully!',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/change-unverified-email
 * Allow user to change email before email verification
 * Only for unverified accounts
 */
router.post('/change-unverified-email', async (req, res, next) => {
  try {
    const { currentEmail, newEmail } = req.body;

    if (!currentEmail || !newEmail) {
      res.status(400).json({ error: 'Current email and new email are required' });
      return;
    }

    if (currentEmail === newEmail) {
      res.status(400).json({ error: 'New email must be different from current email' });
      return;
    }

    // Validate new email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address' });
      return;
    }

    // Find user with current email
    const user = await prisma.user.findUnique({
      where: { email: currentEmail },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if email is already verified
    if (user.emailVerified) {
      res.status(400).json({ error: 'Cannot change email for verified accounts. Contact support.' });
      return;
    }

    // Check if new email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      res.status(400).json({ error: 'This email is already registered' });
      return;
    }

    // Generate new verification token
    const newVerificationToken = randomBytes(32).toString('hex');
    const newVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new email and token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newEmail,
        verificationToken: newVerificationToken,
        verificationTokenExpiry: newVerificationTokenExpiry,
      },
    });

    // Send verification email to new address
    try {
      console.log('[OK] Sending verification email to new address...');
      await EmailService.sendVerificationEmail(newEmail, user.name, newVerificationToken);
      console.log('[OK] Verification email sent to new address');
      res.json({
        message: 'Email has been changed. Please check your new email for a verification link.',
        newEmail,
      });
    } catch (emailError) {
      console.error('[ERR] Error sending verification email:', emailError);
      res.status(500).json({ error: 'Email change failed. Please try again later.' });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/resend-verification-email
 * Resend verification email to user
 */
router.post('/resend-verification-email', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check rate limit
    if (!checkRateLimit(email)) {
      const limitInfo = getRateLimitInfo(email);
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: limitInfo.resetTime,
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      res.status(200).json({
        message: 'If an account exists with this email, a verification link will be sent.'
      });
      return;
    }

    // Check if email is already verified
    if (user.emailVerified) {
      res.status(400).json({ error: 'Email is already verified' });
      return;
    }

    // Generate new verification token
    const newVerificationToken = randomBytes(32).toString('hex');
    const newVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: newVerificationToken,
        verificationTokenExpiry: newVerificationTokenExpiry,
      },
    });

    // Send verification email
    try {
      console.log('[OK] Resending verification email...');
      await EmailService.sendVerificationEmail(email, user.name, newVerificationToken);
      console.log('[OK] Verification email resent');
      res.json({
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } catch (emailError) {
      console.error('[ERR] Error resending verification email:', emailError);
      res.status(500).json({ error: 'Failed to send verification email. Please try again later.' });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user info with preferences
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        preferredTheme: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/auth/preferences
 * Update user theme and language preferences
 */
router.patch('/preferences', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const { preferredTheme, preferredLanguage } = req.body;

    // Validate inputs
    if (preferredTheme && !['light', 'dark'].includes(preferredTheme)) {
      res.status(400).json({ error: 'Invalid theme. Must be "light" or "dark"' });
      return;
    }

    if (preferredLanguage && !['en', 'bg'].includes(preferredLanguage)) {
      res.status(400).json({ error: 'Invalid language. Must be "en" or "bg"' });
      return;
    }

    const updateData: any = {};
    if (preferredTheme) updateData.preferredTheme = preferredTheme;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No preferences to update' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        preferredTheme: true,
        preferredLanguage: true,
      },
    });

    console.log('[OK] User preferences updated:', userId);
    res.json({
      message: 'Preferences updated successfully',
      user,
    });
  } catch (error) {
    console.error('[ERR] Error updating preferences:', error);
    next(error);
  }
});

export { router as authRouter };
