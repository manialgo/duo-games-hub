/**
 * LaserGridVictoryModal.jsx — Level Clear modal with Supabase score sync
 */
import React, { useEffect } from 'react'
import useLaserGridStore, { LEVELS } from '../store/laserGridStore'
import { supabase } from '../../../lib/supabase'
import useUserStore from '../../../store/userStore'

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function LaserGridVictoryModal({ sendNextLevel }) {
  const { currentLevelIndex, levelTimer, nextLevel, resetToLobby, peerSend } = useLaserGridStore()
  const { user } = useUserStore()

  const level = LEVELS[currentLevelIndex] || LEVELS[0]
  const isLastLevel = currentLevelIndex >= LEVELS.length - 1

  // Save score to Supabase on Level Clear
  useEffect(() => {
    const saveProgress = async () => {
      if (!user) return
      try {
        await supabase.from('leaderboards').upsert({
          user_id: user.id,
          game_id: 'laser-grid',
          high_score: levelTimer,
          level_reached: currentLevelIndex + 1,
        })
      } catch (err) {
        console.error('[LaserGrid] Failed to save score to Supabase:', err)
      }
    }
    saveProgress()
  }, [user, currentLevelIndex, levelTimer])

  const handleNextLevel = () => {
    nextLevel()
    if (sendNextLevel) sendNextLevel()
    if (peerSend) peerSend({ type: 'next_level' })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-md p-8 rounded-2xl flex flex-col items-center gap-6 text-white text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(15,15,40,0.98) 0%, rgba(30,5,45,0.98) 100%)',
          border: '1px solid rgba(0,245,255,0.4)',
          boxShadow: '0 0 60px rgba(0,245,255,0.2), 0 0 100px rgba(255,0,85,0.15)',
        }}
      >
        {/* Title */}
        <div>
          <div className="text-3xl font-black text-cyan-400 tracking-wider mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>
            {isLastLevel ? '🎉 CAMPAIGN COMPLETE!' : '✨ LEVEL CLEARED!'}
          </div>
          <div className="text-white/40 text-xs tracking-widest uppercase">
            ENERGY CORES FULLY CHARGED
          </div>
        </div>

        {/* Level Stats */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
            <div className="text-[10px] text-white/40 tracking-widest mb-1">STAGE</div>
            <div className="text-xl font-bold text-cyan-300" style={{ fontFamily: 'Orbitron, monospace' }}>
              {currentLevelIndex + 1} / {LEVELS.length}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-500/30">
            <div className="text-[10px] text-white/40 tracking-widest mb-1">CLEAR TIME</div>
            <div className="text-xl font-bold text-pink-400" style={{ fontFamily: 'Orbitron, monospace' }}>
              {formatTime(levelTimer)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleNextLevel}
            className="w-full py-3.5 rounded-xl font-black text-sm tracking-widest transition-all duration-200 hover:scale-[1.02] active:scale-98"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(90deg, #00f5ff 0%, #00aaff 100%)',
              color: '#050515',
              boxShadow: '0 0 25px rgba(0,245,255,0.4)',
            }}
          >
            {isLastLevel ? '🔄 REPLAY FROM STAGE 1' : 'NEXT LEVEL →'}
          </button>

          <button
            onClick={resetToLobby}
            className="w-full py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-white/10"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  )
}
