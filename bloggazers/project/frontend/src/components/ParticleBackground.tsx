import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { MathUtils, Group } from 'three';
import { useTheme } from '../context/ThemeContext';

interface ParticlesProps {
  count: number;
}

const Particles: React.FC<ParticlesProps> = ({ count }) => {
  const pointsRef = useRef<Group>(null);
  const { isDark } = useTheme();
  const particleColor = isDark ? '#60a5fa' : '#3b82f6'; // blue-400 or blue-500

  // Generate random positions for particles
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      // Spread particles in a sphere
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.33) * 7; // Cube root for even distribution
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count]);

  // Animation loop
  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Slow constant rotation
      pointsRef.current.rotation.y += delta * 0.02;

      // Lerp rotation towards mouse position for a smooth interactive effect
      const targetX = state.mouse.y * 0.1;
      const targetY = state.mouse.x * 0.1;

      pointsRef.current.rotation.x = MathUtils.lerp(
        pointsRef.current.rotation.x,
        targetX,
        0.05
      );
      pointsRef.current.rotation.y = MathUtils.lerp(
        pointsRef.current.rotation.y,
        pointsRef.current.rotation.y + targetY, // Add to existing rotation
        0.02
      );
    }
  });

  return (
    <group ref={pointsRef}>
      <Points positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={particleColor}
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const ParticleBackground: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 1] }}>
      <Suspense fallback={null}>
        <Particles count={5000} />
      </Suspense>
    </Canvas>
  );
};

export default ParticleBackground;