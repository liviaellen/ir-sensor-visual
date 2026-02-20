import React, { useRef, useEffect, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Vector2, MathUtils } from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

// Simple noise function to replace FBM
function noise2D(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

const vec = new Vector2()
// React.memo to prevent re-renders
export const Butterfly = React.memo(({ bloomRef, wind = true, ...props }) => {
  const group = useRef()
  const { scene, animations } = useGLTF('/models/butterfly.glb')
  const cloneScene = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, group)
  const offset = useMemo(() => Math.random() * 100, [])
  const baseY = useMemo(() => MathUtils.randFloat(-3, 1), [])

  useEffect(() => {
    for (const key in actions) {
      actions[key].setEffectiveTimeScale(6)
      setTimeout(() => {
        actions[key].play()
      }, Math.random() * 1000)
    }
    group.current.rotation.y = offset
  }, [])

  useFrame(({ clock }, dt) => {
    const time = clock.elapsedTime
    const bloom = (wind && bloomRef) ? bloomRef.current : 0
    // Simple noise-based movement
    const flyHeight = noise2D(time * 0.5, offset) * (0.5 + bloom * 1.5)
    const flyRadius = 0.5 + bloom * 0.5

    group.current.position.set(
      Math.sin(time * 0.5 + offset) * flyRadius * bloom,
      flyHeight,
      Math.cos(time * 0.5 + offset) * flyRadius * bloom
    )
    group.current.rotation.y -= dt * (0.5 + bloom * 0.5)
  })

  return (
    <group ref={group} dispose={null}>
      <group {...props}>
        <group scale={0.1} rotation-y={Math.PI / 4} position-y={baseY}>
          <primitive object={cloneScene} />
        </group>
      </group>
    </group>
  )
})

useGLTF.preload('/models/butterfly.glb')
