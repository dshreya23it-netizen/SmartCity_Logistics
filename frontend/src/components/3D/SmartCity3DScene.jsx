import React, { useState, useEffect, useRef } from 'react';
import './SmartCity3DScene.css';

const SmartCity3DScene = ({ 
  cityType, 
  viewMode, 
  onSensorSelect, 
  sensors = [],
  onSensorUpdate,
  onSensorDelete 
}) => {
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(65);
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [hoveredSensor, setHoveredSensor] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const sceneRef = useRef(null);

  // City-specific configurations
  const cityConfigs = {
    metropolis: {
      name: 'Tech Metropolis',
      groundColor: 'linear-gradient(135deg, #1a1f35 0%, #0f172a 100%)',
      skyColor: 'linear-gradient(180deg, #0a0e27 0%, #1a1f35 50%, #2d3748 100%)',
      accentColor: '#3B82F6',
      buildingDensity: 'high'
    },
    eco: {
      name: 'Eco Sustainable',
      groundColor: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      skyColor: 'linear-gradient(180deg, #064e3b 0%, #065f46 50%, #059669 100%)',
      accentColor: '#10B981',
      buildingDensity: 'medium'
    },
    industrial: {
      name: 'Industrial Hub',
      groundColor: 'linear-gradient(135deg, #3f1d4e 0%, #1e1b4b 100%)',
      skyColor: 'linear-gradient(180deg, #1e1b4b 0%, #3f1d4e 50%, #581c87 100%)',
      accentColor: '#8B5CF6',
      buildingDensity: 'medium'
    },
    coastal: {
      name: 'Coastal Smart City',
      groundColor: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)',
      skyColor: 'linear-gradient(180deg, #082f49 0%, #0c4a6e 50%, #0284c7 100%)',
      accentColor: '#0EA5E9',
      buildingDensity: 'low'
    }
  };

  const currentConfig = cityConfigs[cityType] || cityConfigs.metropolis;

  // Enhanced buildings data with 3D positioning
  const buildings = [
    // Commercial District (Front-Center)
    { id: 'b1', type: 'skyscraper', name: 'Tech Tower', x: 40, z: 20, height: 180, width: 40, depth: 40, color: '#3B82F6', category: 'commercial' },
    { id: 'b2', type: 'skyscraper', name: 'Business Center', x: 60, z: 25, height: 160, width: 35, depth: 35, color: '#1D4ED8', category: 'commercial' },
    { id: 'b3', type: 'skyscraper', name: 'Financial Plaza', x: 50, z: 30, height: 200, width: 45, depth: 45, color: '#2563EB', category: 'commercial' },
    
    // Residential Area (Left Side)
    { id: 'b4', type: 'apartment', name: 'Sky Garden', x: 20, z: 35, height: 120, width: 50, depth: 30, color: '#10B981', category: 'residential' },
    { id: 'b5', type: 'apartment', name: 'City View', x: 25, z: 50, height: 110, width: 45, depth: 35, color: '#059669', category: 'residential' },
    { id: 'b6', type: 'apartment', name: 'Riverside', x: 15, z: 60, height: 95, width: 40, depth: 30, color: '#047857', category: 'residential' },
    
    // Healthcare (Right Side)
    { id: 'h1', type: 'hospital', name: 'City General', x: 75, z: 35, height: 90, width: 60, depth: 40, color: '#EF4444', category: 'healthcare' },
    { id: 'h2', type: 'hospital', name: 'Children Medical', x: 80, z: 50, height: 85, width: 55, depth: 35, color: '#DC2626', category: 'healthcare' },
    
    // Education (Back-Left)
    { id: 'e1', type: 'university', name: 'City University', x: 30, z: 70, height: 100, width: 70, depth: 50, color: '#8B5CF6', category: 'education' },
    { id: 'e2', type: 'school', name: 'Smart High School', x: 45, z: 75, height: 70, width: 50, depth: 40, color: '#7C3AED', category: 'education' },
    
    // Government (Center-Back)
    { id: 'g1', type: 'government', name: 'City Hall', x: 55, z: 65, height: 110, width: 60, depth: 50, color: '#475569', category: 'government' },
    
    // Entertainment (Center-Front)
    { id: 'm1', type: 'mall', name: 'Metro Mall', x: 45, z: 15, height: 130, width: 80, depth: 60, color: '#EC4899', category: 'commercial' },
    { id: 't1', type: 'hotel', name: 'Grand Hotel', x: 65, z: 15, height: 140, width: 45, depth: 45, color: '#F59E0B', category: 'commercial' },
    
    // Infrastructure (Far Back)
    { id: 's1', type: 'stadium', name: 'City Stadium', x: 20, z: 85, height: 60, width: 100, depth: 80, color: '#0EA5E9', category: 'sports' },
    { id: 'a1', type: 'airport', name: 'International Airport', x: 75, z: 85, height: 40, width: 120, depth: 100, color: '#6B7280', category: 'transport' },
  ];

  // Parks and green spaces
  const parks = [
    { id: 'p1', name: 'Central Park', x: 35, z: 45, width: 80, depth: 60, type: 'central' },
    { id: 'p2', name: 'Riverside Park', x: 10, z: 40, width: 40, depth: 50, type: 'river' },
    { id: 'p3', name: 'Tech Garden', x: 70, z: 65, width: 50, depth: 40, type: 'garden' },
  ];

  // Road network (horizontal layout)
  const roads = [
    { type: 'highway', orientation: 'horizontal', position: 40, width: 12 },
    { type: 'highway', orientation: 'vertical', position: 50, width: 12 },
    { type: 'main', orientation: 'horizontal', position: 60, width: 8 },
    { type: 'main', orientation: 'vertical', position: 30, width: 8 },
    { type: 'main', orientation: 'vertical', position: 70, width: 8 },
  ];

  useEffect(() => {
    let interval;
    if (autoRotate) {
      interval = setInterval(() => {
        setRotation(prev => (prev + 0.2) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [autoRotate]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setZoom(prev => Math.max(0.5, Math.min(2.5, prev * delta)));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => (prev + deltaX * 0.3) % 360);
    setTilt(prev => Math.max(45, Math.min(85, prev + deltaY * 0.1)));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSensorClick = (sensor) => {
    onSensorSelect(sensor);
  };

  const handleBuildingHover = (building) => {
    setHoveredBuilding(building);
  };

  const getBuildingIcon = (type) => {
    const icons = {
      skyscraper: '🏢',
      apartment: '🏘️',
      hospital: '🏥',
      university: '🎓',
      school: '🏫',
      government: '🏛️',
      mall: '🛍️',
      hotel: '🏨',
      stadium: '🏟️',
      airport: '✈️',
    };
    return icons[type] || '🏠';
  };

  const getSensorIcon = (category) => {
    const icons = {
      traffic: '🚦',
      environment: '🌿',
      energy: '⚡',
      security: '🎥',
      waste: '🗑️',
      water: '💧',
      transport: '🚌',
    };
    return icons[category] || '📡';
  };

  // Filter sensors by view mode
  const filteredSensors = viewMode === 'all' 
    ? sensors 
    : sensors.filter(s => s.category === viewMode);

  return (
    <div 
      className="smart-city-scene-enhanced" 
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      ref={sceneRef}
      style={{ background: currentConfig.skyColor }}
    >
      <div 
        className="scene-3d-container"
        style={{ 
          transform: `
            perspective(2000px)
            rotateX(${tilt}deg)
            rotateY(${rotation}deg)
            scale(${zoom})
          `,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Ground Plane */}
        <div 
          className="ground-plane"
          style={{ background: currentConfig.groundColor }}
        >
          {/* Grid overlay */}
          <div className="grid-overlay"></div>
        </div>

        {/* District Labels */}
        <div className="district-markers">
          <div className="district-marker" style={{ left: '40%', top: '25%' }}>
            <span>Commercial District</span>
          </div>
          <div className="district-marker" style={{ left: '20%', top: '45%' }}>
            <span>Residential Area</span>
          </div>
          <div className="district-marker" style={{ left: '75%', top: '45%' }}>
            <span>Healthcare Zone</span>
          </div>
          <div className="district-marker" style={{ left: '35%', top: '72%' }}>
            <span>Education Campus</span>
          </div>
        </div>

        {/* Road Network */}
        {roads.map((road, idx) => (
          <div
            key={`road-${idx}`}
            className={`road-3d ${road.type} ${road.orientation}`}
            style={{
              [road.orientation === 'horizontal' ? 'top' : 'left']: `${road.position}%`,
              [road.orientation === 'horizontal' ? 'height' : 'width']: `${road.width}px`,
            }}
          >
            {/* Animated vehicles */}
            {idx < 3 && (
              <div className="vehicle" style={{ animationDelay: `${idx * 2}s` }}></div>
            )}
          </div>
        ))}

        {/* Parks */}
        {parks.map(park => (
          <div
            key={park.id}
            className={`park-3d ${park.type}`}
            style={{
              left: `${park.x}%`,
              top: `${park.z}%`,
              width: `${park.width}px`,
              height: `${park.depth}px`,
            }}
          >
            <div className="park-trees">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={`tree-${i}`} 
                  className="tree-3d"
                  style={{ 
                    left: `${(i * 13) % 90}%`, 
                    top: `${(i * 17) % 80}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                ></div>
              ))}
            </div>
            {park.type === 'central' && (
              <div className="park-lake"></div>
            )}
          </div>
        ))}

        {/* Buildings */}
        {buildings.map(building => (
          <div
            key={building.id}
            className={`building-3d ${building.type} ${hoveredBuilding?.id === building.id ? 'hovered' : ''}`}
            style={{
              left: `${building.x}%`,
              top: `${building.z}%`,
              width: `${building.width}px`,
              height: `${building.depth}px`,
            }}
            onMouseEnter={() => handleBuildingHover(building)}
            onMouseLeave={() => setHoveredBuilding(null)}
          >
            {/* Building structure */}
            <div 
              className="building-structure"
              style={{
                height: `${building.height}px`,
                backgroundColor: building.color,
              }}
            >
              {/* Windows grid */}
              <div className="windows-grid">
                {Array.from({ length: Math.floor(building.height / 12) }).map((_, floor) => (
                  <div key={`floor-${floor}`} className="floor">
                    {Array.from({ length: 4 }).map((_, window) => (
                      <div 
                        key={`window-${window}`} 
                        className="window-light"
                        style={{ animationDelay: `${(floor * 4 + window) * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Roof */}
              <div className="building-roof" style={{ backgroundColor: building.color }}></div>

              {/* Building icon on top */}
              <div className="building-top-icon">
                {getBuildingIcon(building.type)}
              </div>
            </div>

            {/* Upward Popup */}
            {hoveredBuilding?.id === building.id && (
              <div className="building-popup-up">
                <div className="popup-header">
                  <span className="popup-icon">{getBuildingIcon(building.type)}</span>
                  <h4>{building.name}</h4>
                </div>
                <div className="popup-content">
                  <div className="popup-row">
                    <span>Category:</span>
                    <strong>{building.category}</strong>
                  </div>
                  <div className="popup-row">
                    <span>Height:</span>
                    <strong>{building.height}m</strong>
                  </div>
                  <div className="popup-row">
                    <span>Area:</span>
                    <strong>{building.width * building.depth}m²</strong>
                  </div>
                  <div className="popup-row">
                    <span>Sensors:</span>
                    <strong className="sensor-count">
                      {filteredSensors.filter(s => 
                        Math.abs(s.x - building.x) < 15 && 
                        Math.abs(s.y - building.z) < 15
                      ).length}
                    </strong>
                  </div>
                  <div className="popup-row">
                    <span>Status:</span>
                    <strong className="status-active">● Active</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Sensors Layer */}
        {filteredSensors.map(sensor => (
          <div
            key={sensor.id}
            className={`sensor-marker-3d ${sensor.category} ${viewMode === 'all' || viewMode === sensor.category ? 'visible' : 'hidden'}`}
            style={{
              left: `${sensor.x}%`,
              top: `${sensor.y}%`,
              backgroundColor: sensor.color,
            }}
            onClick={() => handleSensorClick(sensor)}
            onMouseEnter={() => setHoveredSensor(sensor)}
            onMouseLeave={() => setHoveredSensor(null)}
          >
            <div className="sensor-icon-3d">{getSensorIcon(sensor.category)}</div>
            <div className="sensor-pulse-3d"></div>
            <div className="sensor-beam"></div>
            
            {/* Sensor hover popup (upward) */}
            {hoveredSensor?.id === sensor.id && (
              <div className="sensor-popup-up">
                <div className="sensor-popup-header">
                  <span>{getSensorIcon(sensor.category)}</span>
                  <strong>{sensor.name}</strong>
                </div>
                <div className="sensor-popup-id">{sensor.id}</div>
                <div className="sensor-popup-reading">{sensor.reading}</div>
                <div className="sensor-popup-battery">
                  🔋 {sensor.battery}%
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Railway/Metro */}
        {(cityType === 'metropolis' || cityType === 'industrial') && (
          <>
            <div className="railway-track" style={{ top: '70%' }}>
              <div className="train-3d"></div>
            </div>
            <div className="metro-line" style={{ left: '50%' }}>
              <div className="metro-train-3d"></div>
            </div>
          </>
        )}

        {/* Renewable Energy (Eco City) */}
        {cityType === 'eco' && (
          <>
            <div className="wind-turbines" style={{ left: '10%', top: '15%' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={`turbine-${i}`} 
                  className="wind-turbine-3d"
                  style={{ 
                    left: `${i * 30}px`,
                    animationDelay: `${i * 0.3}s`
                  }}
                ></div>
              ))}
            </div>
            <div className="solar-panels" style={{ right: '10%', top: '20%' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={`panel-${i}`} 
                  className="solar-panel-3d"
                  style={{ 
                    left: `${(i % 4) * 25}px`,
                    top: `${Math.floor(i / 4) * 25}px`,
                  }}
                ></div>
              ))}
            </div>
          </>
        )}

        {/* Water features (Coastal City) */}
        {cityType === 'coastal' && (
          <>
            <div className="harbor" style={{ left: '5%', top: '50%', width: '20%', height: '40%' }}>
              <div className="water-waves"></div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={`boat-${i}`} 
                  className="boat-3d"
                  style={{ animationDelay: `${i * 3}s` }}
                ></div>
              ))}
            </div>
            <div className="beach" style={{ left: '5%', top: '85%', width: '90%', height: '10%' }}>
              <div className="beach-sand"></div>
            </div>
          </>
        )}
      </div>

      {/* City Info Overlay */}
      <div className="city-info-overlay">
        <div className="city-name">
          <span className="city-icon">{
            cityType === 'metropolis' ? '🌃' :
            cityType === 'eco' ? '🌱' :
            cityType === 'industrial' ? '🏭' : '🏖️'
          }</span>
          {currentConfig.name}
        </div>
        <div className="city-stats-mini">
          <div className="stat-mini">
            <span className="stat-value">{buildings.length}</span>
            <span className="stat-label">Buildings</span>
          </div>
          <div className="stat-mini">
            <span className="stat-value">{sensors.length}</span>
            <span className="stat-label">Sensors</span>
          </div>
          <div className="stat-mini">
            <span className="stat-value">{filteredSensors.length}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="view-controls-3d">
        <button 
          className={`control-btn-3d ${autoRotate ? 'active' : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
          title="Auto Rotate"
        >
          ⟳
        </button>
        <button 
          className="control-btn-3d"
          onClick={() => { setRotation(0); setTilt(65); setZoom(1); }}
          title="Reset View"
        >
          🏠
        </button>
      </div>
    </div>
  );
};

export default SmartCity3DScene;