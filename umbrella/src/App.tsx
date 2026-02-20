import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useControls } from 'leva';
import { useState, useEffect } from 'react';
import { Rain } from './components/Rain';
import { BloomFlower } from './components/BloomFlower';
import { SkyBackground } from './components/SkyBackground';

function App() {
  const { isPresent } = useControls({ isPresent: false });
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: number;
    let startTime: number | null = null;

    if (isPresent) {
      startTime = Date.now() - duration * 1000;
      interval = setInterval(() => {
        if (startTime) {
          setDuration((Date.now() - startTime) / 1000);
        }
      }, 16);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isPresent]);

  // Bloom level from 0 to 1 over 10 seconds
  const bloomLevel = Math.min(duration / 10, 1);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050510' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />

        {/* Lighting for Cel Shading */}
        <ambientLight intensity={0.4} /> {/* Stronger ambient for toon look */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-bias={-0.0001}
        />

        <SkyBackground bloomLevel={bloomLevel} />
        <Rain bloomLevel={bloomLevel} />
        <BloomFlower bloomLevel={bloomLevel} />

        {/* Post-processing: Soften the look */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            luminanceSmoothing={0.8}
            height={300}
            intensity={0.8 + bloomLevel} // Glows more as it blooms
          />
        </EffectComposer>

        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={4} maxDistance={15} />
      </Canvas>

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'sans-serif', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
        <h1>Time: {duration.toFixed(1)}s</h1>
        <h2>Bloom: {(bloomLevel * 100).toFixed(0)}%</h2>
      </div>
    </div>
  );
}

export default App;
