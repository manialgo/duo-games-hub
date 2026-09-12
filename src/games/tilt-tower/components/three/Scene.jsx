/**
 * Scene.jsx — Camera & lights setup for enlarged 14x14 platform
 */
import React, { Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Environment from './Environment'
import Platform from './Platform'
import BlockSpawner from './BlockSpawner'

/**
 * Camera rig holding focus on the platform center.
 */
function CameraRig() {
  const { camera } = useThree()
  const target = new THREE.Vector3(0, 1.5, 0)
  useFrame(() => {
    camera.lookAt(target)
  })
  return null
}

function PhysicsWorld() {
  return (
    <Physics
      gravity={[0, -12, 0]}
      defaultContactMaterial={{
        friction: 0.6,
        restitution: 0.1,
      }}
      allowSleep
    >
      <Platform />
      <BlockSpawner />
    </Physics>
  )
}

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      /* Camera adjusted for 14x14 play area: Y=16, Z=26, FOV=50 */
      camera={{ position: [0, 16, 26], fov: 50, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{ background: '#050510' }}
    >
      <CameraRig />

      <Suspense fallback={null}>
        <Environment />
        <PhysicsWorld />
      </Suspense>
    </Canvas>
  )
}
