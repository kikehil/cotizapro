const express = require('express');
const { getSummary, getMonthlyQuotes, getTopClients, getPendingInvoices } = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(protect);

router.get('/resumen', getSummary);
router.get('/cotizaciones-mensuales', getMonthlyQuotes);
router.get('/top-clientes', getTopClients);
router.get('/facturas-pendientes', getPendingInvoices);

module.exports = router;


