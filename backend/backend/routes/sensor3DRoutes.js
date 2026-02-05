const express = require('express');
const router = express.Router();
const sensor3DController = require('../controllers/sensor3DController');
const auth = require('../middleware/auth');

router.get('/city-data', auth, sensor3DController.get3DCityData);
router.get('/sensor/:sensorId', auth, sensor3DController.getSensorDetails);

module.exports = router;