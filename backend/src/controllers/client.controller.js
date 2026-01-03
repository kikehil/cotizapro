const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getClients = async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { fecha_alta: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    const client = await prisma.client.create({
      data: req.body
    });
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Client deleted' });
  } catch (error) {
    next(error);
  }
};

const getClientQuotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotes = await prisma.quote.findMany({
      where: { cliente_id: parseInt(id) },
      include: {
        items: true
      },
      orderBy: { fecha: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientQuotes
};







