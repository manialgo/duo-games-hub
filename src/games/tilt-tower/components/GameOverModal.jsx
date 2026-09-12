/**
 * GameOverModal.jsx — Game Over overlay with high scores & synchronized Play Again
 *
 * Features:
 *  - Current run stats (survival time & block count)
 *  - All-time high score / best stats with "NEW BEST" indicators
 *  - Synchronized "PLAY AGAIN" button (restarts game for BOTH players via P2P)
 *  - "Watch Ad to Revive" CTA
 *  - "Buy Premium Neon Skins ($0.99)" Stripe CTA
 */
import React, { useCallback, useEffect } from 'react'
import useGameStore from '../store/gameStore'

/** Dummy Stripe checkout handler */
function openStripeCheckout() {
  alert(
    '💳 Stripe Checkout\n\n' +
    'In production, this opens your Stripe Payment Link:\n' +
    'https://buy.stripe.com/YOUR_PAYMENT_LINK\n\n' +
    'Configure in the Stripe Dashboard > Payment Links'
  )
}

/** Dummy "Watch Ad" handler */
function watchAd(onComplete) {
  const modal = document.createElement('div')
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;
    display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;
    color:#00f5ff;font-family:Orbitron,monospace;font-size:1rem;letter-spacing:.2em;
  `
  modal.innerHTML = `
    <div style="font-size:2rem">▶</div>
    <div>REWARDED AD PLAYING…</div>
    <div style="font-size:0.75rem;color:rgba(0,245,255,0.5)">REPLACE WITH YOUR AD NETWORK SDK</div>
    <div id="ad-timer" style="font-size:1.5rem;color:#ff00ff">3</div>
  `
  document.body.appendChild(modal)
  let t = 3
  const tick = setInterval(() => {
    t--
    const el = document.getElementById('ad-timer')
    if (el) el.textContent = t
    if (t <= 0) {
      clearInterval(tick)
      document.body.removeChild(modal)
      onComplete()
    }
  }, 1000)
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

import { supabase } from '../../../lib/supabase'
import useUserStore from '../../../store/userStore'

// ... existing code down to GameOverModal definition ...
export default function GameOverModal({ sendRevive }) {
  const {
    survivalTime,
    blockCount,
    bestSurvivalTime,
    bestBlockCount,
    revivesLeft,
    useRevive,
    resetToLobby,
    startGame,
    peerSend,
  } = useGameStore()
  
  const { user, profile } = useUserStore()

  useEffect(() => {
    // Only save when the modal first mounts
    const saveScore = async () => {
      if (!user) return // Guests don't save

      try {
        // Update high score
        await supabase.from('leaderboards').upsert({
          user_id: user.id,
          game_id: 'tilt-tower',
          high_score: Math.max(survivalTime, bestSurvivalTime || 0),
          level_reached: Math.max(blockCount, bestBlockCount || 0)
        })

        // Update streak (simplified logic: just bump it and update last_played)
        // In a real app, you'd check if last_played was exactly yesterday to increment, or today to do nothing, or earlier to reset.
        await supabase.from('profiles').update({
          current_streak: (profile?.current_streak || 0) + 1,
          last_played_at: new Date().toISOString()
        }).eq('id', user.id)

        // Refresh profile in store
        useUserStore.getState().fetchProfile(user.id)
      } catch (err) {
        console.error('Failed to save score:', err)
      }
    }
    saveScore()
  }, []) // run once on mount

  const isNewBestTime = survivalTime > 0 && survivalTime >= bestSurvivalTime
  const isNewBestBlocks = blockCount > 0 && blockCount >= bestBlockCount

  const handleWatchAd = useCallback(() => {
    watchAd(() => {
      useRevive() // restore locally
      if (sendRevive) sendRevive() // notify remote player
    })
  }, [useRevive, sendRevive])

  const handlePlayAgain = useCallback(() => {
    startGame()
    // Send P2P start message so remote player also restarts
    if (peerSend) {
      peerSend({ type: 'start' })
    }
  }, [startGame, peerSend])

  return (
    <div className="modal-overlay absolute inset-0 z-30 flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-md rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{
          background: 'linear-gradient(135deg, rgba(10,10,26,0.97) 0%, rgba(20,5,30,0.97) 100%)',
          border: '1px solid rgba(255,0,255,0.25)',
          boxShadow: '0 0 60px rgba(255,0,255,0.15), 0 0 120px rgba(0,0,0,0.5)',
        }}
      >
        {/* Decorative corner glows */}
        <div
          className="absolute top-0 left-0 w-16 h-16 rounded-tl-2xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0 0, #ff00ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-16 h-16 rounded-br-2xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 100%, #00f5ff 0%, transparent 70%)' }}
        />

        {/* Title */}
        <div className="text-center">
          <div
            className="text-4xl font-black tracking-wider"
            style={{
              color: '#ff00ff',
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 20px rgba(255,0,255,0.8), 0 0 40px rgba(255,0,255,0.4)',
            }}
          >
            GAME OVER
          </div>
          <div className="text-white/40 text-xs tracking-widest mt-1">THE TOWER HAS FALLEN</div>
        </div>

        {/* Current Run Stats */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="text-[10px] text-cyan-400/70 tracking-widest font-bold uppercase">
            THIS RUN
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <div
              className="rounded-lg p-3 text-center relative overflow-hidden"
              style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)' }}
            >
              {isNewBestTime && (
                <span className="absolute top-1 right-1 bg-cyan-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter">
                  NEW BEST!
                </span>
              )}
              <div className="text-[10px] text-white/40 tracking-widest mb-1">SURVIVED</div>
              <div
                className="text-2xl font-black"
                style={{
                  color: '#00f5ff',
                  fontFamily: 'Orbitron, monospace',
                  textShadow: '0 0 12px rgba(0,245,255,0.7)',
                }}
              >
                {formatTime(survivalTime)}
              </div>
            </div>

            <div
              className="rounded-lg p-3 text-center relative overflow-hidden"
              style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}
            >
              {isNewBestBlocks && (
                <span className="absolute top-1 right-1 bg-green-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter">
                  NEW BEST!
                </span>
              )}
              <div className="text-[10px] text-white/40 tracking-widest mb-1">BLOCKS</div>
              <div
                className="text-2xl font-black"
                style={{
                  color: '#00ff88',
                  fontFamily: 'Orbitron, monospace',
                  textShadow: '0 0 12px rgba(0,255,136,0.7)',
                }}
              >
                {blockCount}
              </div>
            </div>
          </div>
        </div>

        {/* All-Time High Scores */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="text-[10px] text-purple-400/70 tracking-widest font-bold uppercase flex items-center gap-1">
            <span>🏆 HIGH SCORES (SESSION BEST)</span>
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <div
              className="rounded-lg p-2.5 text-center"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}
            >
              <div className="text-[9px] text-purple-300/50 tracking-widest mb-0.5">BEST TIME</div>
              <div
                className="text-lg font-bold"
                style={{ color: '#c084fc', fontFamily: 'Orbitron, monospace' }}
              >
                {formatTime(bestSurvivalTime)}
              </div>
            </div>

            <div
              className="rounded-lg p-2.5 text-center"
              style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)' }}
            >
              <div className="text-[9px] text-pink-300/50 tracking-widest mb-0.5">MOST BLOCKS</div>
              <div
                className="text-lg font-bold"
                style={{ color: '#f472b6', fontFamily: 'Orbitron, monospace' }}
              >
                {bestBlockCount}
              </div>
            </div>
          </div>
        </div>

        {/* Monetization CTAs */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Watch Ad to Revive */}
          {revivesLeft > 0 && (
            <button
              onClick={handleWatchAd}
              className="w-full py-2.5 px-4 rounded-lg font-bold text-xs tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-100"
              style={{
                fontFamily: 'Orbitron, monospace',
                background: 'linear-gradient(90deg, rgba(255,200,0,0.15) 0%, rgba(255,150,0,0.15) 100%)',
                border: '1px solid rgba(255,200,0,0.4)',
                color: '#ffd700',
                boxShadow: '0 0 20px rgba(255,200,0,0.1)',
              }}
            >
              ▶ WATCH AD TO REVIVE
              <span className="text-[10px] font-normal text-yellow-400/60 ml-2">({revivesLeft} left)</span>
            </button>
          )}

          {/* Premium Skins — Stripe */}
          <button
            onClick={openStripeCheckout}
            className="w-full py-2.5 px-4 rounded-lg font-bold text-xs tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-100"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(90deg, rgba(0,255,136,0.1) 0%, rgba(0,200,255,0.1) 100%)',
              border: '1px solid rgba(0,255,136,0.35)',
              color: '#00ff88',
              boxShadow: '0 0 20px rgba(0,255,136,0.08)',
            }}
          >
            💎 BUY PREMIUM NEON SKINS ($0.99)
          </button>
        </div>

        {/* Action buttons */}
        <div className="w-full flex gap-3">
          <button
            onClick={handlePlayAgain}
            className="flex-1 py-3 rounded-lg text-sm font-black tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(90deg, #00f5ff 0%, #00aaff 100%)',
              color: '#050515',
              boxShadow: '0 0 20px rgba(0,245,255,0.4)',
            }}
          >
            🔄 PLAY AGAIN
          </button>
          <button
            onClick={resetToLobby}
            className="flex-1 py-3 rounded-lg text-sm font-bold tracking-wider transition-all duration-200 hover:scale-[1.02]"
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
