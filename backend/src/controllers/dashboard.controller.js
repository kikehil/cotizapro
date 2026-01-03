const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSummary = async (req, res, next) => {
  try {
    const [
      totalQuotes,
      acceptedQuotes,
      totalRevenue,
      pendingQuotes
    ] = await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { estado: 'Aceptada' } }),
      prisma.quote.aggregate({
        _sum: { total: true },
        where: { estado: 'Aceptada' }
      }),
      prisma.quote.count({ where: { estado: 'Pendiente' } })
    ]);

    const latestQuotes = await prisma.quote.findMany({
      take: 5,
      include: { cliente: true },
      orderBy: { fecha: 'desc' }
    });

    const quotesByStatus = await prisma.quote.groupBy({
      by: ['estado'],
      _count: true
    });

    res.json({
      summary: {
        totalQuotes,
        acceptedQuotes,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingQuotes
      },
      latestQuotes,
      quotesByStatus
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlyQuotes = async (req, res, next) => {
  try {
    // This is a bit complex in Prisma for MySQL without raw queries 
    // for grouping by month. For now, we'll return last 12 months data
    // in a simplified way or use a raw query.
    
    const last12Months = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(total) as total
      FROM Quote
      WHERE fecha >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `;

    res.json(last12Months);
  } catch (error) {
    next(error);
  }
};

const getTopClients = async (req, res, next) => {
  try {
    const topClients = await prisma.quote.groupBy({
      by: ['cliente_id'],
      _sum: { total: true },
      _count: true,
      orderBy: {
        _sum: { total: 'desc' }
      },
      take: 5
    });

    // Fetch client names
    const clientsWithNames = await Promise.all(
      topClients.map(async (item) => {
        const client = await prisma.client.findUnique({
          where: { id: item.cliente_id },
          select: { nombre: true }
        });
        return {
          ...item,
          nombre: client ? client.nombre : 'Desconocido'
        };
      })
    );

    res.json(clientsWithNames);
  } catch (error) {
    next(error);
  }
};

const getPendingInvoices = async (req, res, next) => {
  try {
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        estatus: 'Pendiente'
      },
      include: {
        quote: {
          include: {
            cliente: true
          }
        }
      },
      orderBy: {
        fecha_factura: 'desc'
      },
      take: 5
    });

    res.json(pendingInvoices);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getMonthlyQuotes,
  getTopClients,
  getPendingInvoices
};


