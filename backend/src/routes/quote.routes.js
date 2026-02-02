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
  rejectPublicQuote,
  uploadOC
} = require('../controllers/quote.controller');
const { protect } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer Config for OC
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/ocs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'oc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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
router.post('/:id/oc', upload.single('oc_file'), uploadOC);

module.exports = router;

