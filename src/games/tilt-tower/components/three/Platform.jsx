/**
 * Platform.jsx — The tilting physics platform (ENLARGED)
 *
 * Enlarged play area (14x14) allowing multiple shapes to accumulate, stack,
 * and balance across a spacious neon surface.
 */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'
import useGameStore from '../../store/gameStore'

const PLATFORM_W = 14
const PLATFORM_D = 14
const PLATFORM_H = 0.4
const MAX_TILT_ANGLE = Math.PI / 9 // ~20 degrees max tilt

export const PLATFORM_HALF_W = PLATFORM_W / 2
export const PLATFORM_HALF_D = PLATFORM_D / 2

export default function Platform() {
  // Cannon.js physics body for platform
  const [bodyRef, api] = useBox(() => ({
    type: 'Kinematic',
    args: [PLATFORM_W, PLATFORM_H, PLATFORM_D],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    mass: 0,
    material: { friction: 0.7, restitution: 0.1 },
  }))

  const visualRef = useRef()
  const currentEuler = useRef(new THREE.Euler(0, 0, 0))

  useFrame((_, delta) => {
    const { tiltX, tiltZ } = useGameStore.getState()

    // Target rotation based on player inputs
    const targetX = tiltZ * MAX_TILT_ANGLE
    const targetZ = -tiltX * MAX_TILT_ANGLE

    // Smooth rotation lerp
    const speed = Math.min(1, delta * 7)
    currentEuler.current.x += (targetX - currentEuler.current.x) * speed
    currentEuler.current.z += (targetZ - currentEuler.current.z) * speed

    const ex = currentEuler.current.x
    const ez = currentEuler.current.z

    // Update physics body
    api.rotation.set(ex, 0, ez)
    api.position.set(0, 0, 0)

    // Mirror to visual group
    if (visualRef.current) {
      visualRef.current.rotation.set(ex, 0, ez)
    }
  })

  const gridOffsets = [-5, -2.5, 0, 2.5, 5]

  return (
    <group>
      {/* Physics collision body (invisible) */}
      <mesh ref={bodyRef} visible={false}>
        <boxGeometry args={[PLATFORM_W, PLATFORM_H, PLATFORM_D]} />
        <meshBasicMaterial />
      </mesh>

      {/* Visual platform */}
      <group ref={visualRef}>
        {/* Bottom dark metallic slab */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[PLATFORM_W, PLATFORM_H, PLATFORM_D]} />
          <meshStandardMaterial
            color="#080820"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Neon top surface */}
        <mesh position={[0, PLATFORM_H / 2 + 0.01, 0]}>
          <boxGeometry args={[PLATFORM_W, 0.02, PLATFORM_D]} />
          <meshStandardMaterial
            color="#001824"
            emissive="#00f5ff"
            emissiveIntensity={0.16}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>

        {/* Outer neon edge frame */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(PLATFORM_W, PLATFORM_H, PLATFORM_D)]} />
          <lineBasicMaterial color="#00f5ff" linewidth={2} />
        </lineSegments>

        {/* Inner grid lines for spatial reference */}
        {gridOffsets.map((x) => (
          <mesh key={`gx${x}`} position={[x, PLATFORM_H / 2 + 0.02, 0]}>
            <boxGeometry args={[0.04, 0.01, PLATFORM_D]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.15} />
          </mesh>
        ))}
        {gridOffsets.map((z) => (
          <mesh key={`gz${z}`} position={[0, PLATFORM_H / 2 + 0.02, z]}>
            <boxGeometry args={[PLATFORM_W, 0.01, 0.04]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.15} />
          </mesh>
        ))}

        {/* Platform ambient glow lights */}
        <pointLight position={[0, 3, 0]} intensity={1.5} color="#00f5ff" distance={16} decay={2} />
        <pointLight position={[0, -3, 0]} intensity={2.0} color="#0088ff" distance={14} decay={2} />
      </group>
    </group>
  )
}
