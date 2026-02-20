import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RainProps {
  bloomLevel: number;
}

export function Rain({ bloomLevel }: RainProps) {
  const count = 1500;
  const mesh = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 25; // x - wider spread
      temp[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      temp[i * 3 + 2] = (Math.random() - 0.5) * 15; // z
    }
    return temp;
  }, []);

  useFrame((_, delta) => {
    if (!mesh.current) return;

    // Wind effect increases with bloom? Or decreases?
    // Let's say wind is strong when alone (stormy), gentle when together.
    const windStrength = 2.0 * (1 - bloomLevel);
    const speed = 8 * (1 - bloomLevel * 0.5); // Slower when bloom is high

    const positions = mesh.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Move down and slightly sideways (wind)
      positions[i * 3] += windStrength * delta * 0.5; // Wind X
      positions[i * 3 + 1] -= speed * delta; // Gravity Y

      // Reset
      if (positions[i * 3 + 1] < -10) {
        positions[i * 3 + 1] = 10;
        positions[i * 3] = (Math.random() - 0.5) * 25 - (windStrength * 2); // Respawn upwind
      }
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  // Rain is white/silver, fading to gold
  const color = new THREE.Color().lerpColors(
    new THREE.Color('#aaccff'), // Light blue/silver
    new THREE.Color('#fff7e6'), // Warm white
    bloomLevel
  );

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending} // Glowy rain
      />
    </points>
  );
}
