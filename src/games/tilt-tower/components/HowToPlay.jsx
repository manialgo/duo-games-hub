/**
 * HowToPlay.jsx — Animated "How to Play" modal overlay
 *
 * Shows:
 *  - Animated platform + falling blocks illustration (pure CSS)
 *  - Step-by-step game rules
 *  - Controls for both players
 *  - Win/loss conditions
 */
import React, { useState, useEffect } from 'react'

/* ── tiny reusable key badge ── */
function Key({ children }) {
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold tracking-wider mx-0.5"
      style={{
        fontFamily: 'Orbitron, monospace',
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.07)',
        color: '#fff',
        minWidth: '2rem',
        boxShadow: '0 2px 0 rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </span>
  )
}

/* ── animated floating block ── */
function AnimBlock({ color, style, shape = 'square' }) {
  return (
    <div
      style={{
        width: shape === 'circle' ? 18 : 20,
        height: shape === 'circle' ? 18 : shape === 'rect' ? 28 : 20,
        borderRadius: shape === 'circle' ? '50%' : shape === 'rect' ? '3px' : '3px',
        background: color,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}55`,
        ...style,
      }}
    />
  )
}

/* ── mini platform illustration ── */
function PlatformIllustration() {
  const [tilt, setTilt] = useState(0)
  const [blocks, setBlocks] = useState([
    { id: 1, x: 50, y: -40, color: '#00f5ff', shape: 'square' },
    { id: 2, x: 80, y: -80, color: '#ff00ff', shape: 'circle' },
    { id: 3, x: 30, y: -120, color: '#00ff88', shape: 'rect' },
  ])

  // Animate tilt back and forth
  useEffect(() => {
    let frame
    let t = 0
    const animate = () => {
      t += 0.015
      setTilt(Math.sin(t) * 14)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Animate blocks falling
  useEffect(() => {
    const id = setInterval(() => {
      setBlocks(prev => prev.map(b => ({
        ...b,
        y: b.y >= 20 ? -120 - Math.random() * 60 : b.y + 2.5,
        x: b.y >= 20 ? 20 + Math.random() * 80 : b.x,
      })))
    }, 30)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative mx-auto" style={{ width: 160, height: 130 }}>
      {/* Falling blocks */}
      {blocks.map(b => (
        <div key={b.id} className="absolute" style={{ left: `${b.x}%`, top: b.y, transform: 'translateX(-50%)' }}>
          <AnimBlock color={b.color} shape={b.shape} style={{}} />
        </div>
      ))}

      {/* Platform */}
      <div
        className="absolute bottom-4 left-1/2"
        style={{
          width: 130,
          height: 12,
          marginLeft: -65,
          borderRadius: 4,
          background: 'linear-gradient(90deg, #0d0d2b, #1a1a40)',
          border: '1.5px solid #00f5ff',
          boxShadow: '0 0 12px #00f5ff88, 0 4px 20px rgba(0,245,255,0.2)',
          transform: `rotate(${tilt}deg)`,
          transition: 'transform 0.05s linear',
        }}
      />

      {/* Glow below platform */}
      <div
        className="absolute bottom-2 left-1/2"
        style={{
          width: 80,
          height: 6,
          marginLeft: -40,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,245,255,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Void label */}
      <div className="absolute bottom-0 left-0 right-0 text-center text-white/20 text-xs tracking-widest">
        THE VOID
      </div>
    </div>
  )
}

/* ── step card ── */
function Step({ number, color, title, children }) {
  return (
    <div
      className="flex gap-4 p-4 rounded-lg"
      style={{
        background: `rgba(${color}, 0.05)`,
        border: `1px solid rgba(${color}, 0.2)`,
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
        style={{
          fontFamily: 'Orbitron, monospace',
          background: `rgba(${color}, 0.15)`,
          border: `1.5px solid rgba(${color}, 0.5)`,
          color: `rgb(${color})`,
          boxShadow: `0 0 10px rgba(${color}, 0.3)`,
        }}
      >
        {number}
      </div>
      <div>
        <div className="font-bold text-sm tracking-wider mb-1" style={{ color: `rgb(${color})`, fontFamily: 'Orbitron, monospace' }}>
          {title}
        </div>
        <div className="text-white/50 text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════ */
export default function HowToPlay({ onClose }) {
  const [page, setPage] = useState(0)  // 0 = overview, 1 = controls, 2 = tips

  const pages = [
    {
      label: 'OVERVIEW',
      content: (
        <div className="flex flex-col gap-4">
          {/* Live illustration */}
          <div className="py-2">
            <PlatformIllustration />
          </div>

          <Step number="1" color="0,245,255" title="THE PLATFORM">
            A glowing neon platform floats in a dark void. You and your partner
            must keep it balanced together — neither of you can do it alone.
          </Step>
          <Step number="2" color="255,0,255" title="THE BLOCKS">
            Every <strong className="text-white/70">1.8 seconds</strong>, a random
            3D shape — cube, sphere, cylinder, prism, or pyramid — drops from above. They stack
            up. Don't let them fall off the edge!
          </Step>
          <Step number="3" color="0,255,136" title="SURVIVE">
            The longer you survive together, the higher your score. One block
            falls off the edge → <strong className="text-red-400">Game Over.</strong>
          </Step>
        </div>
      ),
    },
    {
      label: 'CONTROLS',
      content: (
        <div className="flex flex-col gap-5">
          {/* Player 1 */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'rgba(0,245,255,0.05)',
              border: '1px solid rgba(0,245,255,0.25)',
            }}
          >
            <div
              className="text-base font-black tracking-widest mb-3"
              style={{
                color: '#00f5ff',
                fontFamily: 'Orbitron, monospace',
                textShadow: '0 0 12px rgba(0,245,255,0.6)',
              }}
            >
              ⬡ PLAYER 1 — HOST
            </div>
            <div className="text-white/40 text-xs tracking-wider mb-4">
              Creates the room · Controls the <strong className="text-white/60">X-axis</strong> (left/right tilt)
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Key>A</Key>
                <div className="text-white/30 text-xs">Tilt Left</div>
              </div>

              {/* Visual tilt diagram */}
              <div className="relative flex flex-col items-center gap-1">
                <div className="text-white/20 text-xs tracking-widest">PLATFORM</div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 text-lg">↙</span>
                  <div style={{
                    width: 50, height: 6, borderRadius: 3,
                    background: 'linear-gradient(90deg, #0d0d2b, #1a1a40)',
                    border: '1px solid #00f5ff',
                    boxShadow: '0 0 8px #00f5ff66',
                  }} />
                  <span className="text-cyan-400 text-lg">↘</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Key>D</Key>
                <div className="text-white/30 text-xs">Tilt Right</div>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'rgba(255,0,255,0.05)',
              border: '1px solid rgba(255,0,255,0.25)',
            }}
          >
            <div
              className="text-base font-black tracking-widest mb-3"
              style={{
                color: '#ff00ff',
                fontFamily: 'Orbitron, monospace',
                textShadow: '0 0 12px rgba(255,0,255,0.6)',
              }}
            >
              ⬡ PLAYER 2 — CLIENT
            </div>
            <div className="text-white/40 text-xs tracking-wider mb-4">
              Joins with a code · Controls the <strong className="text-white/60">Z-axis</strong> (forward/back tilt)
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Key>↑</Key>
                <div className="text-white/30 text-xs">Tilt Forward</div>
              </div>

              <div className="relative flex flex-col items-center gap-1">
                <div className="text-white/20 text-xs tracking-widest">PLATFORM</div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-400 text-lg">↗</span>
                  <div style={{
                    width: 50, height: 6, borderRadius: 3,
                    background: 'linear-gradient(90deg, #0d0d2b, #1a1a40)',
                    border: '1px solid #ff00ff',
                    boxShadow: '0 0 8px #ff00ff66',
                  }} />
                  <span className="text-pink-400 text-lg">↙</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Key>↓</Key>
                <div className="text-white/30 text-xs">Tilt Back</div>
              </div>
            </div>
          </div>

          <div className="text-center text-white/25 text-xs tracking-wider px-2">
            Both players tilt at the same time — communicate to keep blocks centered!
          </div>
        </div>
      ),
    },
    {
      label: 'TIPS',
      content: (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                icon: '🎯',
                color: '0,245,255',
                title: 'Keep blocks centered',
                tip: 'Try to tilt the platform back to level after each block lands. A flat platform keeps everything balanced.',
              },
              {
                icon: '🗣️',
                color: '255,0,255',
                title: 'Communicate!',
                tip: 'Call out which way the stack is leaning. Player 1 handles left/right, Player 2 handles forward/back — coordinate!',
              },
              {
                icon: '⚡',
                color: '255,200,0',
                title: 'Slow is fast',
                tip: 'Overcorrecting causes more blocks to fall. Small, gentle tilts are more effective than big swings.',
              },
              {
                icon: '💎',
                color: '0,255,136',
                title: 'Watch Ad to Revive',
                tip: 'On Game Over, you get 1 free revive by watching a short ad. Physics reset, but the timer keeps running!',
              },
              {
                icon: '🏆',
                color: '200,100,255',
                title: 'Beat your record',
                tip: 'Your survival time is shown at Game Over. Share your score and challenge friends to beat it!',
              },
            ].map(({ icon, color, title, tip }) => (
              <div
                key={title}
                className="flex gap-3 p-3 rounded-lg"
                style={{
                  background: `rgba(${color}, 0.04)`,
                  border: `1px solid rgba(${color}, 0.15)`,
                }}
              >
                <div className="text-xl flex-shrink-0">{icon}</div>
                <div>
                  <div
                    className="text-xs font-bold tracking-wider mb-1"
                    style={{ color: `rgb(${color})`, fontFamily: 'Orbitron, monospace' }}
                  >
                    {title}
                  </div>
                  <div className="text-white/40 text-xs leading-relaxed">{tip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,16,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-md flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a0a1e 0%, #10052a 100%)',
          border: '1px solid rgba(0,245,255,0.2)',
          boxShadow: '0 0 80px rgba(0,245,255,0.08), 0 0 40px rgba(255,0,255,0.06)',
          maxHeight: '90vh',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <div
              className="text-lg font-black tracking-widest"
              style={{
                fontFamily: 'Orbitron, monospace',
                color: '#00f5ff',
                textShadow: '0 0 16px rgba(0,245,255,0.6)',
              }}
            >
              HOW TO PLAY
            </div>
            <div className="text-white/25 text-xs tracking-widest mt-0.5">TILT TOWER CO-OP</div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors text-xl font-light"
            style={{ lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="flex flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {pages.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPage(i)}
              className="flex-1 py-3 text-xs font-bold tracking-widest transition-all duration-200"
              style={{
                fontFamily: 'Orbitron, monospace',
                color: page === i ? '#00f5ff' : 'rgba(255,255,255,0.25)',
                borderBottom: page === i ? '2px solid #00f5ff' : '2px solid transparent',
                background: page === i ? 'rgba(0,245,255,0.04)' : 'transparent',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Page content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ scrollbarWidth: 'thin' }}>
          {pages[page].content}
        </div>

        {/* ── Footer navigation ── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs tracking-widest transition-colors"
            style={{
              fontFamily: 'Orbitron, monospace',
              color: page === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.35)',
              cursor: page === 0 ? 'default' : 'pointer',
            }}
          >
            ← PREV
          </button>

          {/* Page dots */}
          <div className="flex gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === page ? 20 : 6,
                  height: 6,
                  background: i === page ? '#00f5ff' : 'rgba(255,255,255,0.15)',
                  boxShadow: i === page ? '0 0 8px #00f5ff' : 'none',
                }}
              />
            ))}
          </div>

          {page < pages.length - 1 ? (
            <button
              onClick={() => setPage(p => Math.min(pages.length - 1, p + 1))}
              className="text-xs tracking-widest transition-colors"
              style={{
                fontFamily: 'Orbitron, monospace',
                color: 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
              }}
            >
              NEXT →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-bold tracking-widest transition-all duration-200 hover:scale-105"
              style={{
                fontFamily: 'Orbitron, monospace',
                color: '#00ff88',
                textShadow: '0 0 10px rgba(0,255,136,0.6)',
              }}
            >
              LET'S PLAY! →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
