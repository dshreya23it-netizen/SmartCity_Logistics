// scripts/setup-sensors.js
const mongoose = require('mongoose');

console.log('🔧 Setting up sensor data in MongoDB...');

mongoose.connect('mongodb://127.0.0.1:27017/smartcity_logistics')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });

// Product model (same as server.js)
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

async function setupSensors() {
  try {
    // 1. Add sensor data to existing products
    await Product.findOneAndUpdate(
      { name: "IoT Sensor Pro" },
      {
        sensorId: "IOT-SENSOR-001",
        sensorType: "temperature",
        isSensor: true,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: "Main Office, NYC"
        },
        sensorData: {
          temperature: 22.5,
          humidity: 45,
          battery: 92,
          status: "active"
        },
        lastReading: new Date()
      }
    );

    await Product.findOneAndUpdate(
      { name: "GPS Tracker Mini" },
      {
        sensorId: "GPS-TRACKER-001",
        sensorType: "gps",
        isSensor: true,
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: "Delivery Truck #45"
        },
        sensorData: {
          speed: 45,
          altitude: 10,
          accuracy: 5,
          battery: 78
        },
        lastReading: new Date()
      }
    );

    // 2. Add a new sensor product
    await Product.create({
      name: "Smart Temperature Sensor",
      description: "Real-time temperature monitoring device",
      price: 149.99,
      category: "sensors",
      stock: 50,
      status: "active",
      sensorId: "TEMP-SENSOR-001",
      sensorType: "temperature",
      isSensor: true,
      location: {
        latitude: 40.7831,
        longitude: -73.9712,
        address: "Central Park, NYC"
      },
      sensorData: {
        temperature: 21.8,
        humidity: 52,
        battery: 95,
        status: "active"
      },
      lastReading: new Date()
    });

    console.log('✅ Sensor setup complete!');
    
    // 3. Show results
    const sensors = await Product.find({ isSensor: true });
    console.log(`\n📊 Found ${sensors.length} sensor products:`);
    
    sensors.forEach(sensor => {
      console.log(`
      🎯 ${sensor.name}
         Sensor ID: ${sensor.sensorId}
         Type: ${sensor.sensorType}
         Location: ${sensor.location?.address || 'N/A'}
         Data: ${JSON.stringify(sensor.sensorData)}
      `);
    });

    // 4. Check MongoDB directly
    console.log('\n🔍 Checking MongoDB collection...');
    const count = await Product.countDocuments();
    console.log(`Total products in database: ${count}`);

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Setup complete. Ready to use!');
  }
}

setupSensors();