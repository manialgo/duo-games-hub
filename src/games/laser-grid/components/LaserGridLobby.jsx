/**
 * LaserGridLobby.jsx — Landing lobby for Laser Grid Co-Op
 */
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useLaserGridStore from '../store/laserGridStore'
import LaserGridHowToPlay from './LaserGridHowToPlay'

export default function LaserGridLobby({ createRoom, joinRoom }) {
  const { roomCode, connectionStatus, connectionError, startGame, setPlayerRole } = useLaserGridStore()
  const [joinInput, setJoinInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleCopy = () => {
    if (!roomCode) return
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSoloPlay = () => {
    setPlayerRole('solo')
    startGame()
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-[#050515] p-4 text-white overflow-hidden">
      {/* Background grid overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,0,85,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Lobby Container */}
      <div
        className="relative z-10 w-full max-w-lg p-8 rounded-2xl flex flex-col items-center gap-6"
        style={{
          background: 'linear-gradient(145deg, rgba(12,12,35,0.95) 0%, rgba(25,5,40,0.95) 100%)',
          border: '1px solid rgba(255,0,85,0.3)',
          boxShadow: '0 0 60px rgba(255,0,85,0.15), 0 0 100px rgba(0,245,255,0.1)',
        }}
      >
        {/* Title Header */}
        <div className="text-center">
          <div
            className="text-3xl md:text-4xl font-black tracking-wider"
            style={{
              color: '#ff0055',
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 20px rgba(255,0,85,0.8), 0 0 40px rgba(255,0,85,0.4)',
            }}
          >
            LASER GRID CO-OP
          </div>
          <div className="text-cyan-400 text-xs tracking-widest mt-1 font-semibold">
            2-PLAYER OPTICAL PUZZLE DUO
          </div>
        </div>

        {/* Connection Status Box */}
        {connectionStatus === 'waiting' && roomCode && (
          <div className="w-full p-4 rounded-xl text-center bg-pink-950/40 border border-pink-500/40 flex flex-col items-center gap-2">
            <div className="text-xs text-white/50 tracking-widest uppercase">SHARE THIS ROOM CODE WITH PLAYER 2</div>
            <div
              className="text-4xl font-black tracking-widest text-pink-400 cursor-pointer hover:scale-105 transition-transform"
              onClick={handleCopy}
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {roomCode}
            </div>
            <button
              onClick={handleCopy}
              className="text-xs text-cyan-400 underline tracking-wider font-semibold hover:text-cyan-300"
            >
              {copied ? '✓ COPIED TO CLIPBOARD!' : 'CLICK TO COPY CODE'}
            </button>
            <div className="text-xs text-white/40 animate-pulse mt-1">WAITING FOR PLAYER 2 TO JOIN...</div>
          </div>
        )}

        {/* Error Alert */}
        {connectionError && (
          <div className="w-full p-3.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 text-xs text-center font-medium flex flex-col items-center gap-2">
            <span>⚠️ {connectionError}</span>
            <button
              onClick={() => createRoom()}
              className="px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-400/50 text-red-200 font-bold text-xs hover:bg-red-500/30 transition"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ⚡ RETRY ROOM CREATION
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3.5 mt-1">
          {/* Host Game Button */}
          <button
            onClick={() => createRoom()}
            className="w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all duration-200 hover:scale-[1.02] active:scale-98"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'linear-gradient(90deg, #ff0055 0%, #ff5500 100%)',
              color: '#ffffff',
              boxShadow: '0 0 25px rgba(255,0,85,0.4)',
            }}
          >
            CREATE ROOM (HOST - P1)
          </button>

          {/* Join Game Section */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="4-LETTER CODE"
              maxLength={4}
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 rounded-xl bg-dark-800/80 border border-cyan-500/40 text-cyan-400 text-center font-bold tracking-widest focus:outline-none focus:border-cyan-400"
              style={{ fontFamily: 'Orbitron, monospace' }}
            />
            <button
              onClick={() => joinRoom(joinInput)}
              disabled={joinInput.length < 4}
              className="px-6 py-3 rounded-xl font-black text-xs tracking-widest transition-all disabled:opacity-40"
              style={{
                fontFamily: 'Orbitron, monospace',
                background: 'rgba(0,245,255,0.15)',
                border: '1px solid #00f5ff',
                color: '#00f5ff',
                boxShadow: joinInput.length === 4 ? '0 0 20px rgba(0,245,255,0.3)' : 'none',
              }}
            >
              JOIN (P2)
            </button>
          </div>

          {/* Solo Test Mode */}
          <button
            onClick={handleSoloPlay}
            className="w-full py-3 rounded-xl font-bold text-xs tracking-widest transition-all hover:bg-white/10"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            🎮 SOLO PRACTICE / TEST MODE
          </button>

          {/* How to Play Guide Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="w-full py-3 rounded-xl font-bold text-xs tracking-widest transition-all hover:scale-[1.01]"
            style={{
              fontFamily: 'Orbitron, monospace',
              background: 'rgba(0,245,255,0.05)',
              border: '1px solid rgba(0,245,255,0.3)',
              color: '#00f5ff',
            }}
          >
            ❓ HOW TO PLAY LASER GRID ❓
          </button>
        </div>

        {/* Quick Role Info */}
        <div className="w-full grid grid-cols-2 gap-3 mt-2 text-xs text-white/50">
          <div className="p-3 rounded-lg bg-pink-950/20 border border-pink-500/20">
            <div className="font-bold text-pink-400 mb-1 font-mono">PLAYER 1 (RED)</div>
            <div>Controls Laser Emitters & direction angles to align initial beams.</div>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
            <div className="font-bold text-cyan-400 mb-1 font-mono">PLAYER 2 (BLUE)</div>
            <div>Selects and rotates Optical Mirrors ($45^\circ / 90^\circ$) to reflect beams to targets.</div>
          </div>
        </div>

        {/* Back Link */}
        <Link
          to="/"
          className="text-xs text-white/30 hover:text-white/70 tracking-widest transition-colors mt-2"
        >
          ← BACK TO DUO GAMES HUB
        </Link>
      </div>

      {/* How to Play Overlay Modal */}
      {showHelp && <LaserGridHowToPlay onClose={() => setShowHelp(false)} />}
    </div>
  )
}
