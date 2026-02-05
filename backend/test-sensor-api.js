// test-sensor-api.js
const http = require('http');

console.log('🧪 Testing Sensor API...\n');

const baseURL = 'http://localhost:5000';
const testData = {
  name: "Test Humidity Sensor",
  description: "Test humidity monitoring device",
  price: 89.99,
  category: "sensors",
  stock: 25,
  status: "active",
  sensorId: "TEST-HUMIDITY-001",
  sensorType: "humidity",
  isSensor: true,
  location: {
    latitude: 40.7549,
    longitude: -73.9840,
    address: "Test Location"
  }
};

// Test 1: Create product with sensor
console.log('1️⃣ Creating sensor product...');
const req = http.request(`${baseURL}/api/products`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', JSON.parse(data));
    console.log('✅ Test 1 complete\n');
    
    // Test 2: Get all sensors
    console.log('2️⃣ Getting all sensors...');
    http.get(`${baseURL}/api/sensors`, (res) => {
      let sensorData = '';
      res.on('data', chunk => sensorData += chunk);
      res.on('end', () => {
        console.log('Sensors:', JSON.parse(sensorData));
        console.log('✅ Test 2 complete\n');
        
        // Test 3: Update sensor data
        console.log('3️⃣ Updating sensor data...');
        const updateReq = http.request(
          `${baseURL}/api/sensors/TEST-HUMIDITY-001/data`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          },
          (updateRes) => {
            let updateData = '';
            updateRes.on('data', chunk => updateData += chunk);
            updateRes.on('end', () => {
              console.log('Update response:', JSON.parse(updateData));
              console.log('✅ All tests complete!');
            });
          }
        );
        
        updateReq.write(JSON.stringify({
          data: { humidity: 65, temperature: 23.1, battery: 88 }
        }));
        updateReq.end();
      });
    });
  });
});

req.write(JSON.stringify(testData));
req.end();