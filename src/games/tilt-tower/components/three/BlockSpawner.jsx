/**
 * BlockSpawner.jsx — Host-authoritative block spawner with expanded shapes (Prisms)
 *
 * Only the HOST generates blocks (position, shape, color, size).
 * It adds each block to the shared Zustand `blocks` array AND sends it
 * to the client via peerSend({ type: 'spawn', block }).
 *
 * Supported Shapes:
 *  - Box / Cuboid
 *  - Sphere
 *  - Cylinder
 *  - Triangular Prism
 *  - Hexagonal Prism
 *  - Cone
 *  - 4-sided Pyramid
 */
import React, { useEffect, useRef, useCallback } from 'react'
import FallingBlock from './FallingBlock'
import useGameStore from '../../store/gameStore'

const SPAWN_INTERVAL = 1800 // ms between spawns
const SPAWN_HEIGHT = 9.5 // Y above platform
const PLATFORM_HALF = 5.5 // X/Z spawn radius for 14x14 platform
const MAX_BLOCKS = 60 // cap active blocks on the enlarged board

const SHAPES = [
  'box',
  'sphere',
  'cylinder',
  'triangular_prism',
  'hexagonal_prism',
  'cone',
  'pyramid',
]

const NEON_COLORS = [
  '#00f5ff', // cyan
  '#ff00ff', // magenta
  '#00ff88', // green
  '#ffff00', // yellow
  '#ff6600', // orange
  '#cc00ff', // purple
  '#ff0055', // neon red/pink
  '#00ccff', // sky blue
]

let blockIdCounter = 0

function rnd(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Generate a fully-deterministic block descriptor.
 */
function randomBlockData() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
  const x = (Math.random() - 0.5) * PLATFORM_HALF * 2
  const z = (Math.random() - 0.5) * PLATFORM_HALF * 2

  let size
  if (shape === 'box') {
    size = { w: rnd(0.75, 1.3), h: rnd(0.75, 1.3), d: rnd(0.75, 1.3) }
  } else if (shape === 'sphere') {
    size = rnd(0.4, 0.75)
  } else if (shape === 'cylinder' || shape === 'triangular_prism' || shape === 'hexagonal_prism') {
    size = { radius: rnd(0.4, 0.7), height: rnd(0.8, 1.5) }
  } else {
    // cone or pyramid
    size = { radius: rnd(0.45, 0.8), height: rnd(0.9, 1.6) }
  }

  return { shape, color, size, position: [x, SPAWN_HEIGHT, z] }
}

export default function BlockSpawner() {
  const gamePhase = useGameStore((s) => s.gamePhase)
  const blocks = useGameStore((s) => s.blocks)
  const gameOverTriggered = useRef(false)

  // HOST only: spawn loop
  useEffect(() => {
    const { playerRole } = useGameStore.getState()
    if (gamePhase !== 'playing' || playerRole === 'client') return

    gameOverTriggered.current = false

    const interval = setInterval(() => {
      const state = useGameStore.getState()
      if (state.gamePhase !== 'playing') return
      if (state.blocks.length >= MAX_BLOCKS) return

      const id = ++blockIdCounter
      const data = randomBlockData()
      const block = { id, ...data }

      // Add to host store
      state.addBlock(block)
      state.incrementBlockCount()

      // Sync to client
      if (state.peerSend) {
        state.peerSend({ type: 'spawn', block })
      }
    }, SPAWN_INTERVAL)

    return () => clearInterval(interval)
  }, [gamePhase])

  // Clear blocks when leaving gameplay
  useEffect(() => {
    if (gamePhase !== 'playing') {
      useGameStore.getState().clearBlocks()
      blockIdCounter = 0
    }
  }, [gamePhase])

  // Called when a block drops below death Y
  const handleFallOff = useCallback(() => {
    if (gameOverTriggered.current) return
    gameOverTriggered.current = true

    const state = useGameStore.getState()
    state.triggerGameOver()

    // Notify peer of game over
    if (state.peerSend) {
      state.peerSend({ type: 'gameover' })
    }
  }, [])

  if (gamePhase !== 'playing') return null

  return (
    <>
      {blocks.map((block) => (
        <FallingBlock
          key={block.id}
          id={block.id}
          position={block.position}
          shape={block.shape}
          color={block.color}
          size={block.size}
          onFallOff={handleFallOff}
        />
      ))}
    </>
  )
}
