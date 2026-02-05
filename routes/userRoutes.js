// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/sync', userController.syncUser);
router.get('/', userController.getAllUsers);
router.put('/:id/role', userController.updateUserRole);

module.exports = router;