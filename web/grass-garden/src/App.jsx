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
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import "./styles.css";

// BLE config
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

const rand = new Array(15).fill(0).map(() => ({
  position: [
    MathUtils.randFloat(0.5, 0.7),
    MathUtils.randFloat(0.5, 0.7),
    MathUtils.randFloat(0.5, 0.7),
  ],
  scale: MathUtils.randFloat(0.5, 1),
}));

// smoothstep: eases in and out — avoids the robotic feel of linear
function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

const App = () => {
  const [distance, setDistance] = useState(100);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Press Connect or use ↑↓ keys");
  const [flowerCount, setFlowerCount] = useState(6000);
  const [flowerScale, setFlowerScale] = useState(1.0);
  const [distanceScale, setDistanceScale] = useState(0.3);
  const targetDistanceRef = useRef(100);
  const distanceScaleRef = useRef(0.3);

  const connectBLE = useCallback(async () => {
    try {
      setStatus("Connecting…");
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "Adafruit" }],
        optionalServices: [UART_SERVICE_UUID],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(UART_SERVICE_UUID);
      const rx = await service.getCharacteristic(UART_RX_UUID);
      await rx.startNotifications();
      rx.addEventListener("characteristicvaluechanged", (e) => {
        const data = new TextDecoder().decode(e.target.value);
        if (data.startsWith("D:")) {
          const value = parseFloat(data.substring(2));
          if (!isNaN(value) && isFinite(value)) {
            const d = Math.max(20, Math.min(150, value));
            targetDistanceRef.current = d;
          }
        }
      });
      setConnected(true);
      setStatus("Connected ✓");
    } catch (err) {
      setStatus(err.message);
    }
  }, []);

  // Smooth distance animation + distanceScale animation
  useEffect(() => {
    let frame;
    const animate = () => {
      setDistance((prev) => {
        const next = prev + (targetDistanceRef.current - prev) * 0.05;
        return Math.abs(next - targetDistanceRef.current) < 0.1
          ? targetDistanceRef.current
          : next;
      });

      // distanceScale: smoothstep-eased 0.3 (far) → 1.0 (close)
      // Uses a separate lerp so it can move at its own rate (slower = more organic)
      setDistanceScale((prev) => {
        const rawBloom = Math.max(0, Math.min(1, 1 - (targetDistanceRef.current - 20) / 80));
        const eased = smoothstep(rawBloom);
        const target = 0.3 + eased * 0.7; // maps 0→0.3, 1→1.0
        const next = prev + (target - prev) * 0.04; // slower lerp for organic feel
        distanceScaleRef.current = next;
        return next;
      });

      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Keyboard control
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowUp")
        targetDistanceRef.current = Math.max(
          20,
          targetDistanceRef.current - 5
        );
      if (e.key === "ArrowDown")
        targetDistanceRef.current = Math.min(
          150,
          targetDistanceRef.current + 5
        );
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const bloom = Math.max(0, Math.min(1, 1 - (distance - 20) / 80));

  return (
    <>
      {/* UI Overlay */}
      <div style={{
        position: "fixed", top: 20, left: 20, zIndex: 100,
        fontFamily: "-apple-system, sans-serif", color: "white",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <button
          onClick={connectBLE}
          disabled={connected}
          style={{
            padding: "10px 22px", fontSize: "0.95rem",
            border: "2px solid rgba(255,255,255,0.25)",
            borderRadius: 25, background: "rgba(0,0,0,0.45)",
            color: "white", cursor: connected ? "default" : "pointer",
            backdropFilter: "blur(12px)", transition: "background 0.2s",
          }}
        >
          {connected ? "✓ Connected" : "Connect Sensor"}
        </button>

        <div style={{
          padding: "14px 16px", background: "rgba(0,0,0,0.4)",
          borderRadius: 15, backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", width: 230,
        }}>
          {/* Bluetooth sensor controls flower height (overrides slider when connected) */}

          {/* Bluetooth sensor now controls flower height; distance scale removed */}

          {/* Flower count slider */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.8, marginBottom: 4 }}>
              Flowers: {flowerCount}
            </label>
            <input type="range" min="0" max="12000" step="200"
              value={flowerCount}
              onChange={(e) => setFlowerCount(parseInt(e.target.value))}
              style={{ width: "100%", cursor: "pointer", accentColor: "#ff88aa" }}
            />
          </div>

          {/* Flower height slider */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.8, marginBottom: 4 }}>
              Flower Height: {flowerScale.toFixed(1)}x
            </label>
            <input type="range" min="0.1" max="3.0" step="0.1"
              value={flowerScale}
              onChange={(e) => setFlowerScale(parseFloat(e.target.value))}
              style={{ width: "100%", cursor: "pointer", accentColor: "#ff88aa" }}
            />
          </div>
        </div>

        <div style={{ fontSize: "0.78rem", opacity: 0.5 }}>{status}</div>
      </div>

      <Canvas dpr={1.5} camera={{ position: [1, -1.25, 1] }}>
        <Environment preset="sunset" />

        <Grass flowerCount={flowerCount} flowerScale={flowerScale} bloom={bloom} distanceScale={distanceScale} />

        {rand.map((e, i) => (
          <Butterfly key={i} {...e} />
        ))}

        <Sky />
        <Particles />

        {(() => {
          const norm = Math.max(0, Math.min(1, (flowerScale - 0.1) / (3.0 - 0.1)));
          return (
            <>
              <OrbitControls makeDefault autoRotate autoRotateSpeed={0.8 + bloom * 1.2} />
              <CameraShake maxRoll={0.2} maxPitch={0.2} maxYaw={0.2} intensity={0.5 + bloom * 0.5} />
            </>
          );
        })()}
      </Canvas>
    </>
  );
};

export default App;
