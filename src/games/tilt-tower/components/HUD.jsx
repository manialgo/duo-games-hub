/**
 * HUD.jsx — In-game heads-up display overlay
 *
 * Shows:
 *  - Survival timer (ticks every second while playing)
 *  - Block count
 *  - Player role + correct key hints
 *  - Connection status: P1+P2 ONLINE / WAITING / SOLO
 *  - "?" button to open How to Play in-game
 */
import React, { useEffect, useState } from 'react'
import useGameStore from '../store/gameStore'
import useUserStore from '../../../store/userStore'
import HowToPlay from './HowToPlay'

function pad(n) { return String(Math.floor(n)).padStart(2, '0') }
function formatTime(secs) {
  return `${pad(secs / 60)}:${pad(secs % 60)}`
}

export default function HUD() {
  const { survivalTime, blockCount, playerRole, connectionStatus, gamePhase } = useGameStore()
  const [showHelp, setShowHelp] = useState(false)

  // Tick timer every second while playing
  useEffect(() => {
    if (gamePhase !== 'playing') return
    const id = setInterval(() => {
      useGameStore.getState().incrementTime()
    }, 1000)
    return () => clearInterval(id)
  }, [gamePhase])

  const isHost = playerRole === 'host'
  const isConnected = connectionStatus === 'connected'
  const isWaiting   = connectionStatus === 'waiting'

  // ── Connection badge ────────────────────────────────────────────
  let connBadge, connColor
  if (isConnected) {
    connBadge = isHost ? '● P1 + P2 ONLINE' : '● P1 + P2 ONLINE'
    connColor = '#00ff88'
  } else if (isWaiting) {
    connBadge = '◌ WAITING…'
    connColor = '#ffff00'
  } else {
    connBadge = '◌ SOLO'
    connColor = 'rgba(255,255,255,0.35)'
  }
  const { profile } = useUserStore()

  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 pointer-events-none"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        {/* Left — Player role + key hint */}
        <div className="flex flex-col gap-1">
          {profile && (
            <div className="text-xs text-white/70 tracking-widest flex items-center gap-2 mb-1">
              <span>👤 {profile.username}</span>
              <span className="text-orange-400">🔥 {profile.current_streak}</span>
            </div>
          )}
          <div
            className="text-xs font-bold tracking-widest px-3 py-1 rounded"
            style={{
              color: isHost ? '#00f5ff' : '#ff00ff',
              border: `1px solid ${isHost ? 'rgba(0,245,255,0.3)' : 'rgba(255,0,255,0.3)'}`,
              background: isHost ? 'rgba(0,245,255,0.08)' : 'rgba(255,0,255,0.08)',
              textShadow: isHost ? '0 0 8px #00f5ff' : '0 0 8px #ff00ff',
            }}
          >
            {isHost ? 'P1  HOST' : 'P2  CLIENT'}
          </div>
          {/* ── corrected key hints ── */}
          <div className="text-white/25 text-xs tracking-wider pl-1">
            {isHost ? 'A / D  →  Tilt X' : '↑ / ↓  →  Tilt Z'}
          </div>
        </div>

        {/* Center — Timer */}
        <div className="flex flex-col items-center">
          <div
            className="text-3xl font-black tracking-wider"
            style={{
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 30px rgba(0,245,255,0.3)',
            }}
          >
            {formatTime(survivalTime)}
          </div>
          <div className="text-white/25 text-xs tracking-widest">SURVIVAL</div>
        </div>

        {/* Right — Blocks + connection badge + help btn */}
        <div className="flex flex-col items-end gap-1">
          <div
            className="text-sm font-bold tracking-wider"
            style={{ color: '#00ff88', textShadow: '0 0 8px #00ff88' }}
          >
            {blockCount} BLOCKS
          </div>

          {/* ── Rich connection badge ── */}
          <div
            className="text-xs font-bold tracking-widest px-2 py-0.5 rounded"
            style={{
              color: connColor,
              textShadow: `0 0 6px ${connColor}`,
              border: `1px solid ${connColor}44`,
              background: `${connColor}11`,
            }}
          >
            {connBadge}
          </div>

          {/* ── How to Play button ── */}
          <button
            onClick={() => setShowHelp(true)}
            className="pointer-events-auto mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200 hover:scale-110"
            title="How to Play"
            style={{
              fontFamily: 'Orbitron, monospace',
              color: 'rgba(0,245,255,0.7)',
              border: '1px solid rgba(0,245,255,0.3)',
              background: 'rgba(0,245,255,0.08)',
              boxShadow: '0 0 8px rgba(0,245,255,0.2)',
            }}
          >
            ?
          </button>
        </div>
      </div>

      {/* How to Play modal */}
      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </>
  )
}
