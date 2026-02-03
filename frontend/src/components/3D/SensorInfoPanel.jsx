import React from 'react';
import './SmartCity3D.css';

const SensorInfoPanel = ({ sensor, onClose, sensorTypes }) => {
  const getStatusColor = (status) => {
    return status === 'active' ? '#10B981' : '#EF4444';
  };

  return (
    <div className="sensor-info-panel">
      <div className="sensor-info-header">
        <h3>Sensor Details</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="sensor-info-content">
        <div className="sensor-basic-info">
          <div className="sensor-icon-large">
            {sensorTypes[sensor.type]?.icon || '📡'}
          </div>
          <div>
            <h4>{sensor.name}</h4>
            <p className="sensor-id">ID: {sensor.id}</p>
            <div className="sensor-type-badge" style={{ 
              backgroundColor: sensorTypes[sensor.type]?.color || '#6B7280' 
            }}>
              {sensor.type}
            </div>
          </div>
        </div>

        <div className="sensor-data-section">
          <h5>Current Data</h5>
          <div className="data-grid">
            <div className="data-item">
              <span className="data-label">Reading:</span>
              <span className="data-value">{sensor.data.current}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Status:</span>
              <span className="data-value" style={{ color: getStatusColor(sensor.data.status) }}>
                ● {sensor.data.status}
              </span>
            </div>
            <div className="data-item">
              <span className="data-label">Last Update:</span>
              <span className="data-value">
                {new Date(sensor.data.lastUpdate).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="sensor-position">
          <h5>Position</h5>
          <div className="position-coords">
            <span>X: {sensor.position.x.toFixed(1)}</span>
            <span>Y: {sensor.position.y.toFixed(1)}</span>
            <span>Z: {sensor.position.z.toFixed(1)}</span>
          </div>
        </div>

        <div className="sensor-actions">
          <button className="action-btn primary">
            📊 View Detailed Analytics
          </button>
          <button className="action-btn secondary">
            🔧 Configure Settings
          </button>
          <button className="action-btn warning">
            ⚠️ Alert History
          </button>
        </div>
      </div>
    </div>
  );
};

export default SensorInfoPanel;