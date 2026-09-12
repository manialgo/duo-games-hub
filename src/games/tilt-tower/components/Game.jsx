/**
 * Game.jsx — Main gameplay wrapper
 *
 * Renders:
 *  - The 3D scene (fills all available space)
 *  - HUD overlay on top of the canvas
 *  - GameOver modal when gamePhase === 'gameover'
 *  - AdBanner pinned at the very bottom
 *
 * sendTiltAxis / sendGameOver / sendRevive come from App's usePeer() call
 * (single shared instance) so they use the live P2P connection.
 */
import React from 'react'
import Scene from './three/Scene'
import HUD from './HUD'
import GameOverModal from './GameOverModal'
import AdBanner from '../../../components/AdBanner'
import useGameStore from '../store/gameStore'
import { useGameControls } from '../hooks/useGameControls'

export default function Game({ sendTiltAxis, sendGameOver, sendRevive }) {
  const gamePhase = useGameStore((s) => s.gamePhase)

  // Activate keyboard controls (A/D for host X-axis, ↑/↓ for client Z-axis)
  useGameControls({ sendTiltAxis })

  return (
    <div className="flex flex-col w-full h-full" style={{ background: '#050510' }}>

      {/* ── 3D Canvas + HUD (fills remaining space above ad banner) ── */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* 3D Scene */}
        <Scene />

        {/* HUD overlay */}
        {gamePhase === 'playing' && <HUD />}

        {/* Game Over Modal overlay */}
        {gamePhase === 'gameover' && <GameOverModal sendRevive={sendRevive} />}
      </div>

      {/* ── Ad Banner pinned at bottom ── */}
      <AdBanner />
    </div>
  )
}
