const express = require('express');
const { getClients, createClient, updateClient, deleteClient, getClientQuotes } = require('../controllers/client.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(getClients)
  .post(createClient);

router.route('/:id')
  .put(updateClient)
  .delete(deleteClient);

router.get('/:id/cotizaciones', getClientQuotes);

module.exports = router;







