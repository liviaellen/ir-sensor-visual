import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'

// React.memo to prevent re-renders
export const Particles = React.memo(({ bloomRef, wind = true }) => {
  const pointsRef = useRef()
  const nPoints = 1000

  const positions = useMemo(() => {
    const pos = new Float32Array(nPoints * 3)
    for (let i = 0; i < nPoints; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    return pos
  }, [])

  const velocities = useMemo(() => {
    const vel = []
    for (let i = 0; i < nPoints; i++) {
      vel.push({
        x: (Math.random() - 0.5) * 0.002,
        y: (Math.random() - 0.5) * 0.002,
        z: (Math.random() - 0.5) * 0.002,
        offset: Math.random() * 100
      })
    }
    return vel
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const positions = pointsRef.current.geometry.attributes.position.array
    const time = clock.elapsedTime
    const bloom = (wind && bloomRef) ? bloomRef.current : 0

    for (let i = 0; i < nPoints; i++) {
      const i3 = i * 3
      const vel = velocities[i]

      // Curl-like motion
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]

      positions[i3] += Math.sin(time * 0.5 + vel.offset + y * 2) * 0.003 * (0.5 + bloom)
      positions[i3 + 1] += Math.cos(time * 0.5 + vel.offset + x * 2) * 0.003 * (0.5 + bloom) + bloom * 0.001
      positions[i3 + 2] += Math.sin(time * 0.3 + vel.offset + z * 2) * 0.003 * (0.5 + bloom)

      // Keep within bounds
      const dist = Math.sqrt(x * x + y * y + z * z)
      if (dist > 2) {
        positions[i3] *= 0.95
        positions[i3 + 1] *= 0.95
        positions[i3 + 2] *= 0.95
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.material.opacity = 0.3 + bloom * 0.5
    pointsRef.current.material.size = 0.015 + bloom * 0.01
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={nPoints}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffee"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
})
