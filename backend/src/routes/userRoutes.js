import bcrypt from 'bcrypt';
import express from 'express';
import { prisma } from '../prisma.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', async (req, res) => {
  const user = await prisma.users.findFirst({
    where: { id: req.user.id },
    select: { id: true, email: true, role: true, tenant_id: true }
  });

  return res.json(user);
});

router.post('/', authorize('ADMIN'), async (req, res) => {
  const { email, password, role = 'OPERADOR' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email e password são obrigatórios.' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      email,
      password_hash,
      role
    },
    select: { id: true, email: true, role: true, tenant_id: true }
  });

  return res.status(201).json(user);
});

router.get('/', authorize('ADMIN', 'OPERADOR'), async (_req, res) => {
  const users = await prisma.users.findMany({
    select: { id: true, email: true, role: true, tenant_id: true }
  });

  return res.json(users);
});

export { router as userRoutes };
