import {
  CameraShake,
  Environment,
  OrbitControls,
  Sky,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MathUtils } from "three";
import { Butterfly } from "./Butterfly";
import { Grass } from "./Grass";
import { Particles } from "./Particles";

const rand = new Array(15).fill(0).map(() => ({
  position: [
    MathUtils.randFloat(0.5, 0.7),
    MathUtils.randFloat(0.5, 0.7),
    MathUtils.randFloat(0.5, 0.7),
  ],
  scale: MathUtils.randFloat(0.5, 1),
}));

import { useState } from "react";

const App = () => {
  const [flowerCount, setFlowerCount] = useState(6000);
  const [flowerScale, setFlowerScale] = useState(1.0);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 100,
          color: "white",
          fontFamily: "-apple-system, sans-serif",
          padding: "15px",
          background: "rgba(0,0,0,0.4)",
          borderRadius: "15px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          width: "240px",
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <label
            style={{ display: "block", fontSize: "0.8rem", marginBottom: 5 }}
          >
            Flowers: {flowerCount}
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={flowerCount}
            onChange={(e) => setFlowerCount(parseInt(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>
        <div>
          <label
            style={{ display: "block", fontSize: "0.8rem", marginBottom: 5 }}
          >
            Height: {flowerScale.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={flowerScale}
            onChange={(e) => setFlowerScale(parseFloat(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>
      </div>

      <Canvas
        dpr={1.5}
        camera={{ position: [1, -1.25, 1] }} //
      >
        <Environment preset="sunset" />

        <Grass flowerCount={flowerCount} flowerScale={flowerScale} />

        {rand.map((e, i) => (
          <Butterfly key={i} {...e} />
        ))}

        <Sky />
        <Particles />

        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.8} />
        <CameraShake maxRoll={0.2} maxPitch={0.2} maxYaw={0.2} />
      </Canvas>
    </>
  );
};

export default App;
