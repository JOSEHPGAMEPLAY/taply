import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      // Update existing user to admin role and password
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { passwordHash, role: 'ADMIN' },
      });
      console.log(`✅ Admin user updated: ${adminEmail}`);
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: 'Administrador',
          role: 'ADMIN',
        },
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
    }
  } else {
    console.log('⏭️  Skipping admin creation (ADMIN_EMAIL/ADMIN_PASSWORD not set)');
  }

  // Default templates for pages
  const templates = [
    {
      name: 'Business Card',
      description: 'Simple digital business card with contact buttons',
      config: {
        theme: 'minimal',
        layout: 'centered',
        backgroundColor: '#ffffff',
        accentColor: '#000000',
      },
      version: '1.0.0',
    },
    {
      name: 'Restaurant Menu',
      description: 'Digital menu for restaurants with categories and items',
      config: {
        theme: 'elegant',
        layout: 'grid',
        backgroundColor: '#1a1a1a',
        accentColor: '#d4af37',
      },
      version: '1.0.0',
    },
    {
      name: 'Event Landing',
      description: 'Landing page for events with details and registration',
      config: {
        theme: 'modern',
        layout: 'fullwidth',
        backgroundColor: '#f8f9fa',
        accentColor: '#0066cc',
      },
      version: '1.0.0',
    },
    {
      name: 'Portfolio',
      description: 'Personal portfolio showcase with project gallery',
      config: {
        theme: 'creative',
        layout: 'masonry',
        backgroundColor: '#ffffff',
        accentColor: '#6c63ff',
      },
      version: '1.0.0',
    },
    {
      name: 'Product Showcase',
      description: 'Product display page with features and purchase links',
      config: {
        theme: 'clean',
        layout: 'sections',
        backgroundColor: '#fafafa',
        accentColor: '#10b981',
      },
      version: '1.0.0',
    },
  ];

  for (const templateData of templates) {
    const existing = await prisma.template.findFirst({
      where: { name: templateData.name },
    });

    if (existing) {
      console.log(`⏭️  Template already exists: ${templateData.name}`);
      continue;
    }

    await prisma.template.create({
      data: templateData,
    });
    console.log(`✅ Template: ${templateData.name}`);
  }

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
