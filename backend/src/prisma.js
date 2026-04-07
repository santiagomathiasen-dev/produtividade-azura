import { PrismaClient } from '@prisma/client';
import { getRequestContext } from './context/requestContext.js';

const prisma = new PrismaClient();

const DOMAIN_MODELS = new Set(['users']);
const ACTIONS_REQUIRE_WHERE = new Set(['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'updateMany', 'update', 'deleteMany', 'delete']);

function assertTenantId() {
  const context = getRequestContext();
  const tenantId = context?.tenantId;

  if (!tenantId) {
    throw new Error('tenant_id is required in request context.');
  }

  return tenantId;
}

prisma.$use(async (params, next) => {
  if (!DOMAIN_MODELS.has(params.model)) {
    return next(params);
  }

  const tenantId = assertTenantId();

  if (ACTIONS_REQUIRE_WHERE.has(params.action)) {
    params.args = params.args || {};

    if (params.action === 'findUnique') {
      params.action = 'findFirst';
    }

    params.args.where = {
      ...(params.args.where || {}),
      tenant_id: tenantId
    };
  }

  if (params.action === 'create') {
    params.args = params.args || {};
    params.args.data = {
      ...(params.args.data || {}),
      tenant_id: tenantId
    };
  }

  if (params.action === 'createMany') {
    params.args = params.args || {};
    const data = Array.isArray(params.args.data) ? params.args.data : [];
    params.args.data = data.map((item) => ({ ...item, tenant_id: tenantId }));
  }

  return next(params);
});

export { prisma };
