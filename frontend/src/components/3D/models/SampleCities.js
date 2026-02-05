export const sampleCities = [
  {
    id: 'city-1',
    name: 'Tech Metropolis',
    description: 'Smart city with IoT sensors for traffic, environment, and security monitoring',
    modelType: 'metropolis',
    sensors: [
      {
        id: 'sensor-001',
        name: 'Traffic Flow Sensor',
        type: 'traffic',
        position: { x: 10, y: 5, z: -15 },
        data: {
          current: '45 vehicles/min',
          status: 'active',
          lastUpdate: '2024-01-15T10:30:00Z'
        }
      },
      {
        id: 'sensor-002',
        name: 'Air Quality Monitor',
        type: 'environment',
        position: { x: -8, y: 3, z: 12 },
        data: {
          current: 'AQI: 45 (Good)',
          status: 'active',
          lastUpdate: '2024-01-15T10:25:00Z'
        }
      },
      {
        id: 'sensor-003',
        name: 'Smart Street Light',
        type: 'energy',
        position: { x: 5, y: 8, z: -5 },
        data: {
          current: 'Energy: 85W',
          status: 'active',
          lastUpdate: '2024-01-15T10:28:00Z'
        }
      }
    ],
    stats: {
      totalSensors: 125,
      energySaved: '35%',
      trafficImproved: '40%',
      airQuality: 'Good'
    }
  },
  {
    id: 'city-2',
    name: 'Eco Sustainable City',
    description: 'Green city with renewable energy sensors and waste management IoT',
    modelType: 'eco',
    sensors: [
      {
        id: 'sensor-004',
        name: 'Solar Panel Monitor',
        type: 'energy',
        position: { x: 15, y: 12, z: 8 },
        data: {
          current: 'Output: 2.5kW',
          status: 'active',
          lastUpdate: '2024-01-15T10:20:00Z'
        }
      },
      {
        id: 'sensor-005',
        name: 'Water Quality Sensor',
        type: 'environment',
        position: { x: -10, y: 2, z: -8 },
        data: {
          current: 'pH: 7.2',
          status: 'active',
          lastUpdate: '2024-01-15T10:22:00Z'
        }
      }
    ],
    stats: {
      totalSensors: 89,
      energySaved: '65%',
      co2Reduced: '120 tons',
      waterSaved: '40%'
    }
  }
];

export const sensorTypes = {
  traffic: { color: '#3B82F6', icon: '🚦' },
  environment: { color: '#10B981', icon: '🌿' },
  energy: { color: '#F59E0B', icon: '⚡' },
  security: { color: '#EF4444', icon: '🎥' },
  waste: { color: '#8B5CF6', icon: '🗑️' }
};