const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const productRoutes = require('./routes/product.routes');
const materialRoutes = require('./routes/material.routes');
const quoteRoutes = require('./routes/quote.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const companyRoutes = require('./routes/company.routes');
const invoiceRoutes = require('./routes/invoice.routes');

const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Set up EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../frontend/views'));
app.set('layout', 'layouts/main');

// Frontend Routes
app.get('/', (req, res) => res.render('pages/dashboard'));
app.get('/login', (req, res) => res.render('pages/login', { layout: false }));
app.get('/clientes', (req, res) => res.render('pages/clients'));
app.get('/productos', (req, res) => res.render('pages/products'));
app.get('/cotizaciones', (req, res) => res.render('pages/quotes'));
app.get('/cotizaciones/nueva', (req, res) => res.render('pages/quote-form'));
app.get('/cotizaciones/editar/:id', (req, res) => res.render('pages/quote-form'));
app.get('/cotizaciones/:id', (req, res) => res.render('pages/quote-detail'));
app.get('/cotizacion/:id/public', (req, res) => res.render('pages/public-quote', { layout: false }));
app.get('/config', (req, res) => res.render('pages/config'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/materiales', materialRoutes);
app.use('/api/cotizaciones', quoteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/empresa', companyRoutes);
app.use('/api/facturas', invoiceRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Cotiza API is running' });
});

// Error handling
app.use(errorHandler);

module.exports = app;

