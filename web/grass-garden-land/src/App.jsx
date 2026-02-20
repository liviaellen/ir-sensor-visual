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
import { Land } from "./Land";
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
  const [sensorValue, setSensorValue] = useState(null);
  const [sensorMin, setSensorMin] = useState(20);
  const [sensorMax, setSensorMax] = useState(100);
  const [smoothingEnabled, setSmoothingEnabled] = useState(true);
  const [smoothingRate, setSmoothingRate] = useState(0.14);
  const [sensorSteps, setSensorSteps] = useState(5);
  const [flowerCount, setFlowerCount] = useState(6000);
  const [flowerScale, setFlowerScale] = useState(1.0);
  const [distanceScale, setDistanceScale] = useState(0.3);
  const targetDistanceRef = useRef(100);
  const distanceScaleRef = useRef(0.3);
  const targetFlowerScaleRef = useRef(flowerScale);
  const sensorRawRef = useRef(null);
  const latestSensorCmRef = useRef(null);
  const connectedRef = useRef(connected);
  const lastSensorUIRef = useRef(0);
  const lastBucketRef = useRef(null);

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
            // Do NOT update targetDistanceRef here — we don't want sensor to drive movement.
            // Instead, use the sensor to control flower height only.
            setSensorValue(d);
            // store latest raw cm reading; mapping will be sampled every 2s
            latestSensorCmRef.current = d;
            // update UI at most every 150ms or when integer value changes
            const now = Date.now();
            if (now - lastSensorUIRef.current > 150 || Math.abs((sensorValue||0) - d) >= 1) {
              lastSensorUIRef.current = now;
              setSensorValue(d);
            }
          }
        }
      });
      setConnected(true);
      setStatus("Connected ✓");
    } catch (err) {
      setStatus(err.message);
    }
  }, []);

  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

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

      // Smoothly lerp flowerScale toward the smoothed sensor target when connected.
      setFlowerScale((prev) => {
        if (!connectedRef.current || sensorRawRef.current == null) return prev; // keep slider/default when disconnected
        const rawTarget = sensorRawRef.current;
        // small-deadzone to avoid micro jitter
        if (Math.abs(rawTarget - prev) < 0.01) return prev;
        // lerp toward the raw target (this smooths noisy sensor inputs)
        const rate = smoothingEnabled ? smoothingRate : 1.0;
        return prev + (rawTarget - prev) * rate;
      });

      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Sample the latest sensor value every 2 seconds and map into discrete ranges
  useEffect(() => {
    const id = setInterval(() => {
      if (!connectedRef.current) return;
      const d = latestSensorCmRef.current;
      if (d == null) return;
      const minD = Math.min(sensorMin, sensorMax);
      const maxD = Math.max(sensorMin, sensorMax);
      const minScale = 2.7; // at minD
      const maxScale = 1.0; // at or above maxD
      const steps = Math.max(2, Math.round(sensorSteps));
      let level;
      if (d >= maxD) level = steps - 1;
      else if (d <= minD) level = 0;
      else {
        const t = (d - minD) / (maxD - minD);
        level = Math.round(t * (steps - 1));
      }
      // If bucket unchanged, skip updating to avoid redundant changes
      if (lastBucketRef.current === level) return;
      lastBucketRef.current = level;
      const qt = level / (steps - 1);
      const mapped = minScale - qt * (minScale - maxScale);
      sensorRawRef.current = mapped;
      if (!smoothingEnabled) setFlowerScale(mapped);
    }, 2000);
    return () => clearInterval(id);
  }, [sensorMin, sensorMax, smoothingEnabled, sensorSteps]);

  // Keyboard control removed: movement will use default distance only.

  const bloom = Math.max(0, Math.min(1, 1 - (distance - 20) / 80));

  return (
    <>
      {/* UI Overlay */}
      <div style={{
        position: "fixed", top: 20, left: 20, zIndex: 100,
        fontFamily: "-apple-system, sans-serif", color: "white",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 8 }}>
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

        </div>

        {/* Movement controls removed — using default movement only */}

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

          {/* Sensor mapping controls */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: "0.75rem", opacity: 0.8, marginBottom: 4 }}>
              Sensor Range (cm)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" min="5" max="1000" value={sensorMin}
                onChange={(e) => setSensorMin(parseFloat(e.target.value) || 20)}
                style={{ width: 80 }} />
              <input type="number" min="5" max="1000" value={sensorMax}
                onChange={(e) => setSensorMax(parseFloat(e.target.value) || 100)}
                style={{ width: 80 }} />
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: "0.75rem", opacity: 0.8 }}>Smoothing</label>
              <input type="checkbox" checked={smoothingEnabled} onChange={(e) => setSmoothingEnabled(e.target.checked)} />
              <label style={{ fontSize: "0.72rem", opacity: 0.6 }}>Rate</label>
              <input type="number" min="0.01" max="0.5" step="0.01" value={smoothingRate}
                onChange={(e) => setSmoothingRate(parseFloat(e.target.value) || 0.06)} style={{ width: 80 }} />
            </div>
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
        <div style={{ fontSize: "0.78rem", opacity: 0.7, marginTop: 6 }}>
          Sensor: {sensorValue === null ? "—" : `${sensorValue.toFixed(0)} cm`} {connected ? "(live)" : ""}
        </div>
      </div>

      <Canvas dpr={1.5} camera={{ position: [0, 3.2, 1.5], fov: 50 }}>
        <Environment preset="sunset" />

        <Land width={12} depth={12} segments={128} displacement={0.0} animate={false} />
        <Grass flowerCount={flowerCount} flowerScale={flowerScale} bloom={bloom} distanceScale={distanceScale} />

        {rand.map((e, i) => (
          <Butterfly key={i} {...e} />
        ))}

        <Sky />
        <Particles />

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          // small tilt only — keep near top-down
          minPolarAngle={Math.PI / 2 - 0.18}
          maxPolarAngle={Math.PI / 2 - 0.03}
          enablePan={true}
          enableRotate={false}
        />
        <CameraShake maxRoll={0} maxPitch={0} maxYaw={0} intensity={0} />
      </Canvas>
    </>
  );
};

export default App;
