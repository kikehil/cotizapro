const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  await prisma.user.upsert({
    where: { email: 'admin@cotizapro.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@cotizapro.com',
      password: hashedPassword,
      rol: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ventas@cotizapro.com' },
    update: {},
    create: {
      nombre: 'Vendedor 1',
      email: 'ventas@cotizapro.com',
      password: hashedPassword,
      rol: 'VENTAS',
    },
  });

  // Clients
  const client1 = await prisma.client.create({
    data: {
      nombre: 'Empresa Alpha S.A.',
      rfc: 'EAL900101ABC',
      email: 'contacto@alpha.com',
      telefono: '55 1122 3344',
      direccion: 'Av. Insurgentes 123, CDMX',
      contacto_principal: 'Juan Pérez'
    }
  });

  const client2 = await prisma.client.create({
    data: {
      nombre: 'Corporativo Beta',
      rfc: 'CBE850505XYZ',
      email: 'info@beta.mx',
      telefono: '55 9988 7766',
      direccion: 'Reforma 456, CDMX',
      contacto_principal: 'Maria García'
    }
  });

  // Products
  await prisma.product.createMany({
    data: [
      { nombre: 'Servicio de Consultoría', descripcion: 'Consultoría empresarial por hora', unidad: 'HORA', precio_unitario: 1500, categoria: 'Servicios' },
      { nombre: 'Licencia Software Pro', descripcion: 'Suscripción anual', unidad: 'AÑO', precio_unitario: 12000, categoria: 'Software' },
      { nombre: 'Mantenimiento Preventivo', descripcion: 'Revisión técnica trimestral', unidad: 'SERV', precio_unitario: 3500, categoria: 'Servicios' },
      { nombre: 'Kit de Oficina', descripcion: 'Pack básico de papelería', unidad: 'KIT', precio_unitario: 850, categoria: 'Productos' },
    ]
  });

  // Company Config
  await prisma.companyConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre_empresa: 'CotizaPro Solutions',
      rfc: 'CPS101010ABC',
      telefono: '55 5555 4444',
      email: 'contacto@cotizapro.com',
      direccion: 'Tecnología 789, Ciudad de México'
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });







