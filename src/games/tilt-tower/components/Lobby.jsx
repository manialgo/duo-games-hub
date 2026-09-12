/**
 * Lobby.jsx — Landing page with Create Game / Join Game flows
 *
 * createRoom / joinRoom are passed down from App (which owns the single
 * usePeer() call) so the P2P connection is never destroyed between screens.
 */
import React, { useState, useCallback } from 'react'
import useGameStore from '../store/gameStore'
import HowToPlay from './HowToPlay'

export default function Lobby({ createRoom, joinRoom }) {
  const [view, setView] = useState('home')        // 'home' | 'create' | 'join'
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const { roomCode, connectionStatus, connectionError, playerRole } = useGameStore()

  // ── Handle Create ─────────────────────────────────────
  const handleCreate = useCallback(() => {
    setView('create')
    createRoom()
  }, [createRoom])

  // ── Handle Join ───────────────────────────────────────
  const handleJoin = useCallback(() => {
    if (joinCode.length < 4) return
    joinRoom(joinCode)
    setView('join')
  }, [joinCode, joinRoom])

  // ── Copy room code ─────────────────────────────────────
  const copyCode = useCallback(() => {
    if (!roomCode) return
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [roomCode])

  const isWaiting = connectionStatus === 'waiting'
  const isError = connectionStatus === 'error'

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-dark-900 overflow-hidden select-none">

      {/* ── Animated background grid ── */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Glowing orbs ── */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00f5ff 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ff00ff 0%, transparent 70%)' }}
      />

      {/* ── Main card ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">

        {/* Logo / Title */}
        <div className="mb-10 text-center">
          <div className="text-5xl font-black tracking-wider glow-cyan mb-1"
            style={{ fontFamily: 'Orbitron, monospace', color: '#00f5ff' }}>
            TILT
          </div>
          <div className="text-5xl font-black tracking-wider glow-pink mb-1"
            style={{ fontFamily: 'Orbitron, monospace', color: '#ff00ff' }}>
            TOWER
          </div>
          <div className="text-xl font-bold tracking-[0.4em] text-white/40 mt-1">
            CO-OP
          </div>
          <p className="mt-4 text-sm text-white/30 tracking-widest">
            2-PLAYER COOPERATIVE BALANCING
          </p>
        </div>

        {/* ── HOME view ── */}
        {view === 'home' && (
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={handleCreate}
              className="btn-neon w-full text-center"
              style={{
                color: '#00f5ff',
                borderColor: 'rgba(0,245,255,0.5)',
                background: 'rgba(0,245,255,0.07)',
                boxShadow: '0 0 20px rgba(0,245,255,0.15)',
              }}
            >
              ⬡ Create Game
            </button>

            <div className="relative w-full flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/20 text-xs tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={() => setView('joinInput')}
              className="btn-neon w-full text-center"
              style={{
                color: '#ff00ff',
                borderColor: 'rgba(255,0,255,0.5)',
                background: 'rgba(255,0,255,0.07)',
                boxShadow: '0 0 20px rgba(255,0,255,0.15)',
              }}
            >
              ⬡ Join Game
            </button>

            {/* How to Play button */}
            <button
              onClick={() => setShowHelp(true)}
              className="mt-4 w-full py-3 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 hover:scale-[1.02] group"
              style={{
                fontFamily: 'Orbitron, monospace',
                color: 'rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <span className="mr-2">?</span>
              HOW TO PLAY
              <span className="ml-2">?</span>
            </button>
          </div>
        )}

        {/* ── JOIN INPUT view ── */}
        {view === 'joinInput' && (
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={() => setView('home')}
              className="text-white/30 text-xs tracking-widest hover:text-white/60 transition-colors mb-2 text-left"
            >
              ← BACK
            </button>
            <p className="text-white/40 text-sm tracking-widest text-center mb-2">
              ENTER ROOM CODE
            </p>
            <input
              className="room-input w-full px-4 py-4 rounded"
              type="text"
              maxLength={4}
              placeholder="XXXX"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
            <button
              onClick={handleJoin}
              disabled={joinCode.length < 4}
              className="btn-neon w-full text-center mt-2"
              style={{
                color: '#ff00ff',
                borderColor: joinCode.length < 4 ? 'rgba(255,0,255,0.2)' : 'rgba(255,0,255,0.5)',
                background: joinCode.length < 4 ? 'rgba(255,0,255,0.02)' : 'rgba(255,0,255,0.07)',
                opacity: joinCode.length < 4 ? 0.5 : 1,
                cursor: joinCode.length < 4 ? 'not-allowed' : 'pointer',
              }}
            >
              Join →
            </button>
          </div>
        )}

        {/* ── CREATE / WAITING view ── */}
        {view === 'create' && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="text-white/40 text-xs tracking-widest">YOUR ROOM CODE</div>

            {roomCode ? (
              <>
                <button
                  onClick={copyCode}
                  className="relative cursor-pointer group"
                  title="Click to copy"
                >
                  <div className="text-5xl font-black tracking-[0.5em] pl-[0.5em]"
                    style={{ color: '#00f5ff', fontFamily: 'Orbitron, monospace',
                      textShadow: '0 0 30px rgba(0,245,255,0.7), 0 0 60px rgba(0,245,255,0.4)' }}>
                    {roomCode}
                  </div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-white/30 text-xs tracking-widest group-hover:text-white/60 transition-colors">
                    {copied ? '✓ COPIED!' : 'CLICK TO COPY'}
                  </div>
                </button>

                <div className="mt-8 flex items-center gap-3 text-white/40 text-sm">
                  {isWaiting ? (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-cyan-400/60 border-t-transparent spin" />
                      <span className="tracking-widest text-xs">WAITING FOR PLAYER 2…</span>
                    </>
                  ) : isError ? (
                    <span className="text-red-400 text-xs">{connectionError}</span>
                  ) : (
                    <span className="text-neon-green text-xs tracking-widest glow-green">✓ PLAYER 2 CONNECTED</span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-white/40">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400/60 border-t-transparent spin" />
                <span className="text-xs tracking-widest">GENERATING CODE…</span>
              </div>
            )}

            <button
              onClick={() => { setView('home'); useGameStore.getState().resetToLobby() }}
              className="mt-4 text-white/20 text-xs tracking-widest hover:text-white/50 transition-colors"
            >
              ← CANCEL
            </button>
          </div>
        )}

        {/* ── JOIN / CONNECTING view ── */}
        {view === 'join' && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="text-white/40 text-xs tracking-widest">JOINING ROOM</div>
            <div className="text-4xl font-black tracking-[0.5em] pl-[0.5em]"
              style={{ color: '#ff00ff', fontFamily: 'Orbitron, monospace',
                textShadow: '0 0 30px rgba(255,0,255,0.7)' }}>
              {roomCode}
            </div>

            {isWaiting ? (
              <div className="flex items-center gap-3 text-white/40">
                <div className="w-4 h-4 rounded-full border-2 border-pink-500/60 border-t-transparent spin" />
                <span className="text-xs tracking-widest">CONNECTING…</span>
              </div>
            ) : isError ? (
              <div className="text-center">
                <p className="text-red-400 text-sm mb-4">{connectionError}</p>
                <button
                  onClick={() => setView('joinInput')}
                  className="text-white/40 text-xs tracking-widest hover:text-white/70 transition-colors"
                >
                  ← TRY AGAIN
                </button>
              </div>
            ) : (
              <span className="text-neon-green text-sm tracking-widest glow-green">✓ CONNECTED — STARTING!</span>
            )}

            <button
              onClick={() => { setView('home'); useGameStore.getState().resetToLobby() }}
              className="mt-2 text-white/20 text-xs tracking-widest hover:text-white/50 transition-colors"
            >
              ← CANCEL
            </button>
          </div>
        )}

      </div>

      {/* ── Version badge ── */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/15 text-xs tracking-widest">
        v1.0.0 · SERVERLESS P2P · POWERED BY PEERJS
      </div>

      {/* ── How to Play modal ── */}
      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </div>
  )
}
