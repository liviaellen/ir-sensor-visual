import { useGLTF, useTexture } from '@react-three/drei'
import { LayerMaterial, Texture, Depth } from 'lamina'
import { forwardRef } from 'react'
import { DoubleSide, MeshStandardMaterial, Color } from 'three'

export const Flower = forwardRef((props, ref) => {
  const { nodes } = useGLTF('/models/flower.glb')
  const map = useTexture('/textures/color.jpg')
  const ao = useTexture('/textures/ao.jpg')

  return (
    <group>
      <instancedMesh
        ref={ref}
        args={[undefined, undefined, 1000]}
        castShadow
        receiveShadow
        geometry={nodes._ndyj_Var10_LOD0.geometry}
        {...props}>
        <LayerMaterial lighting="standard" side={DoubleSide}>
          <Texture map={map} />
          <Texture map={ao} mode="multiply" />
          <Depth colorA="#ff6699" colorB="#ffffff" near={0} far={2} mapping={'world'} mode="add" alpha={0.3} />
        </LayerMaterial>
      </instancedMesh>
    </group>
  )
})
