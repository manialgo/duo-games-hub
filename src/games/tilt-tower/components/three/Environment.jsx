/**
 * Environment.jsx — Fixed: much brighter lights so platform is visible
 */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'

function RotatingStars() {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.01
  })
  return (
    <group ref={ref}>
      <Stars radius={120} depth={60} count={3000} factor={4} saturation={0.8} fade speed={0.5} />
    </group>
  )
}

export default function Environment() {
  return (
    <>
      {/* Softer fog — start further out so platform stays clear */}
      <fog attach="fog" args={['#050510', 40, 100]} />

      {/* Ambient — raised so block sides are visible, not just top */}
      <ambientLight intensity={0.8} color="#6080cc" />

      {/* Main directional light — stronger, raking from upper-front */}
      <directionalLight
        position={[2, 12, 10]}
        intensity={2.8}
        color="#c0d8ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />

      {/* Second fill light — violet rim from behind-left */}
      <directionalLight
        position={[-5, 8, -8]}
        intensity={1.2}
        color="#8040ff"
      />

      {/* Neon cyan rim — left */}
      <pointLight position={[-7, 5, 0]}  intensity={4} color="#00f5ff" distance={20} decay={2} />
      {/* Neon pink rim — right */}
      <pointLight position={[7,  5, 0]}  intensity={4} color="#ff00ff" distance={20} decay={2} />
      {/* Neon warm — front */}
      <pointLight position={[0,  3, 10]} intensity={2} color="#ffffff" distance={18} decay={2} />
      {/* Purple under-glow */}
      <pointLight position={[0, -5, 0]}  intensity={1.5} color="#7700ff" distance={15} decay={2} />

      {/* Sparkles */}
      <Sparkles count={60} scale={20} size={1.2} speed={0.2} opacity={0.4} color="#00f5ff" />
      <Sparkles count={40} scale={18} size={1.0} speed={0.15} opacity={0.3} color="#ff00ff" />

      <RotatingStars />
    </>
  )
}
