import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, Sky, Cloud, CameraShake } from '@react-three/drei'
import { Suspense, useState, useEffect, createContext, useRef } from 'react'
import { MathUtils } from 'three'
import { Grass } from './Grass'
import { Butterfly } from './Butterfly'
import { Particles } from './Particles'
import { button, useControls } from 'leva'
import Tag from './Tag'

// BLE Context for sharing sensor data
export const SensorContext = createContext({ bloom: 0.5, distance: 50 })

// BLE Constants
const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
const UART_RX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'

const rand = new Array(15).fill(0).map(() => ({
  position: [
    MathUtils.randFloat(0.5, 0.7),
    MathUtils.randFloat(0.5, 0.7),
    MathUtils.randFloat(0.5, 0.7)
  ],
  scale: MathUtils.randFloat(0.5, 1)
}))

function Capture() {
  const gl = useThree((state) => state.gl)
  useControls({
    screenshot: button(() => {
      const link = document.createElement('a')
      link.setAttribute('download', 'canvas.png')
      link.setAttribute(
        'href',
        gl.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream')
      )
      link.click()
    })
  })

  return null
}

export const App = () => {
  const [distance, setDistance] = useState(100)
  const [bloom, setBloom] = useState(0.3)
  const [connected, setConnected] = useState(false)
  const [wind, setWind] = useState(true)
  const [flowerCount, setFlowerCount] = useState(6000)
  const [flowerScale, setFlowerScale] = useState(1.0)
  const [status, setStatus] = useState('Press Connect or use ↑↓ keys')

  // Use ref for animation loop to prevent re-renders
  const bloomRef = useRef(0.3)

  // Smooth bloom transition
  useEffect(() => {
    const targetBloom = 1 - Math.min(1, Math.max(0, (distance - 20) / 80))
    const interval = setInterval(() => {
      setBloom(prev => {
        const next = prev + (targetBloom - prev) * 0.05
        bloomRef.current = next
        return next
      })
    }, 16)
    return () => clearInterval(interval)
  }, [distance])

  // Keyboard control for testing
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') setDistance(d => Math.max(20, d - 5))
      if (e.key === 'ArrowDown') setDistance(d => Math.min(100, d + 5))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // BLE Connection
  const connectBLE = async () => {
    try {
      setStatus('Searching...')
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Adafruit' }],
        optionalServices: [UART_SERVICE_UUID]
      })
      const server = await device.gatt.connect()
      const service = await server.getPrimaryService(UART_SERVICE_UUID)
      const rx = await service.getCharacteristic(UART_RX_UUID)
      await rx.startNotifications()

      rx.addEventListener('characteristicvaluechanged', (e) => {
        const data = new TextDecoder().decode(e.target.value)
        if (data.startsWith('D:')) {
          const value = parseFloat(data.substring(2))
          if (!isNaN(value) && isFinite(value)) {
            setDistance(Math.max(20, Math.min(150, value)))
          }
        }
      })

      device.addEventListener('gattserverdisconnected', () => {
        setConnected(false)
        setStatus('Disconnected')
      })

      setConnected(true)
      setStatus('Connected')
    } catch (err) {
      setStatus(err.message)
    }
  }

  return (
    <SensorContext.Provider value={{ bloom, distance }}>
      {/* UI Overlay */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 100,
        color: 'white',
        fontFamily: '-apple-system, sans-serif'
      }}>
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={connectBLE}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '25px',
              background: connected ? 'rgba(0,200,100,0.3)' : 'rgba(0,0,0,0.4)',
              color: 'white',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              marginRight: '10px'
            }}
          >
            {connected ? 'Connected' : 'Connect Sensor'}
          </button>
          <button
            onClick={() => setWind(!wind)}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '25px',
              background: wind ? 'rgba(0,200,255,0.3)' : 'rgba(0,0,0,0.4)',
              color: 'white',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            {wind ? 'Wind ON' : 'Wind OFF'}
          </button>
        </div>

        {/* Flower Controls - Sliders inside a blurred container */}
        <div style={{
          padding: '15px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 10,
          width: '240px'
        }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 5 }}>Flowers: {flowerCount}</label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={flowerCount}
              onChange={(e) => setFlowerCount(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 5 }}>Height: {flowerScale.toFixed(1)}x</label>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={flowerScale}
              onChange={(e) => setFlowerScale(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          {status} | {distance.toFixed(0)} cm | Bloom: {(bloom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: 'fixed',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '0.9rem',
        letterSpacing: '0.4em',
        opacity: 0.3,
        textTransform: 'uppercase',
        fontFamily: '-apple-system, sans-serif'
      }}>
        Movement of Love
      </div>

      <Canvas
        dpr={1.5}
        camera={{ position: [1, -1.25, 1] }}
      >
        <Suspense fallback={null}>
          <Grass bloomRef={bloomRef} wind={wind} flowerCount={flowerCount} flowerScale={flowerScale}>
            {/* BlobGeometry removed here, handled inside Grass */}
          </Grass>
          {rand.map((e, i) => (
            <Butterfly key={i} {...e} bloomRef={bloomRef} wind={wind} />
          ))}

          <Clouds wind={wind} />
          <Sky sunPosition={[0, 0.5, -1]} />
          <Environment preset="sunset" />
        </Suspense>
        <Particles bloomRef={bloomRef} wind={wind} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <OrbitControls enableZoom={false} makeDefault autoRotate autoRotateSpeed={wind ? 1.0 : 0.5} />
        <CameraShake
          maxRoll={wind ? 0.2 : 0}
          maxPitch={wind ? 0.2 : 0}
          maxYaw={wind ? 0.2 : 0}
        />
      </Canvas>
      <Tag />
    </SensorContext.Provider>
  )
}

function Clouds({ wind }) {
  // Static values based on wind toggle to prevent re-renders
  const speed = wind ? 0.3 : 0.05
  const opacity = wind ? 0.5 : 0.2

  return (
    <group>
      <Cloud position={[-10, -6, -10]} speed={speed} opacity={opacity} />
      <Cloud position={[10, 6, -15]} speed={speed} opacity={opacity} />
      <Cloud position={[0, 10, 0]} speed={speed} opacity={opacity} />
      <Cloud position={[0, -10, 0]} speed={speed} opacity={opacity} />
      <Cloud position={[-10, -6, 15]} speed={speed} opacity={opacity} />
      <Cloud position={[10, 6, 10]} speed={speed} opacity={opacity} />
    </group>
  )
}
