import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import Perlin from "perlin.js";

Perlin.seed(Math.random());

export function Land({ width = 6, depth = 6, segments = 128, displacement = 0.6, animate = true }) {
  const meshRef = useRef();
  // build geometry once
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, depth, segments, segments);
    // rotate so plane faces up
    g.rotateX(-Math.PI / 2);

    // store base positions for animation
    const pos = g.attributes.position.array;
    const base = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) {
      base[i] = pos[i];
      base[i + 1] = pos[i + 1];
      base[i + 2] = pos[i + 2];
    }
    g.userData.base = base;

    // initial displacement using 2D noise
    const scale = 0.8 / Math.max(width, depth);
    for (let i = 0; i < pos.length; i += 3) {
      const x = base[i];
      const z = base[i + 2];
      const n = Perlin.simplex2(x * scale * 3, z * scale * 3);
      pos[i + 1] = n * displacement; // Y is up after rotateX
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
      const base = g.userData.base;
      const t = frame * 0.01;
      const scale = 0.8 / Math.max(width, depth);
      for (let i = 0; i < pos.length; i += 3) {
        const x = base[i];
        const z = base[i + 2];
        // subtle moving waves with 3D noise
        const n = Perlin.simplex3(x * scale * 3, z * scale * 3, t);
        pos[i + 1] = n * displacement * 0.9;
      }
      g.attributes.position.needsUpdate = true;
      g.computeVertexNormals();
      // schedule next frame (loose timing, not tied to RAF here)
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
        roughness={0.05}
        transmission={0.6}
        thickness={0.5}
        color={0xaaddff}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default Land;
