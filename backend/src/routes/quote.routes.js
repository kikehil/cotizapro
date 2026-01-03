const express = require('express');
const { 
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
  rejectPublicQuote
} = require('../controllers/quote.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

// Public routes
router.get('/:id/public', getPublicQuote);
router.post('/:id/aceptar', acceptPublicQuote);
router.post('/:id/rechazar', rejectPublicQuote);

router.use(protect);

router.route('/')
  .get(getQuotes)
  .post(createQuote);

router.get('/reporte/estados', generateStatusReportPDF);

router.route('/:id')
  .get(getQuoteById)
  .put(updateQuote);

router.post('/:id/duplicar', duplicateQuote);
router.put('/:id/estado', updateQuoteStatus);
router.post('/:id/enviar-correo', sendQuoteEmail);
router.get('/:id/pdf', generateQuotePDF);

module.exports = router;

