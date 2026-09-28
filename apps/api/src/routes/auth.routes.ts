import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth';
import { UserRole } from '@bus/shared';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { branch: true }
    });

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName,
      branchId: user.branchId || undefined
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch ? user.branch.nameEn : null,
        branchNameAm: user.branch ? user.branch.nameAm : null
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register (Passenger registration)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, nationalId } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : '+251 91 122 3344',
        nationalId: nationalId ? nationalId.trim() : 'ET-9912048123',
        role: 'PASSENGER',
        roles: ['PASSENGER'],
        permissions: ['PASSENGER_PORTAL'],
        active: true,
        status: 'ACTIVE'
      }
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: 'PASSENGER' as UserRole,
      fullName: newUser.fullName
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { branch: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      branch: user.branch
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
