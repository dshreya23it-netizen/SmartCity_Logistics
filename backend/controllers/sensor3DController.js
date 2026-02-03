const Sensor = require('../models/Sensor');

exports.get3DCityData = async (req, res) => {
  try {
    const cities = await Sensor.aggregate([
      {
        $group: {
          _id: "$cityLocation",
          totalSensors: { $sum: 1 },
          activeSensors: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          sensors: {
            $push: {
              id: "$sensorId",
              name: "$name",
              type: "$sensorType",
              position: "$position",
              data: "$lastReading",
              status: "$status"
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      cities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getSensorDetails = async (req, res) => {
  try {
    const { sensorId } = req.params;
    
    const sensor = await Sensor.findOne({ sensorId })
      .select('sensorId name sensorType status lastReading location sensorData');
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found'
      });
    }

    res.json({
      success: true,
      sensor: {
        id: sensor.sensorId,
        name: sensor.name,
        type: sensor.sensorType,
        status: sensor.status,
        lastUpdate: sensor.lastReading,
        position: sensor.location,
        data: sensor.sensorData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};