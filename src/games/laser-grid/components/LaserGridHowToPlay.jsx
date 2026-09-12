/**
 * LaserGridHowToPlay.jsx — How to Play overlay for Laser Grid Co-Op
 *
 * Features:
 *  - Animated optics laser illustration (pure Canvas/SVG)
 *  - Player roles & key controls (Player 1 Red vs Player 2 Blue/Mirrors)
 *  - Optical mechanics guide (Reflection, Beam Splitters, RGB Frequency Synthesis)
 *  - Step-by-step tips
 */
import React, { useState, useEffect } from 'react'

/* Mini animated optics canvas illustration */
function LaserIllustration() {
  const [angle, setAngle] = useState(45)

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((a) => (a === 45 ? 135 : 45))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: 220, height: 140 }}>
      <svg width="220" height="140" className="rounded-xl border border-cyan-500/30 bg-[#070720]">
        {/* Grid lines */}
        <line x1="0" y1="70" x2="220" y2="70" stroke="rgba(0,245,255,0.1)" strokeWidth="1" />
        <line x1="110" y1="0" x2="110" y2="140" stroke="rgba(0,245,255,0.1)" strokeWidth="1" />

        {/* Emitter */}
        <circle cx="30" cy="70" r="10" fill="#ff0055" />
        <text x="30" y="74" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="Orbitron">P1</text>

        {/* Target Core */}
        <circle cx="110" cy="20" r="12" fill="none" stroke="#ff0055" strokeWidth="2" />
        <circle cx="110" cy="20" r="5" fill="#ff0055" className="animate-ping" />

        {/* Mirror */}
        <g transform={`translate(110,70) rotate(${angle})`}>
          <rect x="-20" y="-3" width="40" height="6" fill="#0a2035" rx="2" />
          <line x1="-20" y1="0" x2="20" y2="0" stroke="#00f5ff" strokeWidth="3" />
        </g>
        <text x="110" y="95" textAnchor="middle" fill="#00f5ff" fontSize="9" fontFamily="Orbitron">
          MIRROR ({angle}°)
        </text>

        {/* Laser Beams */}
        {/* Beam 1: Emitter to Mirror */}
        <line x1="30" y1="70" x2="110" y2="70" stroke="#ff0055" strokeWidth="3" strokeLinecap="round" />
        <line x1="30" y1="70" x2="110" y2="70" stroke="#ffffff" strokeWidth="1" />

        {/* Beam 2: Reflected Beam to Target */}
        {angle === 135 && (
          <>
            <line x1="110" y1="70" x2="110" y2="20" stroke="#ff0055" strokeWidth="3" strokeLinecap="round" />
            <line x1="110" y1="70" x2="110" y2="20" stroke="#ffffff" strokeWidth="1" />
          </>
        )}
      </svg>
    </div>
  )
}

function Key({ children }) {
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold tracking-wider mx-0.5"
      style={{
        fontFamily: 'Orbitron, monospace',
        border: '1px solid rgba(0,245,255,0.4)',
        background: 'rgba(0,245,255,0.1)',
        color: '#00f5ff',
        minWidth: '1.8rem',
      }}
    >
      {children}
    </span>
  )
}

export default function LaserGridHowToPlay({ onClose }) {
  const [page, setPage] = useState(0)

  const pages = [
    {
      label: 'OVERVIEW',
      content: (
        <div className="flex flex-col gap-4">
          <div className="py-1">
            <LaserIllustration />
          </div>

          <div className="p-3 rounded-lg bg-pink-950/20 border border-pink-500/20 text-xs">
            <div className="font-bold text-pink-400 font-mono mb-1">1. OPTICAL GRID</div>
            <div className="text-white/60 leading-relaxed">
              Lasers shoot across an 8x8 grid. Work together to position mirrors and prisms so every laser hits its matching target core.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs">
            <div className="font-bold text-cyan-400 font-mono mb-1">2. GLASS MIRRORS</div>
            <div className="text-white/60 leading-relaxed">
              Clicking a mirror rotates its angle ($45^\circ / 90^\circ / 135^\circ$). Lasers reflect at exact $90^\circ$ right angles.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 text-xs">
            <div className="font-bold text-purple-400 font-mono mb-1">3. FREQUENCY SYNTHESIS</div>
            <div className="text-white/60 leading-relaxed">
              Combine Red and Blue lasers into a <strong className="text-purple-300">Purple Master Beam</strong> by directing both through a Prism to activate High-Energy Targets!
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'ROLES & CONTROLS',
      content: (
        <div className="flex flex-col gap-4 text-xs">
          {/* Player 1 */}
          <div className="p-4 rounded-xl bg-pink-950/30 border border-pink-500/30">
            <div className="text-sm font-black text-pink-400 font-mono mb-1">⬡ PLAYER 1 — EMITTER CONTROLLER</div>
            <div className="text-white/40 mb-3">Host · Controls Red Lasers & Emitter Directions</div>
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-pink-500/20">
              <span className="text-white/70">Click Emitter:</span>
              <span className="text-pink-300 font-bold">Rotate Direction (N → E → S → W)</span>
            </div>
          </div>

          {/* Player 2 */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
            <div className="text-sm font-black text-cyan-400 font-mono mb-1">⬡ PLAYER 2 — OPTICS SPECIALIST</div>
            <div className="text-white/40 mb-3">Client · Controls Mirror Angles & Blue Lasers</div>
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-cyan-500/20">
              <span className="text-white/70">Click Mirror:</span>
              <span className="text-cyan-300 font-bold">Rotate Angle (+45°)</span>
            </div>
          </div>

          <div className="text-center text-white/30 text-[11px] font-mono mt-1">
            (In Solo Mode, you control both Emitters and Mirrors!)
          </div>
        </div>
      ),
    },
    {
      label: 'TIPS & TRICKS',
      content: (
        <div className="flex flex-col gap-3 text-xs">
          {[
            {
              icon: '🪞',
              title: 'Watch the Reflection Path',
              desc: 'Trace where the beam will exit before rotating a mirror. A single 45° shift changes the path completely.',
              color: '#00f5ff',
            },
            {
              icon: '💎',
              title: 'Beam Splitters',
              desc: 'Splitters pass 1 beam straight through AND reflect a perpendicular secondary beam.',
              color: '#ff0055',
            },
            {
              icon: '🔮',
              title: 'Color Synthesis',
              desc: 'Purple cores require BOTH Red & Blue lasers entering the same prism simultaneously.',
              color: '#aa00ff',
            },
            {
              icon: '⚡',
              title: 'Communicate over WebRTC',
              desc: 'Call out mirror positions with your partner to align multi-stage reflections faster!',
              color: '#ffff00',
            },
          ].map((t) => (
            <div
              key={t.title}
              className="flex gap-3 p-3 rounded-lg"
              style={{ background: `${t.color}0d`, border: `1px solid ${t.color}30` }}
            >
              <div className="text-xl flex-shrink-0">{t.icon}</div>
              <div>
                <div className="font-bold mb-0.5" style={{ color: t.color, fontFamily: 'Orbitron, monospace' }}>
                  {t.title}
                </div>
                <div className="text-white/50 leading-relaxed">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative w-full max-w-md flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a0a22 0%, #180530 100%)',
          border: '1px solid rgba(0,245,255,0.3)',
          boxShadow: '0 0 80px rgba(0,245,255,0.15)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <div
              className="text-lg font-black tracking-widest text-cyan-400"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              HOW TO PLAY
            </div>
            <div className="text-white/30 text-[10px] tracking-widest">LASER GRID CO-OP</div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl font-light">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {pages.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPage(i)}
              className="flex-1 py-3 text-[11px] font-bold tracking-wider transition-all"
              style={{
                fontFamily: 'Orbitron, monospace',
                color: page === i ? '#00f5ff' : 'rgba(255,255,255,0.3)',
                borderBottom: page === i ? '2px solid #00f5ff' : '2px solid transparent',
                background: page === i ? 'rgba(0,245,255,0.05)' : 'transparent',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">{pages[page].content}</div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs text-white/40 hover:text-white disabled:opacity-20"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            ← PREV
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {pages.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === page ? 18 : 6,
                  height: 6,
                  background: i === page ? '#00f5ff' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>

          {page < pages.length - 1 ? (
            <button
              onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              NEXT →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs text-pink-400 hover:text-pink-300 font-black tracking-widest"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              PLAY NOW! →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
