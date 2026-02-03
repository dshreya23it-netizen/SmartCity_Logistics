import React, { useState, useEffect } from 'react';
import './SmartCity3DView.css';
import SmartCity3DScene from '../components/3D/SmartCity3DScene';

const SmartCity3DView = () => {
  const [selectedCity, setSelectedCity] = useState('metropolis');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [sensors, setSensors] = useState([]);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [sensorFilters, setSensorFilters] = useState({
    traffic: true,
    environment: true,
    energy: true,
    security: true,
    waste: true,
    water: true,
    transport: true
  });

  // Initial sensor data
  const initialSensors = [
    // Traffic Sensors
    { id: 'TS-001', name: 'Smart Traffic Light Alpha', type: 'traffic', icon: '🚦', color: '#3B82F6', 
      x: 35, y: 25, reading: 'Green: 45s', battery: 94, zone: 'Downtown', category: 'traffic', status: 'active' },
    { id: 'TS-002', name: 'Vehicle Counter Main', type: 'traffic', icon: '🚗', color: '#3B82F6', 
      x: 45, y: 40, reading: '1,245/hr', battery: 88, zone: 'Main Street', category: 'traffic', status: 'active' },
    { id: 'TS-003', name: 'Parking Sensor Mall', type: 'traffic', icon: '🅿️', color: '#3B82F6', 
      x: 50, y: 18, reading: '85% Occupied', battery: 92, zone: 'Mall', category: 'traffic', status: 'active' },
    { id: 'TS-004', name: 'Speed Monitor Highway', type: 'traffic', icon: '📊', color: '#3B82F6', 
      x: 60, y: 40, reading: '65 km/h avg', battery: 90, zone: 'Highway', category: 'traffic', status: 'active' },
    
    // Environment Sensors
    { id: 'AQ-001', name: 'Air Quality Central', type: 'environment', icon: '🌿', color: '#10B981', 
      x: 35, y: 48, reading: 'AQI: 32 (Good)', battery: 86, zone: 'Central Park', category: 'environment', status: 'active' },
    { id: 'AQ-002', name: 'Weather Station', type: 'environment', icon: '☁️', color: '#10B981', 
      x: 75, y: 85, reading: '25°C, 65% RH', battery: 91, zone: 'Airport', category: 'environment', status: 'active' },
    { id: 'AQ-003', name: 'Noise Monitor Residential', type: 'environment', icon: '🔊', color: '#10B981', 
      x: 22, y: 45, reading: '52 dB', battery: 89, zone: 'Residential', category: 'environment', status: 'active' },
    { id: 'AQ-004', name: 'UV Index Sensor', type: 'environment', icon: '☀️', color: '#10B981', 
      x: 70, y: 68, reading: 'UV: 6 (High)', battery: 87, zone: 'Tech Garden', category: 'environment', status: 'active' },
    
    // Energy Sensors
    { id: 'ES-001', name: 'Smart Grid Monitor', type: 'energy', icon: '⚡', color: '#F59E0B', 
      x: 55, y: 65, reading: '2.4 MW Load', battery: 95, zone: 'Power Plant', category: 'energy', status: 'active' },
    { id: 'ES-002', name: 'Solar Panel Monitor', type: 'energy', icon: '☀️', color: '#F59E0B', 
      x: 85, y: 22, reading: '85% Efficiency', battery: 87, zone: 'Solar Farm', category: 'energy', status: 'active' },
    { id: 'ES-003', name: 'Street Light Controller', type: 'energy', icon: '💡', color: '#F59E0B', 
      x: 40, y: 30, reading: 'Auto Dimming', battery: 93, zone: 'Main Street', category: 'energy', status: 'active' },
    
    // Security Sensors
    { id: 'SS-001', name: 'Surveillance Camera Bank', type: 'security', icon: '🎥', color: '#EF4444', 
      x: 75, y: 38, reading: 'All Clear', battery: 96, zone: 'Bank', category: 'security', status: 'active' },
    { id: 'SS-002', name: 'Emergency SOS Hospital', type: 'security', icon: '🚨', color: '#EF4444', 
      x: 78, y: 48, reading: 'Standby', battery: 98, zone: 'Hospital', category: 'security', status: 'active' },
    
    // Waste Management
    { id: 'WM-001', name: 'Smart Bin Commercial', type: 'waste', icon: '🗑️', color: '#8B5CF6', 
      x: 48, y: 35, reading: '72% Full', battery: 82, zone: 'Commercial', category: 'waste', status: 'active' },
    { id: 'WM-002', name: 'Smart Bin Residential', type: 'waste', icon: '♻️', color: '#8B5CF6', 
      x: 18, y: 55, reading: '45% Full', battery: 88, zone: 'Residential', category: 'waste', status: 'active' },
    
    // Water Management
    { id: 'WS-001', name: 'Water Quality Reservoir', type: 'water', icon: '💧', color: '#0EA5E9', 
      x: 12, y: 42, reading: 'pH: 7.2', battery: 90, zone: 'Reservoir', category: 'water', status: 'active' },
    
    // Public Transport
    { id: 'PT-001', name: 'Bus Tracker Terminal', type: 'transport', icon: '🚌', color: '#EC4899', 
      x: 58, y: 75, reading: 'Next: 3 min', battery: 85, zone: 'Bus Terminal', category: 'transport', status: 'active' },
    { id: 'PT-002', name: 'Train Monitor Station', type: 'transport', icon: '🚆', color: '#EC4899', 
      x: 25, y: 85, reading: 'On Time', battery: 92, zone: 'Railway Station', category: 'transport', status: 'active' },
  ];

  useEffect(() => {
    setSensors(initialSensors);
  }, []);

  const cities = [
    { 
      id: 'metropolis', 
      name: 'Tech Metropolis', 
      icon: '🌃',
      color: '#3B82F6',
      description: 'Futuristic smart city with advanced AI infrastructure',
      stats: { 
        sensors: sensors.filter(s => selectedCity === 'metropolis').length, 
        efficiency: '98.5%', 
        coverage: '100%',
        buildings: 48
      }
    },
    { 
      id: 'eco', 
      name: 'Eco Sustainable', 
      icon: '🌱',
      color: '#10B981',
      description: 'Green city powered by renewable energy sources',
      stats: { 
        sensors: sensors.filter(s => selectedCity === 'eco').length, 
        efficiency: '96%', 
        coverage: '94%',
        buildings: 36
      }
    },
    { 
      id: 'industrial', 
      name: 'Industrial Hub', 
      icon: '🏭',
      color: '#8B5CF6',
      description: 'Industrial zone with automated logistics monitoring',
      stats: { 
        sensors: sensors.filter(s => selectedCity === 'industrial').length, 
        efficiency: '99%', 
        coverage: '100%',
        buildings: 42
      }
    },
    { 
      id: 'coastal', 
      name: 'Coastal City', 
      icon: '🏖️',
      color: '#0EA5E9',
      description: 'Waterfront smart city with harbor management',
      stats: { 
        sensors: sensors.filter(s => selectedCity === 'coastal').length, 
        efficiency: '97%', 
        coverage: '96%',
        buildings: 32
      }
    }
  ];

  const sensorCategories = [
    { id: 'all', name: 'All Sensors', icon: '📡', color: '#60a5fa', count: sensors.length },
    { id: 'traffic', name: 'Traffic', icon: '🚦', color: '#3B82F6', count: sensors.filter(s => s.category === 'traffic').length },
    { id: 'environment', name: 'Environment', icon: '🌿', color: '#10B981', count: sensors.filter(s => s.category === 'environment').length },
    { id: 'energy', name: 'Energy', icon: '⚡', color: '#F59E0B', count: sensors.filter(s => s.category === 'energy').length },
    { id: 'security', name: 'Security', icon: '🎥', color: '#EF4444', count: sensors.filter(s => s.category === 'security').length },
    { id: 'waste', name: 'Waste', icon: '🗑️', color: '#8B5CF6', count: sensors.filter(s => s.category === 'waste').length },
    { id: 'water', name: 'Water', icon: '💧', color: '#0EA5E9', count: sensors.filter(s => s.category === 'water').length },
    { id: 'transport', name: 'Transport', icon: '🚌', color: '#EC4899', count: sensors.filter(s => s.category === 'transport').length },
  ];

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    setSelectedSensor(null);
  };

  const handleAddSensor = (newSensor) => {
    const sensor = {
      ...newSensor,
      id: `${newSensor.category.toUpperCase()}-${String(sensors.length + 1).padStart(3, '0')}`,
      status: 'active',
      battery: 100
    };
    setSensors([...sensors, sensor]);
    setShowAddSensor(false);
  };

  const handleUpdateSensor = (sensorId, updates) => {
    setSensors(sensors.map(s => s.id === sensorId ? { ...s, ...updates } : s));
  };

  const handleDeleteSensor = (sensorId) => {
    setSensors(sensors.filter(s => s.id !== sensorId));
    setSelectedSensor(null);
  };

  const toggleFilter = (category) => {
    setSensorFilters(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredSensors = sensors.filter(s => 
    sensorFilters[s.category] && (viewMode === 'all' || s.category === viewMode)
  );

  return (
    <div className="smart-city-3d-page-enhanced">
      {/* Header */}
      <header className="smart-city-header-enhanced">
        <div className="header-left">
          <h1 className="logo-enhanced">
            <span className="logo-icon-animated">🌍</span>
            SmartCity<span className="logo-highlight-gradient">3D Pro</span>
          </h1>
          <div className="header-subtitle">Interactive Landscape Visualization</div>
        </div>
        
        <div className="header-center">
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span>Live Monitoring</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="header-btn">
            <span className="btn-icon">📊</span>
            Analytics
          </button>
          <button className="header-btn primary">
            <span className="btn-icon">🎮</span>
            Controls
          </button>
        </div>
      </header>

      <div className="smart-city-container-enhanced">
        {/* Left Sidebar - City Selection & Filters */}
        <aside className="control-sidebar-enhanced">
          {/* City Model Selector */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <span className="title-icon">🏙️</span>
              City Models
            </h3>
            <div className="city-cards-grid">
              {cities.map(city => (
                <div 
                  key={city.id}
                  className={`city-card-enhanced ${selectedCity === city.id ? 'active' : ''}`}
                  onClick={() => handleCityChange(city.id)}
                  style={{ 
                    '--city-color': city.color,
                    borderColor: selectedCity === city.id ? city.color : 'transparent'
                  }}
                >
                  <div className="city-card-header">
                    <span className="city-card-icon">{city.icon}</span>
                    <h4>{city.name}</h4>
                  </div>
                  <p className="city-card-desc">{city.description}</p>
                  <div className="city-card-stats">
                    <div className="mini-stat">
                      <span className="mini-stat-value">{city.stats.sensors || filteredSensors.length}</span>
                      <span className="mini-stat-label">Sensors</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-value">{city.stats.efficiency}</span>
                      <span className="mini-stat-label">Efficiency</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor Filter Cards */}
          <div className="sidebar-section">
            <div className="section-title-row">
              <h3 className="section-title">
                <span className="title-icon">🎛️</span>
                Sensor Filters
              </h3>
              <button 
                className="add-sensor-btn"
                onClick={() => setShowAddSensor(true)}
              >
                <span>+</span>
              </button>
            </div>
            <div className="filter-cards-grid">
              {sensorCategories.map(category => (
                <div 
                  key={category.id}
                  className={`filter-card ${viewMode === category.id ? 'active' : ''} ${category.id !== 'all' && !sensorFilters[category.id] ? 'disabled' : ''}`}
                  onClick={() => setViewMode(category.id)}
                  style={{ '--filter-color': category.color }}
                >
                  <div className="filter-card-header">
                    <span className="filter-icon">{category.icon}</span>
                    {category.id !== 'all' && (
                      <button 
                        className="filter-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFilter(category.id);
                        }}
                      >
                        {sensorFilters[category.id] ? '👁️' : '👁️‍🗨️'}
                      </button>
                    )}
                  </div>
                  <div className="filter-card-name">{category.name}</div>
                  <div className="filter-card-count">{category.count} active</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <span className="title-icon">📈</span>
              Live Statistics
            </h3>
            <div className="quick-stats">
              <div className="quick-stat-card">
                <div className="stat-icon-large">⚡</div>
                <div className="stat-data">
                  <div className="stat-value-large">98.5%</div>
                  <div className="stat-label-large">System Uptime</div>
                  <div className="stat-trend up">↑ 2.3%</div>
                </div>
              </div>
              <div className="quick-stat-card">
                <div className="stat-icon-large">🌐</div>
                <div className="stat-data">
                  <div className="stat-value-large">{filteredSensors.length}/{sensors.length}</div>
                  <div className="stat-label-large">Active Sensors</div>
                  <div className="stat-trend neutral">─ Stable</div>
                </div>
              </div>
              <div className="quick-stat-card">
                <div className="stat-icon-large">🔋</div>
                <div className="stat-data">
                  <div className="stat-value-large">
                    {Math.round(sensors.reduce((acc, s) => acc + s.battery, 0) / sensors.length)}%
                  </div>
                  <div className="stat-label-large">Avg. Battery</div>
                  <div className="stat-trend down">↓ 1.2%</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main 3D Scene */}
        <main className="main-scene-enhanced">
          <SmartCity3DScene 
            cityType={selectedCity}
            viewMode={viewMode}
            sensors={filteredSensors}
            onSensorSelect={setSelectedSensor}
            onSensorUpdate={handleUpdateSensor}
            onSensorDelete={handleDeleteSensor}
          />
        </main>
      </div>

      {/* Sensor Detail Panel */}
      {selectedSensor && (
        <div className="sensor-detail-panel-enhanced">
          <div className="panel-header-enhanced">
            <div className="panel-title">
              <span className="panel-icon" style={{ color: selectedSensor.color }}>
                {selectedSensor.icon}
              </span>
              <h3>{selectedSensor.name}</h3>
            </div>
            <button className="close-btn-enhanced" onClick={() => setSelectedSensor(null)}>
              ✕
            </button>
          </div>
          
          <div className="panel-content-enhanced">
            <div className="sensor-id-badge">ID: {selectedSensor.id}</div>
            
            <div className="sensor-status-row">
              <span className={`status-badge ${selectedSensor.status}`}>
                ● {selectedSensor.status.toUpperCase()}
              </span>
              <span className="category-badge" style={{ backgroundColor: selectedSensor.color }}>
                {selectedSensor.category}
              </span>
            </div>

            <div className="sensor-metrics">
              <div className="metric-card">
                <div className="metric-label">Current Reading</div>
                <div className="metric-value-large">{selectedSensor.reading}</div>
              </div>
              
              <div className="metric-row">
                <div className="metric-item">
                  <span className="metric-label">Battery</span>
                  <div className="battery-bar">
                    <div 
                      className="battery-fill" 
                      style={{ width: `${selectedSensor.battery}%` }}
                    ></div>
                  </div>
                  <span className="metric-value">{selectedSensor.battery}%</span>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-item">
                  <span className="metric-label">Location</span>
                  <span className="metric-value">📍 {selectedSensor.zone}</span>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-item">
                  <span className="metric-label">Last Updated</span>
                  <span className="metric-value">⏱️ Just now</span>
                </div>
              </div>
            </div>

            <div className="sensor-actions-enhanced">
              <button className="action-btn-enhanced primary">
                <span>📊</span> View Analytics
              </button>
              <button className="action-btn-enhanced secondary">
                <span>⚙️</span> Configure
              </button>
              <button 
                className="action-btn-enhanced danger"
                onClick={() => handleDeleteSensor(selectedSensor.id)}
              >
                <span>🗑️</span> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sensor Modal */}
      {showAddSensor && (
        <div className="modal-overlay" onClick={() => setShowAddSensor(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Sensor</h3>
              <button className="modal-close" onClick={() => setShowAddSensor(false)}>✕</button>
            </div>
            <div className="modal-body">
              <AddSensorForm onSubmit={handleAddSensor} onCancel={() => setShowAddSensor(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Info Bar */}
      <footer className="scene-footer-enhanced">
        <div className="footer-section">
          <div className="footer-instruction">
            <span className="instruction-icon">🖱️</span>
            <span>Click & Drag to Rotate</span>
          </div>
          <div className="footer-instruction">
            <span className="instruction-icon">🔍</span>
            <span>Scroll to Zoom</span>
          </div>
          <div className="footer-instruction">
            <span className="instruction-icon">🎯</span>
            <span>Click Buildings/Sensors for Details</span>
          </div>
        </div>
        <div className="footer-section">
          <div className="connection-status">
            <span className="connection-dot"></span>
            <span>Connected</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Add Sensor Form Component
const AddSensorForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'traffic',
    x: 50,
    y: 50,
    zone: '',
    reading: ''
  });

  const categoryOptions = [
    { value: 'traffic', label: 'Traffic', icon: '🚦', color: '#3B82F6' },
    { value: 'environment', label: 'Environment', icon: '🌿', color: '#10B981' },
    { value: 'energy', label: 'Energy', icon: '⚡', color: '#F59E0B' },
    { value: 'security', label: 'Security', icon: '🎥', color: '#EF4444' },
    { value: 'waste', label: 'Waste', icon: '🗑️', color: '#8B5CF6' },
    { value: 'water', label: 'Water', icon: '💧', color: '#0EA5E9' },
    { value: 'transport', label: 'Transport', icon: '🚌', color: '#EC4899' },
  ];

  const selectedCategory = categoryOptions.find(c => c.value === formData.category);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      icon: selectedCategory.icon,
      color: selectedCategory.color
    });
  };

  return (
    <form className="add-sensor-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Sensor Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Traffic Monitor Main Street"
          required
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <div className="category-selector">
          {categoryOptions.map(cat => (
            <button
              key={cat.value}
              type="button"
              className={`category-option ${formData.category === cat.value ? 'active' : ''}`}
              onClick={() => setFormData({...formData, category: cat.value})}
              style={{ '--cat-color': cat.color }}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>X Position ({formData.x}%)</label>
          <input
            type="range"
            min="10"
            max="90"
            value={formData.x}
            onChange={(e) => setFormData({...formData, x: parseInt(e.target.value)})}
          />
        </div>
        <div className="form-group">
          <label>Y Position ({formData.y}%)</label>
          <input
            type="range"
            min="10"
            max="90"
            value={formData.y}
            onChange={(e) => setFormData({...formData, y: parseInt(e.target.value)})}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Zone</label>
        <input
          type="text"
          value={formData.zone}
          onChange={(e) => setFormData({...formData, zone: e.target.value})}
          placeholder="e.g., Downtown, Mall District"
          required
        />
      </div>

      <div className="form-group">
        <label>Initial Reading</label>
        <input
          type="text"
          value={formData.reading}
          onChange={(e) => setFormData({...formData, reading: e.target.value})}
          placeholder="e.g., 75%, 25°C, Normal"
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-submit">
          <span>+</span> Add Sensor
        </button>
      </div>
    </form>
  );
};

export default SmartCity3DView;