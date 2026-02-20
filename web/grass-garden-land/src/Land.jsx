import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import Perlin from "perlin.js";

Perlin.seed(Math.random());

export function Land({ width = 12, depth = 12, segments = 128, displacement = 0.0, animate = false }) {
  const meshRef = useRef();
  // build geometry once
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, depth, segments, segments);
    // rotate so plane faces up
    g.rotateX(-Math.PI / 2);

    // compute small noise-based variation (very subtle) if needed
    const pos = g.attributes.position.array;
    const scale = 0.8 / Math.max(width, depth);
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const z = pos[i + 2];
      const n = Perlin.simplex2(x * scale * 0.2, z * scale * 0.2);
      pos[i + 1] = n * displacement;
    }

    g.computeVertexNormals();
    return g;
  }, [width, depth, segments, displacement]);

  useEffect(() => {
    if (!animate) return;
    let frame = 0;
    const tick = () => {
      frame += 1;
      const g = geom;
      const pos = g.attributes.position.array;
      const t = frame * 0.01;
      const scale = 0.8 / Math.max(width, depth);
      for (let i = 0; i < pos.length; i += 3) {
        const x = pos[i];
        const z = pos[i + 2];
        const n = Perlin.simplex3(x * scale * 3, z * scale * 3, t);
        pos[i + 1] = n * displacement * 0.9;
      }
      g.attributes.position.needsUpdate = true;
      g.computeVertexNormals();
      setTimeout(tick, 40);
    };
    const id = setTimeout(tick, 40);
    return () => clearTimeout(id);
  }, [geom, animate, width, depth, displacement]);

  return (
    <mesh ref={meshRef} geometry={geom} receiveShadow castShadow>
      <meshPhysicalMaterial
        clearcoat={0.6}
        metalness={0.0}
        roughness={0.35}
        transmission={0.0}
        thickness={0.0}
        color={0x7bb36a}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default Land;
