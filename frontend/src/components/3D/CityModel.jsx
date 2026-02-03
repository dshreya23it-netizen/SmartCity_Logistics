import React, { useMemo } from 'react';
import { Box, Cylinder, Sphere, Torus, Text } from '@react-three/drei';
import * as THREE from 'three';

const CityModel = ({ cityType }) => {
  const buildings = useMemo(() => {
    const buildingConfigs = [];
    
    if (cityType === 'metropolis') {
      // Create a modern metropolis
      for (let i = 0; i < 20; i++) {
        const height = 5 + Math.random() * 15;
        const width = 2 + Math.random() * 4;
        const depth = 2 + Math.random() * 4;
        const x = -20 + Math.random() * 40;
        const z = -20 + Math.random() * 40;
        
        buildingConfigs.push({
          position: [x, height / 2, z],
          size: [width, height, depth],
          color: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#93c5fd' : '#d1d5db'
        });
      }
    } else {
      // Create eco city with green buildings
      for (let i = 0; i < 15; i++) {
        const height = 3 + Math.random() * 8;
        const width = 3 + Math.random() * 3;
        const depth = 3 + Math.random() * 3;
        const x = -15 + Math.random() * 30;
        const z = -15 + Math.random() * 30;
        
        buildingConfigs.push({
          position: [x, height / 2, z],
          size: [width, height, depth],
          color: i % 2 === 0 ? '#86efac' : '#4ade80'
        });
      }
    }
    
    return buildingConfigs;
  }, [cityType]);

  const roads = useMemo(() => {
    const roadConfigs = [];
    
    // Main roads
    roadConfigs.push(
      { position: [0, 0.1, 0], size: [40, 0.2, 3], rotation: [0, 0, 0], color: '#4b5563' },
      { position: [0, 0.1, 0], size: [3, 0.2, 40], rotation: [0, 0, 0], color: '#4b5563' }
    );
    
    // Smaller roads
    for (let i = -15; i <= 15; i += 10) {
      if (i !== 0) {
        roadConfigs.push(
          { position: [i, 0.1, 0], size: [2, 0.2, 30], rotation: [0, 0, 0], color: '#6b7280' },
          { position: [0, 0.1, i], size: [30, 0.2, 2], rotation: [0, 0, 0], color: '#6b7280' }
        );
      }
    }
    
    return roadConfigs;
  }, []);

  return (
    <group>
      {/* Ground */}
      <Box
        position={[0, -0.5, 0]}
        args={[100, 1, 100]}
        receiveShadow
      >
        <meshStandardMaterial color={cityType === 'eco' ? '#166534' : '#374151'} />
      </Box>

      {/* Roads */}
      {roads.map((road, index) => (
        <Box
          key={`road-${index}`}
          position={road.position}
          args={road.size}
          rotation={road.rotation}
        >
          <meshStandardMaterial color={road.color} />
        </Box>
      ))}

      {/* Buildings */}
      {buildings.map((building, index) => (
        <Box
          key={`building-${index}`}
          position={building.position}
          args={building.size}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={building.color} />
          {index % 5 === 0 && (
            <Text
              position={[0, building.size[1] / 2 + 1, 0]}
              fontSize={1}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {cityType === 'metropolis' ? '🏢' : '🌳'}
            </Text>
          )}
        </Box>
      ))}

      {/* City Center */}
      <group position={[0, 0, 0]}>
        <Cylinder
          position={[0, 2, 0]}
          args={[5, 3, 4, 8]}
          castShadow
        >
          <meshStandardMaterial color="#fbbf24" />
        </Cylinder>
        
        <Text
          position={[0, 6, 0]}
          fontSize={2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {cityType === 'metropolis' ? '🏙️' : '🌱'}
        </Text>
      </group>

      {/* Park/Green Area */}
      <Box
        position={[15, 0.1, 15]}
        args={[20, 0.2, 20]}
        receiveShadow
      >
        <meshStandardMaterial color="#15803d" />
      </Box>

      {/* Solar Panels for eco city */}
      {cityType === 'eco' && (
        <group position={[10, 3, 10]}>
          <Box
            position={[0, 0, 0]}
            args={[8, 0.1, 8]}
            rotation={[Math.PI / 4, 0, 0]}
          >
            <meshStandardMaterial color="#fde047" />
          </Box>
          <Cylinder
            position={[0, -2, 0]}
            args={[0.2, 0.2, 4]}
          >
            <meshStandardMaterial color="#78716c" />
          </Cylinder>
        </group>
      )}
    </group>
  );
};

export default CityModel;