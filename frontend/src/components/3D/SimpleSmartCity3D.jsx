import React, { useState } from 'react';
import './SmartCity3D.css';

const SimpleSmartCity3D = () => {
  const [selectedCity, setSelectedCity] = useState('metropolis');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [viewMode, setViewMode] = useState('overview');

  const cities = [
    { id: 'metropolis', name: 'Tech Metropolis', color: '#3B82F6' },
    { id: 'eco', name: 'Eco Sustainable City', color: '#10B981' },
    { id: 'industrial', name: 'Industrial Hub', color: '#8B5CF6' }
  ];

  const sensors = [
    { id: 'sensor-001', name: 'Traffic Flow Sensor', type: 'traffic', x: 20, y: 10 },
    { id: 'sensor-002', name: 'Air Quality Monitor', type: 'environment', x: 40, y: 30 },
    { id: 'sensor-003', name: 'Smart Street Light', type: 'energy', x: 60, y: 50 },
    { id: 'sensor-004', name: 'Security Camera', type: 'security', x: 80, y: 20 },
    { id: 'sensor-005', name: 'Waste Management', type: 'waste', x: 30, y: 60 }
  ];

  const sensorTypes = {
    traffic: { color: '#3B82F6', icon: '🚦' },
    environment: { color: '#10B981', icon: '🌿' },
    energy: { color: '#F59E0B', icon: '⚡' },
    security: { color: '#EF4444', icon: '🎥' },
    waste: { color: '#8B5CF6', icon: '🗑️' }
  };

  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
  };

  const renderBuilding = (x, y, width, height, color) => (
    <div 
      className="building" 
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        transform: 'perspective(500px) rotateX(60deg)'
      }}
    />
  );

  return (
    <div className="simple-3d-container">
      <div className="city-controls">
        <h2>Smart City 3D Visualization</h2>
        <div className="city-selector">
          {cities.map(city => (
            <button
              key={city.id}
              className={`city-btn ${selectedCity === city.id ? 'active' : ''}`}
              onClick={() => setSelectedCity(city.id)}
              style={{ borderColor: city.color }}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      <div className="city-canvas">
        <div className="city-scene">
          {/* City Grid */}
          <div className="city-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`row-${i}`} className="grid-row">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={`cell-${i}-${j}`} className="grid-cell" />
                ))}
              </div>
            ))}
          </div>

          {/* Buildings */}
          <div className="buildings-container">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`building-${i}`}
                className="building-3d"
                style={{
                  left: `${15 + (i % 5) * 15}%`,
                  top: `${20 + Math.floor(i / 5) * 15}%`,
                  height: `${40 + Math.random() * 60}px`,
                  backgroundColor: selectedCity === 'eco' ? '#86efac' : '#60a5fa'
                }}
              >
                <div className="building-windows">
                  {Array.from({ length: 6 }).map((_, w) => (
                    <div key={`window-${w}`} className="building-window" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sensors */}
          <div className="sensors-container">
            {sensors.map(sensor => (
              <div
                key={sensor.id}
                className={`sensor-marker ${selectedSensor?.id === sensor.id ? 'selected' : ''}`}
                style={{
                  left: `${sensor.x}%`,
                  top: `${sensor.y}%`,
                  backgroundColor: sensorTypes[sensor.type].color,
                  boxShadow: `0 0 20px ${sensorTypes[sensor.type].color}`
                }}
                onClick={() => handleSensorClick(sensor)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span className="sensor-icon">{sensorTypes[sensor.type].icon}</span>
                <div className="sensor-pulse"></div>
              </div>
            ))}
          </div>

          {/* Roads */}
          <div className="roads">
            <div className="road horizontal" style={{ top: '50%' }}></div>
            <div className="road vertical" style={{ left: '50%' }}></div>
          </div>
        </div>

        {/* Sensor Info Panel */}
        {selectedSensor && (
          <div className="sensor-info-card">
            <div className="sensor-info-header">
              <h3>
                <span className="sensor-icon-large">
                  {sensorTypes[selectedSensor.type].icon}
                </span>
                {selectedSensor.name}
              </h3>
              <button 
                className="close-btn" 
                onClick={() => setSelectedSensor(null)}
              >
                ×
              </button>
            </div>
            <div className="sensor-info-body">
              <p><strong>ID:</strong> {selectedSensor.id}</p>
              <p><strong>Type:</strong> {selectedSensor.type}</p>
              <p><strong>Status:</strong> <span className="status-active">● Active</span></p>
              <p><strong>Last Reading:</strong> 45 vehicles/min</p>
              <p><strong>Battery:</strong> 85%</p>
            </div>
            <div className="sensor-info-actions">
              <button className="btn btn-primary">View Details</button>
              <button className="btn btn-secondary">Configure</button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="sensor-legend">
          <h4>Sensor Legend</h4>
          {Object.entries(sensorTypes).map(([type, info]) => (
            <div key={type} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: info.color }}
              ></div>
              <span className="legend-icon">{info.icon}</span>
              <span className="legend-text">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleSmartCity3D;