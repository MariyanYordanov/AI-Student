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
    console.log('📝 Registration attempt:', { email, name, passwordLength: password?.length });

    // Validate input
    if (!email || !name || !password) {
      console.log('❌ Validation failed: missing fields');
      res.status(400).json({ error: 'Email, name, and password are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email validation failed: invalid format');
      res.status(400).json({ error: 'Please provide a valid email address' });
      return;
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    console.log('✓ Validation passed, hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    console.log('✓ Creating user in database...');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'STUDENT',
        verificationToken,
        verificationTokenExpiry,
        emailVerified: false,
      },
    });

    console.log('✓ User created:', user.id);

    // Send verification email
    try {
      console.log('✓ Sending verification email...');
      await EmailService.sendVerificationEmail(email, name, verificationToken);
      console.log('✓ Verification email sent');
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    console.log('✓ Registration successful');
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
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
      console.log('❌ Login blocked: email not verified -', email);
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
 * GET /api/auth/verify-email/:token
 * Verify user email with token
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
      console.log('✓ Sending verification email to new address...');
      await EmailService.sendVerificationEmail(newEmail, user.name, newVerificationToken);
      console.log('✓ Verification email sent to new address');
      res.json({
        message: 'Email has been changed. Please check your new email for a verification link.',
        newEmail,
      });
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
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
      console.log('✓ Resending verification email...');
      await EmailService.sendVerificationEmail(email, user.name, newVerificationToken);
      console.log('✓ Verification email resent');
      res.json({
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } catch (emailError) {
      console.error('❌ Error resending verification email:', emailError);
      res.status(500).json({ error: 'Failed to send verification email. Please try again later.' });
    }
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
