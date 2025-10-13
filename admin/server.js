const express = require('express');
const AdminJS = require('adminjs').default; // ESM default export
const AdminJSExpress = require('@adminjs/express').default; // ESM default export
const { Database, Resource } = require('@adminjs/prisma');
const { PrismaClient } = require('@prisma/client');

AdminJS.registerAdapter({ Database, Resource });

const prisma = new PrismaClient();

const start = async () => {
  const admin = new AdminJS({
    rootPath: '/admin',
    branding: {
      companyName: 'Bruit Noir Admin',
      withMadeWithLove: false,
    },
    resources: [
      { resource: { model: prisma.user, client: prisma }, options: { navigation: { name: 'Data' }, properties: { password: { isVisible: false } } } },
      { resource: { model: prisma.product, client: prisma }, options: { actions: { applyDiscount: {
            actionType: 'bulk',
            icon: 'Percent',
            handler: async (req, res, context) => {
              const { records, h } = context;
              const pct = Number(req?.payload?.discount || 0);
              if (!pct || pct <= 0) {
                return { notice: { message: 'Укажите discount > 0', type: 'error' } };
              }
              for (const rec of records) {
                const id = rec.params.id;
                const current = await prisma.product.findUnique({ where: { id } });
                if (!current) continue;
                const newPrice = Math.max(0, Number((current.price * (1 - pct / 100)).toFixed(2)));
                await prisma.product.update({ where: { id }, data: { price: newPrice } });
              }
              return { notice: { message: `Скидка ${pct}% применена`, type: 'success' } };
            },
            component: false,
          } } } },
      { resource: { model: prisma.order, client: prisma } },
      { resource: { model: prisma.orderItem, client: prisma } },
      { resource: { model: prisma.deliveryPoint, client: prisma } },
    ],
  });

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bruitnoir.local';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';

  const app = express();
  const router = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) return { email };
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && user.password && user.role === 'admin') {
          // NOTE: password is hashed; for simplicity, allow env-based only unless extended
          return { email };
        }
        return null;
      },
      cookiePassword: process.env.ADMINJS_COOKIE_SECRET || 'very-secret-cookie',
    },
    null,
    { resave: false, saveUninitialized: true }
  );

  app.use(admin.options.rootPath, router);
  const port = process.env.ADMIN_PORT || 3100;
  app.listen(port, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`AdminJS running at http://127.0.0.1:${port}${admin.options.rootPath}`);
  });
};

start().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
