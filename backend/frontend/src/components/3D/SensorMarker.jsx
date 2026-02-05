import React, { useRef, useState } from 'react';
import { Sphere, Html, Text } from '@react-three/drei';
import * as THREE from 'three';

const SensorMarker = ({ sensor, isSelected, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const getSensorColor = (type) => {
    const colors = {
      traffic: '#3B82F6',
      environment: '#10B981',
      energy: '#F59E0B',
      security: '#EF4444',
      waste: '#8B5CF6'
    };
    return colors[type] || '#6B7280';
  };

  const getSensorIcon = (type) => {
    const icons = {
      traffic: '🚦',
      environment: '🌿',
      energy: '⚡',
      security: '🎥',
      waste: '🗑️'
    };
    return icons[type] || '📡';
  };

  const pulseAnimation = (time) => {
    if (meshRef.current) {
      const scale = 1 + 0.1 * Math.sin(time * 3);
      meshRef.current.scale.set(scale, scale, scale);
    }
  };

  return (
    <group
      position={[sensor.position.x, sensor.position.y, sensor.position.z]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Sphere
        ref={meshRef}
        args={[1, 16, 16]}
      >
        <meshStandardMaterial
          color={getSensorColor(sensor.type)}
          emissive={isSelected ? getSensorColor(sensor.type) : '#000000'}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Connection line to ground */}
      <mesh position={[0, -sensor.position.y / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, sensor.position.y, 8]} />
        <meshStandardMaterial color="#9CA3AF" />
      </mesh>

      {/* Floating label */}
      {(hovered || isSelected) && (
        <Html distanceFactor={10}>
          <div className="sensor-label">
            <div className="sensor-label-content">
              <span className="sensor-icon">{getSensorIcon(sensor.type)}</span>
              <span className="sensor-name">{sensor.name}</span>
            </div>
          </div>
        </Html>
      )}

      {/* 3D Text label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {sensor.id}
      </Text>
    </group>
  );
};

export default SensorMarker;