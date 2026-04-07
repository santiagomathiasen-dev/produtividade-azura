import { verifyAccessToken } from '../services/tokenService.js';
import { runWithRequestContext } from '../context/requestContext.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token ausente.' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      tenant_id: payload.tenant_id,
      role: payload.role
    };

    return runWithRequestContext({ tenantId: payload.tenant_id, userId: payload.sub }, () => next());
  } catch {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    return next();
  };
}
