const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createOrUpdateInvoice, getInvoiceByQuote } = require('../controllers/invoice.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/facturas');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.use(protect);

router.get('/cotizacion/:id', getInvoiceByQuote);
router.post('/cotizacion/:id', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'xml', maxCount: 1 }
]), createOrUpdateInvoice);

module.exports = router;






