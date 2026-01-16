import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import { Mesh, MathUtils } from 'three';
import { useTheme } from '../context/ThemeContext';

const HeroGazer: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  const { isDark } = useTheme();

  const solidColor = isDark ? '#60a5fa' : '#3b82f6'; // blue-400 or blue-500
  const wireColor = isDark ? '#ffffff' : '#1f2937'; // white or gray-800

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Constant slow spin
      meshRef.current.rotation.y += delta * 0.1;
      
      // Move towards mouse position (lerped for smoothness)
      const targetX = state.mouse.x * 2;
      const targetY = state.mouse.y * 2;

      meshRef.current.position.x = MathUtils.lerp(
        meshRef.current.position.x,
        targetX,
        0.05
      );
      meshRef.current.position.y = MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.05
      );
    }
  });

  return (
    <mesh ref={meshRef} scale={1.2}>
      {/* Inner solid shape */}
      <Icosahedron args={[2, 0]}>
        <meshStandardMaterial
          color={solidColor}
          transparent
          opacity={0.3}
          roughness={0.2}
          metalness={0.1}
        />
      </Icosahedron>
      {/* Outer wireframe */}
      <Icosahedron args={[2, 0]}>
        <meshStandardMaterial
          color={wireColor}
          wireframe
          roughness={0.5}
          metalness={0.5}
        />
      </Icosahedron>
    </mesh>
  );
};

export default HeroGazer;