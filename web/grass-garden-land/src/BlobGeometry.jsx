import Perlin from "perlin.js";
import React, { forwardRef, useMemo } from "react";
import * as THREE from "three";

Perlin.seed(Math.random());

const computeFlowerDensity = (geometry) => {
  const position = geometry.getAttribute("position");
  const density = [];
  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    // For a flat plane the relevant coords are x (vertex.x) and z (vertex.z)
    const x = vertex.x;
    const z = vertex.z || 0;
    const n = Perlin.simplex2(x * 0.5, z * 0.5);
    let m = THREE.MathUtils.mapLinear(n, -1, 1, 0, 1);
    // reduce density in high areas so flowers cluster in lower noise values
    if (m > 0.7) m = 0;
    density.push(m);
  }
  return new THREE.Float32BufferAttribute(density, 1);
};

export const BlobGeometry = forwardRef((props, ref) => {
  const geomery = useMemo(() => {
    // Create a flat plane geometry (acts as "blob" replacement)
    const width = props.width || 6;
    const depth = props.depth || 6;
    const segments = props.segments || 128;
    const geom = new THREE.PlaneGeometry(width, depth, segments, segments);

    // Rotate so plane faces up (Y is up)
    geom.rotateX(-Math.PI / 2);

    // compute density attribute used by Sampler
    const desnity = computeFlowerDensity(geom);
    geom.setAttribute("density", desnity);
    geom.computeVertexNormals();
    return geom;
  }, [props.width, props.depth, props.segments]);

  return (
    <mesh ref={ref} geometry={geomery}>
      <meshBasicMaterial color="#221600" />
    </mesh>
  );
});

export default BlobGeometry;
