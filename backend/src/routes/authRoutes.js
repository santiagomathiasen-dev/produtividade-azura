import bcrypt from 'bcrypt';
import express from 'express';
import { prisma } from '../prisma.js';
import {
  sha256,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../services/tokenService.js';

const router = express.Router();

function buildTokenPayload(user) {
  return {
    sub: user.id,
    tenant_id: user.tenant_id,
    role: user.role
  };
}

router.post('/login', async (req, res) => {
  const { email, password, tenant_id } = req.body;

  if (!email || !password || !tenant_id) {
    return res.status(400).json({ message: 'email, password e tenant_id são obrigatórios.' });
  }

  const user = await prisma.users.findFirst({
    where: {
      email,
      tenant_id
    }
  });

  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refresh_tokens.create({
    data: {
      user_id: user.id,
      token_hash: sha256(refreshToken),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return res.json({ access_token: accessToken, refresh_token: refreshToken });
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ message: 'refresh_token é obrigatório.' });
  }

  try {
    const decoded = verifyRefreshToken(refresh_token);
    const tokenHash = sha256(refresh_token);

    const tokenRecord = await prisma.refresh_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        user_id: decoded.sub,
        expires_at: { gt: new Date() }
      },
      include: {
        user: true
      }
    });

    if (!tokenRecord) {
      return res.status(401).json({ message: 'Refresh token inválido.' });
    }

    const payload = buildTokenPayload(tokenRecord.user);
    const accessToken = signAccessToken(payload);

    return res.json({ access_token: accessToken });
  } catch {
    return res.status(401).json({ message: 'Refresh token inválido.' });
  }
});

export { router as authRoutes };
