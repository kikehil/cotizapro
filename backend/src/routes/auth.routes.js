const express = require('express');
const { register, login, refresh, getUsers, updateUser, deleteUser } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// User management (protected)
router.get('/users', protect, getUsers);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;







