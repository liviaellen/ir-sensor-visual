import {
  CameraShake,
  Environment,
  OrbitControls,
  Sky,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { useState, useRef, memo } from "react";
import { Butterfly } from "./Butterfly";
import { Grass } from "./Grass";
import { Particles } from "./Particles";

// Nordic UART Service UUIDs (Adafruit Bluefruit)
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_UUID      = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

const rand = new Array(15).fill(0).map(() => ({
  position: [
    MathUtils.randFloat(0.5, 0.7),
    MathUtils.randFloat(0.5, 0.7),
    MathUtils.randFloat(0.5, 0.7),
  ],
  scale: MathUtils.randFloat(0.5, 1),
}));

// Reads gyroZ ref every frame and spins the camera azimuth accordingly
function BLERotator({ gyroZRef, controlsRef }) {
  useFrame((_, dt) => {
    if (!controlsRef.current || !gyroZRef.current) return;
    const angle = controlsRef.current.getAzimuthalAngle();
    controlsRef.current.setAzimuthalAngle(angle - gyroZRef.current * dt * (Math.PI / 180) * 2.5);
    controlsRef.current.update();
  });
  return null;
}

// Memoized — only receives stable refs so never re-renders when sliders change
const CameraRig = memo(({ controlsRef, gyroZRef }) => (
  <>
    <OrbitControls ref={controlsRef} makeDefault autoRotate autoRotateSpeed={0.8} />
    <CameraShake maxRoll={0.2} maxPitch={0.2} maxYaw={0.2} />
    <BLERotator gyroZRef={gyroZRef} controlsRef={controlsRef} />
  </>
));

// Memoized — no props so never re-renders
const StaticScene = memo(() => (
  <>
    <Environment preset="sunset" />
    <Sky />
    <Particles />
    {rand.map((e, i) => <Butterfly key={i} {...e} />)}
  </>
));

const App = () => {
  const [flowerCount, setFlowerCount]   = useState(6000);
  const [rotateY, setRotateY]           = useState(0);
  const flowerScaleRef                  = useRef(1.0);
  const flowerScaleLabelRef             = useRef();
  const [bleConnected, setBleConnected] = useState(false);
  const irDisplayRef = useRef();

  const controlsRef = useRef();
  const gyroZRef    = useRef(0);   // latest GZ from BLE — no re-render needed
  const deviceRef   = useRef(null);
  const bufferRef   = useRef("");

  // Parse "D:45.2,AX:0.01,...,GZ:1.5,..." → { D, AX, GZ, ... }
  function parsePacket(raw) {
    const data = {};
    raw.split(",").forEach(part => {
      const [key, val] = part.split(":");
      if (key && val !== undefined) data[key.trim()] = parseFloat(val);
    });
    return data;
  }

  function handleData(event) {
    bufferRef.current += new TextDecoder().decode(event.target.value);
    const lines = bufferRef.current.split("\n");
    bufferRef.current = lines.pop();
    lines.forEach(line => {
      line = line.trim();
      if (!line.includes("GZ:")) return;
      const d = parsePacket(line);
      if (!isNaN(d.GZ)) gyroZRef.current = d.GZ;
      if (!isNaN(d.D) && irDisplayRef.current) irDisplayRef.current.textContent = d.D.toFixed(1);
    });
  }

  async function connectBLE() {
    try {
      if (deviceRef.current && deviceRef.current.gatt.connected) {
        deviceRef.current.gatt.disconnect();
        return;
      }
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "Adafruit" }],
        optionalServices: [UART_SERVICE_UUID],
      });
      deviceRef.current = device;
      device.addEventListener("gattserverdisconnected", () => {
        setBleConnected(false);
        gyroZRef.current = 0;
      });
      const server  = await device.gatt.connect();
      const service = await server.getPrimaryService(UART_SERVICE_UUID);
      const rx      = await service.getCharacteristic(UART_RX_UUID);
      await rx.startNotifications();
      rx.addEventListener("characteristicvaluechanged", handleData);
      setBleConnected(true);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      {/* top-left controls */}
      <div style={{
        position: "fixed", top: 20, left: 20, zIndex: 100,
        color: "white", fontFamily: "-apple-system, sans-serif",
        padding: "15px", background: "rgba(0,0,0,0.4)",
        borderRadius: "15px", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)", width: "240px",
      }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: 5 }}>
            Flowers: {flowerCount}
          </label>
          <input type="range" min="0" max="10000" step="100"
            value={flowerCount}
            onChange={(e) => setFlowerCount(parseInt(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: 5 }}>
            Height: <span ref={flowerScaleLabelRef}>1.0</span>x
          </label>
          <input type="range" min="0.1" max="3.0" step="0.1"
            defaultValue={1.0}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              flowerScaleRef.current = v;
              if (flowerScaleLabelRef.current) flowerScaleLabelRef.current.textContent = v.toFixed(1);
            }}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>
      </div>

      {/* IR distance — bottom right */}
      {bleConnected && (
        <div style={{
          position: "fixed", bottom: 30, right: 20, zIndex: 100,
          color: "white", fontFamily: "-apple-system, sans-serif",
          padding: "14px 20px", background: "rgba(0,0,0,0.4)",
          borderRadius: "16px", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "0.7rem", opacity: 0.5, marginBottom: 4 }}>IR DISTANCE</div>
          <div ref={irDisplayRef} style={{ fontSize: "2.4rem", fontWeight: 700, lineHeight: 1 }}>
            --
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.5, marginTop: 4 }}>cm</div>
        </div>
      )}

      {/* BLE connect button — top right */}
      <button onClick={connectBLE} style={{
        position: "fixed", top: 20, right: 20, zIndex: 100,
        padding: "10px 20px", fontSize: "0.85rem", border: "none",
        borderRadius: "20px", cursor: "pointer", fontWeight: 600,
        background: bleConnected ? "rgba(0,200,100,0.35)" : "rgba(0,198,255,0.25)",
        color: "white", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}>
        {bleConnected ? "● BLE connected" : "Connect BLE"}
      </button>

      {/* bottom rotation slider */}
      <div style={{
        position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
        zIndex: 100, color: "white", fontFamily: "-apple-system, sans-serif",
        padding: "14px 24px", background: "rgba(0,0,0,0.4)",
        borderRadius: "40px", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", gap: "14px", width: "340px",
      }}>
        <span style={{ fontSize: "1.1rem" }}>🌍</span>
        <input type="range" min="0" max="360" step="1"
          value={rotateY}
          onChange={(e) => {
            const deg = parseFloat(e.target.value);
            setRotateY(deg);
            if (controlsRef.current) {
              controlsRef.current.setAzimuthalAngle(-deg * (Math.PI / 180));
              controlsRef.current.update();
            }
          }}
          style={{ flex: 1, cursor: "grab", accentColor: "#00c6ff" }}
        />
        <span style={{ fontSize: "0.8rem", opacity: 0.6, width: "38px", textAlign: "right" }}>
          {rotateY}°
        </span>
      </div>

      <Canvas dpr={1.5} camera={{ position: [2, -2, 2] }}>
        <StaticScene />
        <Grass flowerCount={flowerCount} flowerScaleRef={flowerScaleRef} />
        <CameraRig controlsRef={controlsRef} gyroZRef={gyroZRef} />
      </Canvas>
    </>
  );
};

export default App;
