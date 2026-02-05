import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './SmartCity3D.css';
import CityModel from './CityModel';
import SensorMarker from './SensorMarker';
import Controls from './Controls';
import SensorInfoPanel from './SensorInfoPanel';
import { sampleCities, sensorTypes } from './models/SampleCities';

const SmartCity3D = () => {
  const [selectedCity, setSelectedCity] = useState(sampleCities[0]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState('overview');
  const [isDay, setIsDay] = useState(true);
  const controlsRef = useRef();

  const handleSensorClick = (sensor) => {
    setSelectedSensor(sensor);
    if (controlsRef.current) {
      controlsRef.current.target.set(sensor.position.x, sensor.position.y, sensor.position.z);
    }
  };

  const handleCityChange = (cityId) => {
    const city = sampleCities.find(c => c.id === cityId);
    setSelectedCity(city);
    setSelectedSensor(null);
  };

  const resetView = () => {
    setSelectedSensor(null);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="smart-city-3d-container">
      <div className="city-selector">
        <h2>Smart City Models</h2>
        <div className="city-buttons">
          {sampleCities.map(city => (
            <button
              key={city.id}
              className={`city-btn ${selectedCity.id === city.id ? 'active' : ''}`}
              onClick={() => handleCityChange(city.id)}
            >
              {city.name}
            </button>
          ))}
        </div>
        
        <div className="city-info">
          <h3>{selectedCity.name}</h3>
          <p>{selectedCity.description}</p>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{selectedCity.stats.totalSensors}</span>
              <span className="stat-label">Total Sensors</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{selectedCity.stats.energySaved}</span>
              <span className="stat-label">Energy Saved</span>
            </div>
            {selectedCity.stats.trafficImproved && (
              <div className="stat-item">
                <span className="stat-value">{selectedCity.stats.trafficImproved}</span>
                <span className="stat-label">Traffic Improved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="canvas-container">
        <div className="controls-toolbar">
          <Controls
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isDay={isDay}
            setIsDay={setIsDay}
            resetView={resetView}
          />
          <div className="sensor-legend">
            <h4>Sensor Legend</h4>
            {Object.entries(sensorTypes).map(([type, info]) => (
              <div key={type} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: info.color }}></span>
                <span className="legend-icon">{info.icon}</span>
                <span className="legend-text">{type}</span>
              </div>
            ))}
          </div>
        </div>

        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[25, 15, 25]} fov={50} />
          
          {isDay ? (
            <>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            </>
          ) : (
            <>
              <ambientLight intensity={0.2} />
              <directionalLight position={[-10, 10, -5]} intensity={0.5} color="#4f46e5" />
              <Stars radius={100} depth={50} count={5000} factor={4} />
            </>
          )}

          <Suspense fallback={null}>
            <CityModel cityType={selectedCity.modelType} />
          </Suspense>

          {selectedCity.sensors.map(sensor => (
            <SensorMarker
              key={sensor.id}
              sensor={sensor}
              isSelected={selectedSensor?.id === sensor.id}
              onClick={() => handleSensorClick(sensor)}
            />
          ))}

          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            minDistance={10}
            maxDistance={100}
          />

          <Environment preset={isDay ? "city" : "night"} />
        </Canvas>

        <div className="instructions">
          <p>🎮 <strong>Controls:</strong> Left click + drag to rotate • Right click + drag to pan • Scroll to zoom</p>
          <p>📱 <strong>Mobile:</strong> Touch and drag to rotate • Pinch to zoom</p>
        </div>
      </div>

      {selectedSensor && (
        <SensorInfoPanel
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
          sensorTypes={sensorTypes}
        />
      )}
    </div>
  );
};

export default SmartCity3D;