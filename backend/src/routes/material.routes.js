const express = require('express');
const { getMaterials, createMaterial, updateMaterial, deleteMaterial } = require('../controllers/material.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMaterials)
  .post(createMaterial);

router.route('/:id')
  .put(updateMaterial)
  .delete(deleteMaterial);

module.exports = router;







