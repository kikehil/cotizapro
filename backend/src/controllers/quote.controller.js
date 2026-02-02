const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { generatePDF } = require('../services/pdf.service');
const { sendEmail } = require('../services/email.service');
const { quoteTemplate } = require('../pdf/quote.template');
const { reportTemplate } = require('../pdf/report.template');
const path = require('path');
const fs = require('fs');

const generateFolio = async () => {
  const lastQuote = await prisma.quote.findFirst({
    orderBy: { id: 'desc' }
  });
  
  if (!lastQuote) return 'Q-0001';
  
  const lastNumber = parseInt(lastQuote.folio.split('-')[1]);
  const newNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `Q-${newNumber}`;
};

const getQuotes = async (req, res, next) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: {
        cliente: true,
        invoices: true,
        creado_por: { select: { nombre: true } }
      },
      orderBy: { fecha: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    next(error);
  }
};

const getQuoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        items: true,
        payments: true,
        invoices: true,
        events: {
          include: { user: { select: { nombre: true } } },
          orderBy: { fecha: 'desc' }
        },
        creado_por: { select: { nombre: true } }
      }
    });

    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (error) {
    next(error);
  }
};

const createQuote = async (req, res, next) => {
  try {
    const { items, ...quoteData } = req.body;
    const folio = await generateFolio();

    const quote = await prisma.quote.create({
      data: {
        ...quoteData,
        folio,
        creado_por_id: req.user.id,
        items: {
          create: items
        },
        events: {
          create: {
            descripcion_evento: 'Cotización creada',
            usuario_id: req.user.id
          }
        }
      },
      include: { items: true }
    });

    res.status(201).json(quote);
  } catch (error) {
    next(error);
  }
};

const updateQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, ...quoteData } = req.body;

    await prisma.quoteItem.deleteMany({ where: { cotizacion_id: parseInt(id) } });

    const quote = await prisma.quote.update({
      where: { id: parseInt(id) },
      data: {
        ...quoteData,
        items: {
          create: items
        },
        events: {
          create: {
            descripcion_evento: 'Cotización actualizada',
            usuario_id: req.user.id
          }
        }
      },
      include: { items: true }
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
};

const updateQuoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const data = { estado };
    if (estado === 'Aceptada') data.fecha_aceptacion = new Date();
    if (estado === 'Rechazada') data.fecha_rechazo = new Date();

    const quote = await prisma.quote.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        events: {
          create: {
            descripcion_evento: `Estado cambiado a ${estado}`,
            usuario_id: req.user.id
          }
        }
      }
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
};

const duplicateQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const original = await prisma.quote.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });

    if (!original) return res.status(404).json({ message: 'Original quote not found' });

    const folio = await generateFolio();
    const { id: _, folio: __, events: ___, payments: ____, invoices: _____, ...rest } = original;

    const items = original.items.map(({ id: _, cotizacion_id: __, ...itemRest }) => itemRest);

    const duplicated = await prisma.quote.create({
      data: {
        ...rest,
        folio,
        estado: 'Pendiente',
        fecha: new Date(),
        fecha_aceptacion: null,
        fecha_rechazo: null,
        fecha_envio: null,
        creado_por_id: req.user.id,
        items: {
          create: items
        },
        events: {
          create: {
            descripcion_evento: `Duplicada de la cotización ${original.folio}`,
            usuario_id: req.user.id
          }
        }
      },
      include: { items: true }
    });

    res.status(201).json(duplicated);
  } catch (error) {
    next(error);
  }
};

const generateQuotePDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: true, items: true }
    });

    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    const company = await prisma.companyConfig.findFirst() || {
      nombre_empresa: 'Tu Empresa S.A. de C.V.',
      direccion: 'Ciudad de México',
      rfc: 'ABC123456789',
      email: 'contacto@tuempresa.com',
      telefono: '55 1234 5678'
    };

    // Convertir logo a Base64 para el PDF
    let logoBase64 = null;
    try {
      const logoPath = path.join(__dirname, '../../../frontend/public/img/logo.png');
      if (fs.existsSync(logoPath)) {
        const bitmap = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
      }
    } catch (e) { console.error('Error al procesar logo:', e); }

    const htmlContent = quoteTemplate(quote, { ...company, logoBase64 });
    const outputPath = path.join(__dirname, `../../uploads/pdfs/${quote.folio}.pdf`);
    
    await generatePDF(htmlContent, outputPath);
    
    res.download(outputPath);
  } catch (error) {
    next(error);
  }
};

const sendQuoteEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: true, items: true }
    });

    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    if (!quote.cliente.email) {
      return res.status(400).json({ message: 'El cliente no tiene un correo electrónico registrado' });
    }

    const company = await prisma.companyConfig.findFirst() || {
      nombre_empresa: 'Tu Empresa S.A. de C.V.',
      email: 'contacto@tuempresa.com'
    };

    // Convertir logo a Base64 para el PDF del correo
    let logoBase64 = null;
    try {
      const logoPath = path.join(__dirname, '../../../frontend/public/img/logo.png');
      if (fs.existsSync(logoPath)) {
        const bitmap = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
      }
    } catch (e) { console.error('Error al procesar logo para correo:', e); }

    const htmlContent = quoteTemplate(quote, { ...company, logoBase64 });
    const outputPath = path.join(__dirname, `../../uploads/pdfs/${quote.folio}.pdf`);
    
    try {
      console.log('Generando PDF para el adjunto del correo...');
      await generatePDF(htmlContent, outputPath);
    } catch (pdfError) {
      console.error('Error al generar PDF para correo:', pdfError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al generar el PDF de la cotización', 
        error: pdfError.message 
      });
    }

    try {
      console.log('Enviando correo con Nodemailer...');
      await sendEmail({
        to: quote.cliente.email,
        subject: `Cotización ${quote.folio} - ${company.nombre_empresa}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #2563eb;">Hola ${quote.cliente.nombre},</h2>
            <p>Adjuntamos la cotización <strong>${quote.folio}</strong> que solicitaste.</p>
            <p>Puedes revisarla y aceptarla en línea haciendo clic en el siguiente enlace:</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.APP_URL}/cotizacion/${quote.id}/public" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                 Ver y Aceptar Cotización
              </a>
            </div>
            <p>Quedamos a tus órdenes.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">${company.nombre_empresa}</p>
          </div>
        `,
        attachments: [{ filename: `${quote.folio}.pdf`, path: outputPath }]
      });
    } catch (emailError) {
      console.error('Error al enviar correo via SMTP:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al enviar el correo electrónico (SMTP)', 
        error: emailError.message 
      });
    }

    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        estado: 'Enviada',
        fecha_envio: new Date(),
        events: {
          create: {
            descripcion_evento: 'Cotización enviada por correo',
            usuario_id: req.user ? req.user.id : null
          }
        }
      }
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error detallado en sendQuoteEmail:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Error al procesar el envío del correo', 
        error: error.message 
      });
    }
  }
};

const getPublicQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: true, items: true }
    });

    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    const company = await prisma.companyConfig.findFirst() || {
      nombre_empresa: 'Tu Empresa S.A. de C.V.',
      direccion: 'Ciudad de México',
      rfc: 'ABC123456789',
      email: 'contacto@tuempresa.com',
      telefono: '55 1234 5678'
    };

    res.json({ quote, company });
  } catch (error) {
    next(error);
  }
};

const acceptPublicQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    const quote = await prisma.quote.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'Aceptada',
        fecha_aceptacion: new Date(),
        events: {
          create: {
            descripcion_evento: `Cotización aceptada por el cliente. Comentarios: ${comentarios || 'Ninguno'}`,
          }
        }
      }
    });

    res.json({ message: 'Cotización aceptada. ¡Gracias!' });
  } catch (error) {
    next(error);
  }
};

const rejectPublicQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    const quote = await prisma.quote.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'Rechazada',
        fecha_rechazo: new Date(),
        events: {
          create: {
            descripcion_evento: `Cotización rechazada por el cliente. Motivo: ${comentarios || 'No especificado'}`,
          }
        }
      }
    });

    res.json({ message: 'Cotización rechazada.' });
  } catch (error) {
    next(error);
  }
};

const uploadOC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { oc_numero } = req.body;

    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(id) }
    });

    if (!quote) return res.status(404).json({ message: 'Cotización no encontrada' });

    const data = { oc_numero };

    if (req.file) {
      data.oc_url = `/uploads/ocs/${req.file.filename}`;
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: parseInt(id) },
      data,
      include: { cliente: true }
    });

    // Crear evento
    await prisma.quoteEvent.create({
      data: {
        cotizacion_id: parseInt(id),
        usuario_id: req.user.id,
        descripcion_evento: `Orden de Compra ${oc_numero} cargada`
      }
    });

    res.json(updatedQuote);
  } catch (error) {
    next(error);
  }
};

const generateStatusReportPDF = async (req, res, next) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: { 
        cliente: true,
        invoices: true
      },
      orderBy: { fecha: 'desc' }
    });

    const company = await prisma.companyConfig.findFirst() || {
      nombre_empresa: 'Tu Empresa S.A. de C.V.',
      direccion: 'Ciudad de México',
      rfc: 'ABC123456789',
      email: 'contacto@tuempresa.com',
      telefono: '55 1234 5678'
    };

    // Convertir logo a Base64 para el PDF
    let logoBase64 = null;
    try {
      const logoPath = path.join(__dirname, '../../../frontend/public/img/logo.png');
      if (fs.existsSync(logoPath)) {
        const bitmap = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
      }
    } catch (e) { console.error('Error al procesar logo para reporte:', e); }

    const htmlContent = reportTemplate(quotes, { ...company, logoBase64 });
    const outputPath = path.join(__dirname, `../../uploads/pdfs/reporte-cotizaciones.pdf`);
    
    await generatePDF(htmlContent, outputPath);
    
    res.download(outputPath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  duplicateQuote,
  generateQuotePDF,
  generateStatusReportPDF,
  sendQuoteEmail,
  getPublicQuote,
  acceptPublicQuote,
  rejectPublicQuote,
  uploadOC
};


