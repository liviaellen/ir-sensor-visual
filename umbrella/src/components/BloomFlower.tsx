import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

interface BloomFlowerProps {
  bloomLevel: number;
}

export function BloomFlower({ bloomLevel }: BloomFlowerProps) {
  const group = useRef<THREE.Group>(null!);


  // Procedurally generate a 3-step gradient map for toon shading
  const gradientMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 4, 0);
      gradient.addColorStop(0, '#555'); // Shadow
      gradient.addColorStop(0.5, '#aaa'); // Midtone
      gradient.addColorStop(1, '#fff'); // Highlight
      context.fillStyle = gradient;
      context.fillRect(0, 0, 4, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    // Gentle floating
    group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    group.current.rotation.y += 0.005;
  });

  const scale = 0.5 + bloomLevel * 2.0;

  // Ghibli Palette: Soft Pink -> Bright White/Gold
  // Use HSL for better transitions? Or just mix RGB.
  const baseColor = new THREE.Color().lerpColors(
    new THREE.Color('#ff9a9e'), // Soft Peach/Pink
    new THREE.Color('#fecfef'), // Light Pink
    bloomLevel
  );

  return (
    <group ref={group} scale={[scale, scale, scale]}>
      {/* Core */}
      <Sphere args={[0.6, 32, 32]}>
        <meshToonMaterial
          color={baseColor}
          gradientMap={gradientMap}
          emissive={baseColor}
          emissiveIntensity={bloomLevel * 0.5}
        />
      </Sphere>

      {/* Petals - Torus Knots for organic shape */}
      {[...Array(5)].map((_, i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <group rotation={[bloomLevel * 0.5, 0, 0]}> {/* Open up */}
            <TorusKnot args={[0.4, 0.15, 64, 8, 2, 3]} position={[0.8, 0, 0]} rotation={[0, 0, 1.5]}>
              <meshToonMaterial
                color={baseColor}
                gradientMap={gradientMap}
              />
            </TorusKnot>
          </group>
        </group>
      ))}

      {/* "Spirit" Particles - Tiny floating spheres around the flower */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={new Float32Array(150).fill(0).map(() => (Math.random() - 0.5) * 4)}
            itemSize={3}
            args={[new Float32Array(150).fill(0).map(() => (Math.random() - 0.5) * 4), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#fff"
          transparent
          opacity={bloomLevel} // Only visible when blooming
        />
      </points>
    </group>
  );
}
