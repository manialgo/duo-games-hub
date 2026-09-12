/**
 * LaserGridHUD.jsx — In-game overlay for Laser Grid Co-Op
 */
import React, { useEffect } from 'react'
import useLaserGridStore, { LEVELS } from '../store/laserGridStore'

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function LaserGridHUD() {
  const {
    currentLevelIndex,
    levelTimer,
    incrementTimer,
    playerRole,
    connectionStatus,
    targetsCharged,
    resetToLobby,
    loadLevel,
  } = useLaserGridStore()

  const level = LEVELS[currentLevelIndex] || LEVELS[0]

  useEffect(() => {
    const interval = setInterval(() => {
      incrementTimer()
    }, 1000)
    return () => clearInterval(interval)
  }, [incrementTimer])

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between pointer-events-auto bg-dark-900/80 backdrop-blur-md p-3 px-5 rounded-2xl border border-cyan-500/30">
        <div>
          <div
            className="text-lg font-black tracking-widest text-cyan-400"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {level.title}
          </div>
          <div className="text-xs text-white/50">{level.desc}</div>
        </div>

        {/* Timer & Connection */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-white/40 tracking-widest">ELAPSED TIME</div>
            <div
              className="text-xl font-bold text-pink-400"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {formatTime(levelTimer)}
            </div>
          </div>

          {/* Connection badge */}
          <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider border bg-cyan-950/60 border-cyan-400/40 text-cyan-300">
            {playerRole === 'solo'
              ? '🎮 SOLO MODE'
              : connectionStatus === 'connected'
              ? '● P1 + P2 ONLINE'
              : '◌ WAITING...'}
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full flex items-center justify-between pointer-events-auto bg-dark-900/80 backdrop-blur-md p-3 px-5 rounded-2xl border border-pink-500/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadLevel(currentLevelIndex)}
            className="px-4 py-2 rounded-lg text-xs font-bold tracking-wider text-pink-400 border border-pink-500/40 hover:bg-pink-500/10 transition"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            🔄 RESTART LEVEL
          </button>
          <button
            onClick={resetToLobby}
            className="px-4 py-2 rounded-lg text-xs font-bold tracking-wider text-white/50 border border-white/20 hover:bg-white/10 transition"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            MAIN MENU
          </button>
        </div>

        {/* Instructions pill */}
        <div className="text-xs text-white/60 tracking-wider">
          💡 <span className="text-cyan-400 font-bold">CLICK MIRRORS</span> TO ROTATE ($45^\circ / 90^\circ$)
        </div>
      </div>
    </div>
  )
}
