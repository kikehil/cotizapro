const express = require('express');
const { getCompany, updateCompany } = require('../controllers/company.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCompany)
  .put(authorize('ADMIN'), updateCompany);

module.exports = router;







