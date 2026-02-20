import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SkyBackgroundProps {
  bloomLevel: number;
}

export function SkyBackground({ bloomLevel }: SkyBackgroundProps) {
  const mesh = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBloomLevel: { value: 0 },
    uColorA1: { value: new THREE.Color('#0b1026') }, // Deep night blue
    uColorB1: { value: new THREE.Color('#2b32b2') }, // Lighter night blue
    uColorA2: { value: new THREE.Color('#4facfe') }, // Sky blue (day/bloom)
    uColorB2: { value: new THREE.Color('#f093fb') }, // Pink/Twilight (day/bloom)
  }), []);

  useFrame((state) => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      // Smoothly interpolate uniform
      material.uniforms.uBloomLevel.value = THREE.MathUtils.lerp(
        material.uniforms.uBloomLevel.value,
        bloomLevel,
        0.05
      );
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uBloomLevel;
    uniform vec3 uColorA1;
    uniform vec3 uColorB1;
    uniform vec3 uColorA2;
    uniform vec3 uColorB2;
    varying vec2 vUv;

    void main() {
      // Mix between Night (1) and Day (2) palettes based on bloomLevel
      vec3 colorA = mix(uColorA1, uColorA2, uBloomLevel);
      vec3 colorB = mix(uColorB1, uColorB2, uBloomLevel);

      // Gradient from bottom (0.0) to top (1.0)
      float noise = sin(vUv.y * 10.0 + uTime * 0.5) * 0.02; // Subtle movement
      vec3 finalColor = mix(colorA, colorB, vUv.y + noise);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  return (
    <mesh ref={mesh} position={[0, 0, -10]} scale={[40, 40, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
