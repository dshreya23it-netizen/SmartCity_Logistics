import React from 'react';
import './SmartCity3D.css';

const Controls = ({ 
  autoRotate, 
  setAutoRotate, 
  viewMode, 
  setViewMode, 
  isDay, 
  setIsDay, 
  resetView 
}) => {
  return (
    <div className="controls-container">
      <div className="control-group">
        <h4>View Controls</h4>
        <div className="control-buttons">
          <button 
            className={`control-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? '🔄 Auto Rotate ON' : '⏹️ Auto Rotate OFF'}
          </button>
          
          <button 
            className={`control-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            🌍 Overview
          </button>
          
          <button 
            className={`control-btn ${viewMode === 'sensor' ? 'active' : ''}`}
            onClick={() => setViewMode('sensor')}
          >
            📡 Sensor View
          </button>
          
          <button 
            className={`control-btn ${isDay ? 'active' : ''}`}
            onClick={() => setIsDay(true)}
          >
            ☀️ Day
          </button>
          
          <button 
            className={`control-btn ${!isDay ? 'active' : ''}`}
            onClick={() => setIsDay(false)}
          >
            🌙 Night
          </button>
          
          <button 
            className="control-btn reset-btn"
            onClick={resetView}
          >
            🏠 Reset View
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;