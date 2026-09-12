/**
 * FallingBlock.jsx — Deterministic 3D physics primitives with full Prism support
 *
 * Supported Shapes:
 *  - 'box': Standard cuboid block
 *  - 'sphere': Round sphere
 *  - 'cylinder': 16-sided cylinder
 *  - 'triangular_prism': 3-sided triangular prism
 *  - 'hexagonal_prism': 6-sided hexagonal prism
 *  - 'cone': Smooth circular cone
 *  - 'pyramid': 4-sided pyramid prism
 *
 * All properties (shape, color, size, initial position) are host-determined
 * and P2P synced to guarantee 100% deterministic physics on both screens.
 */
import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useBox, useSphere, useCylinder } from '@react-three/cannon'

const FALL_DEATH_Y = -10 // trigger game over below this Y

/** Hook: monitor Y position and notify when block drops off platform */
function useWatchFallOff(api, onFallOff) {
  const posY = useRef(10)
  const triggered = useRef(false)

  useEffect(() => {
    const unsub = api.position.subscribe((v) => {
      posY.current = v[1]
    })
    return unsub
  }, [api])

  useFrame(() => {
    if (!triggered.current && posY.current < FALL_DEATH_Y) {
      triggered.current = true
      onFallOff()
    }
  })
}

/** 1. Cube / Box block */
function BoxBlock({ position, color, size, onFallOff }) {
  const w = typeof size === 'object' ? size.w ?? 0.9 : (size ?? 0.9)
  const h = typeof size === 'object' ? size.h ?? 0.9 : (size ?? 0.9)
  const d = typeof size === 'object' ? size.d ?? 0.9 : (size ?? 0.9)

  const [ref, api] = useBox(() => ({
    mass: 0.8,
    position,
    args: [w, h, d],
    linearDamping: 0.05,
    angularDamping: 0.1,
  }))

  useWatchFallOff(api, onFallOff)

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.65}
        metalness={0.3}
        roughness={0.3}
      />
    </mesh>
  )
}

/** 2. Sphere block */
function SphereBlock({ position, color, size, onFallOff }) {
  const r = typeof size === 'number' ? size : 0.55
  const [ref, api] = useSphere(() => ({
    mass: 0.6,
    position,
    args: [r],
    linearDamping: 0.01,
    angularDamping: 0.05,
  }))

  useWatchFallOff(api, onFallOff)

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[r, 20, 20]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        metalness={0.2}
        roughness={0.25}
      />
    </mesh>
  )
}

/** 3. Circular Cylinder block */
function CylinderBlock({ position, color, size, onFallOff }) {
  const r = size?.radius ?? 0.45
  const h = size?.height ?? 1.1

  const [ref, api] = useCylinder(() => ({
    mass: 0.75,
    position,
    args: [r, r, h, 16],
    linearDamping: 0.05,
    angularDamping: 0.1,
  }))

  useWatchFallOff(api, onFallOff)

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.65}
        metalness={0.35}
        roughness={0.3}
      />
    </mesh>
  )
}

/** 4. Triangular Prism block (3-sided cylinder) */
function TriangularPrismBlock({ position, color, size, onFallOff }) {
  const r = size?.radius ?? 0.6
  const h = size?.height ?? 1.1

  const [ref, api] = useCylinder(() => ({
    mass: 0.7,
    position,
    args: [r, r, h, 3],
    linearDamping: 0.05,
    angularDamping: 0.1,
  }))

  useWatchFallOff(api, onFallOff)

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 3]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        metalness={0.3}
        roughness={0.3}
      />
    </mesh>
  )
}

/** 5. Hexagonal Prism block (6-sided cylinder) */
function HexagonalPrismBlock({ position, color, size, onFallOff }) {
  const r = size?.radius ?? 0.55
  const h = size?.height ?? 1.1

  const [ref, api] = useCylinder(() => ({
    mass: 0.8,
    position,
    args: [r, r, h, 6],
    linearDamping: 0.05,
    angularDamping: 0.1,
  }))

  useWatchFallOff(api, onFallOff)

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.65}
        metalness={0.35}
        roughness={0.25}
      />
    </mesh>
  )
}

/** 6. Cone block */
function ConeBlock({ position, color, size, onFallOff }) {
  const r = size?.radius ?? 0.6
  const h = size?.height ?? 1.2

  const [ref, api] = useCylinder(() => ({
    mass: 0.65,
    position,
    args: [0.05, r, h, 16],
    linearDamping: 0.05,
    angularDamping: 0.1,
  }))

  useWatchFallOff(api, onFallOff)

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <coneGeometry args={[r, h, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        metalness={0.3}
        roughness={0.3}
      />
    </mesh>
  )
}

/** 7. 4-sided Pyramid Prism block */
function PyramidBlock({ position, color, size, onFallOff }) {
  const r = size?.radius ?? 0.65
  const h = size?.height ?? 1.2

  const [ref, api] = useCylinder(() => ({
    mass: 0.65,
    position,
    args: [0.05, r, h, 4],
    linearDamping: 0.05,
    angularDamping: 0.1,
  }))

  useWatchFallOff(api, onFallOff)

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <coneGeometry args={[r, h, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.75}
        metalness={0.3}
        roughness={0.3}
      />
    </mesh>
  )
}

/** Dispatcher component */
export default function FallingBlock({ id, position, shape, color, size, onFallOff }) {
  const props = { position, color, size, onFallOff }

  switch (shape) {
    case 'sphere':
      return <SphereBlock {...props} />
    case 'cylinder':
      return <CylinderBlock {...props} />
    case 'triangular_prism':
      return <TriangularPrismBlock {...props} />
    case 'hexagonal_prism':
      return <HexagonalPrismBlock {...props} />
    case 'cone':
      return <ConeBlock {...props} />
    case 'pyramid':
      return <PyramidBlock {...props} />
    case 'box':
    default:
      return <BoxBlock {...props} />
  }
}
