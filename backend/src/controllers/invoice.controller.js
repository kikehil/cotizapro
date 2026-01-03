const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

const createOrUpdateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params; // cotizacion_id
    const { numero_factura, estatus } = req.body;
    
    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(id) }
    });

    if (!quote) return res.status(404).json({ message: 'Cotización no encontrada' });
    if (quote.estado !== 'Aceptada') {
      return res.status(400).json({ message: 'Solo se pueden facturar cotizaciones aceptadas' });
    }

    const data = {
      numero_factura,
      estatus: estatus || 'Pendiente',
      cotizacion_id: parseInt(id)
    };

    if (req.files) {
      if (req.files.pdf) {
        data.pdf_url = `/uploads/facturas/${req.files.pdf[0].filename}`;
      }
      if (req.files.xml) {
        data.xml_url = `/uploads/facturas/${req.files.xml[0].filename}`;
      }
    }

    const invoice = await prisma.invoice.upsert({
      where: { cotizacion_id: parseInt(id) },
      update: data,
      create: data
    });

    // Create event
    await prisma.quoteEvent.create({
      data: {
        cotizacion_id: parseInt(id),
        usuario_id: req.user.id,
        descripcion_evento: `Factura ${numero_factura} asignada - Estado: ${estatus}`
      }
    });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

const getInvoiceByQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { cotizacion_id: parseInt(id) }
    });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateInvoice,
  getInvoiceByQuote
};






