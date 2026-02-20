import { Sampler } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { Depth, LayerMaterial } from "lamina";
import Perlin from "perlin.js";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BlobGeometry } from "./BlobGeometry";
import { Flower } from "./Flower";
import WindLayer from "./WindLayer";

Perlin.seed(Math.random());
extend({ WindLayer });

export function Grass({ children, strands = 60000, flowerCount = 6000, flowerScale = 1.0, bloom = 0, distanceScale = 1.0, ...props }) {
  const meshRef = useRef(null);
  const windLayer = useRef(null);
  const flowerRef = useRef();
  const flowerGroupRef = useRef();
  const flowerScaleRef = useRef(flowerScale);
  const bloomRef = useRef(bloom);
  const distanceScaleRef = useRef(distanceScale);

  useEffect(() => {
    flowerScaleRef.current = flowerScale;
  }, [flowerScale]);

  useEffect(() => {
    bloomRef.current = bloom;
  }, [bloom]);

  useEffect(() => {
    distanceScaleRef.current = distanceScale;
  }, [distanceScale]);

  // NOTE: For the flat-land variant we skip applying extra rotation/translation
  // to the geometry here – the BlobGeometry returns a flat plane already oriented up.

  const geomRef = useRef();
  useFrame(() => {
    if (windLayer.current) windLayer.current.time += 0.005;
    if (windLayer.current) windLayer.current.time += 0.005;
    // Drive sway and length with bloom for extra life (original demo behavior)
    if (windLayer.current) {
      windLayer.current.sway = 0.5 + bloomRef.current * 0.8;
      windLayer.current.length = 1.2 + bloomRef.current * 0.4;
    }

    // Smoothly animate the flower group scale toward distanceScale each frame.
    // Y (height) lags slightly behind X/Z for a natural "growing" feel.
    if (flowerGroupRef.current) {
      const ds = distanceScaleRef.current;
      const g = flowerGroupRef.current;
      // X and Z: lateral size — lerp at 0.06
      g.scale.x += (ds - g.scale.x) * 0.06;
      g.scale.z += (ds - g.scale.z) * 0.06;
      // Y: height — slightly slower (0.04) so flowers grow up with a gentle delay
      g.scale.y += (ds - g.scale.y) * 0.04;
    }
  });

  return (
    <>
      <BlobGeometry ref={geomRef} />
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, strands]}
        {...props}
      >
        <coneGeometry args={[0.05, 1.0, 2, 20, false, 0, Math.PI]} />
        <LayerMaterial
          side={THREE.DoubleSide}
          lighting="physical"
          envMapIntensity={1}
        >
          <Depth
            colorA="#221600"
            colorB="#ade266"
            near={0.14}
            far={1.52}
            mapping={"world"}
          />
          <windLayer
            args={[{ mode: "multiply" }]}
            colorA={"#ffffff"}
            colorB={"#acf5ce"}
            noiseScale={10}
            noiseStrength={5}
            length={1.2}
            sway={0.5}
            ref={windLayer}
          />
        </LayerMaterial>
      </instancedMesh>
      <Flower ref={flowerRef} />

      {/* Grass strands sampler — not scaled by distance */}
      <Sampler
        count={strands}
        transform={({ position, normal, dummy: object }) => {
          const p = position.clone().multiplyScalar(5);
          const n = Perlin.simplex3(...p.toArray());
          object.scale.setScalar(
            THREE.MathUtils.mapLinear(n, -1, 1, 0.3, 1) * 0.1
          );
          object.position.copy(position);
          object.lookAt(normal.add(position));
          object.rotation.y += Math.random() - 0.5 * (Math.PI * 0.5);
          object.rotation.z += Math.random() - 0.5 * (Math.PI * 0.5);
          object.rotation.x += Math.random() - 0.5 * (Math.PI * 0.5);
          object.updateMatrix();
          return object;
        }}
        mesh={geomRef}
        instances={meshRef}
      />

      {/* Flower group — scaled by flowerScale-derived targets each frame via useFrame */}
      {/* X/Z (width) and Y (height) lerp at different rates for organic feel */}
      <group ref={flowerGroupRef}>
        <Sampler
          key={`${flowerCount}-${flowerScale}`}
          count={flowerCount}
          transform={({ position, normal, dummy: object }) => {
            object.scale.setScalar(Math.random() * 0.0075 * flowerScale);
            object.position.copy(position);
            object.lookAt(normal.add(position));
            object.rotation.y += Math.random() - 0.5 * (Math.PI * 0.5);
            object.rotation.x += Math.random() - 0.5 * (Math.PI * 0.5);
            object.rotation.z += Math.random() - 0.5 * (Math.PI * 0.5);
            object.updateMatrix();
            return object;
          }}
          mesh={geomRef}
          instances={flowerRef}
          weight="density"
        />
      </group>
    </>
  );
}

export default Grass;
