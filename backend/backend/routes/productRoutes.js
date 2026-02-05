const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Existing routes
router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);

// NEW Sensor-specific routes
router.get('/sensors', productController.getSensorProducts);
router.patch('/:productId/add-sensor', productController.addSensorToProduct);
router.post('/sensor/:sensorId/data', productController.updateSensorData);

module.exports = router;