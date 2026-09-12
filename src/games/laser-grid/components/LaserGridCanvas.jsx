/**
 * LaserGridCanvas.jsx — HTML5 Canvas optics engine for Laser Grid Co-Op
 *
 * Features:
 *  - Real-time 2D raytracing with reflections, splitters, & color synthesis
 *  - Neon glass mirrors with rotation controls
 *  - Energy target charging & particle sparks
 *  - Player-click handlers with WebRTC synchronization
 */
import React, { useRef, useEffect, useCallback } from 'react'
import useLaserGridStore, { LEVELS } from '../store/laserGridStore'

const GRID_SIZE = 8
const COLOR_RED = '#ff0055'
const COLOR_BLUE = '#00f5ff'
const COLOR_PURPLE = '#aa00ff'

export default function LaserGridCanvas({ sendMirrorRotate, sendEmitterDir, sendLevelClear }) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const particlesRef = useRef([])

  const {
    currentLevelIndex,
    gridItems,
    emitters,
    targets,
    rotateMirror,
    setEmitterDir,
    playerRole,
    setTargetsCharged,
    gamePhase,
    setGamePhase,
    peerSend,
  } = useLaserGridStore()

  // ── Raycasting Logic ─────────────────────────────────────────────
  const traceLaserBeams = useCallback(() => {
    const beams = []
    const chargedTargets = new Set()
    const activePrisms = new Map() // key: 'r,c' -> Set of colors

    // Helper: Direction vectors (dr, dc)
    const DIR_VECS = {
      E: [0, 1],
      W: [0, -1],
      N: [-1, 0],
      S: [1, 0],
    }

    const REFLECT_45 = { E: 'S', W: 'N', N: 'W', S: 'E' }  // \ mirror (45 deg)
    const REFLECT_135 = { E: 'N', W: 'S', N: 'E', S: 'W' } // / mirror (135 deg)

    emitters.forEach((emitter) => {
      let r = emitter.row
      let c = emitter.col
      let dir = emitter.dir
      let color = emitter.color

      let maxSteps = 40
      let beamPath = [{ r, c }]

      while (maxSteps-- > 0) {
        const [dr, dc] = DIR_VECS[dir]
        r += dr
        c += dc

        // Out of bounds check
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) break
        beamPath.push({ r, c })

        // Check grid items at (r, c)
        const item = gridItems.find((i) => i.row === r && i.col === c)
        if (item) {
          if (item.type === 'wall') {
            break // Wall absorbs laser
          }

          if (item.type === 'mirror') {
            // Reflect ray
            if (item.angle === 45) {
              dir = REFLECT_45[dir]
            } else if (item.angle === 135 || item.angle === 90) {
              dir = REFLECT_135[dir]
            } else {
              // 0 or 180 deg mirror flat reflection
              dir = REFLECT_45[dir]
            }
          }

          if (item.type === 'splitter') {
            // Main beam continues + split perpendicular beam
            const perpDir = REFLECT_135[dir]
            beams.push({
              color,
              path: [
                { r, c },
                { r: r + DIR_VECS[perpDir][0], c: c + DIR_VECS[perpDir][1] },
              ],
            })
          }

          if (item.type === 'prism') {
            const key = `${r},${c}`
            if (!activePrisms.has(key)) activePrisms.set(key, new Set())
            activePrisms.get(key).add(color)

            // If both red and blue enter prism, change color to purple master beam!
            if (activePrisms.get(key).size >= 2) {
              color = COLOR_PURPLE
            }
          }
        }

        // Check target hit at (r, c)
        const hitTarget = targets.find((t) => t.row === r && t.col === c)
        if (hitTarget) {
          if (
            hitTarget.requiredColor === color ||
            (hitTarget.requiredColor === COLOR_PURPLE && color === COLOR_PURPLE)
          ) {
            chargedTargets.add(hitTarget.id)

            // Add particle spark effect
            if (Math.random() < 0.3) {
              particlesRef.current.push({
                row: r,
                col: c,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color,
              })
            }
          }
        }
      }

      beams.push({ color, path: beamPath })
    })

    // Check level victory condition
    const allCharged = targets.length > 0 && targets.every((t) => chargedTargets.has(t.id))
    setTargetsCharged(allCharged)

    if (allCharged && gamePhase === 'playing') {
      setGamePhase('levelclear')
      if (peerSend) peerSend({ type: 'level_clear' })
    }

    return beams
  }, [emitters, gridItems, targets, gamePhase, setTargetsCharged, setGamePhase, peerSend])

  // ── Render Canvas ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let pulse = 0

    const render = () => {
      pulse += 0.05
      const width = canvas.width
      const height = canvas.height
      const tileSize = width / GRID_SIZE

      // Clear canvas
      ctx.fillStyle = '#060618'
      ctx.fillRect(0, 0, width, height)

      // 1. Draw Grid Lines
      ctx.strokeStyle = 'rgba(0,245,255,0.08)'
      ctx.lineWidth = 1
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath()
        ctx.moveTo(i * tileSize, 0)
        ctx.lineTo(i * tileSize, height)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, i * tileSize)
        ctx.lineTo(width, i * tileSize)
        ctx.stroke()
      }

      // 2. Draw Walls & Grid Items
      gridItems.forEach((item) => {
        const x = item.col * tileSize + tileSize / 2
        const y = item.row * tileSize + tileSize / 2

        if (item.type === 'wall') {
          ctx.fillStyle = '#121230'
          ctx.strokeStyle = '#ff0055'
          ctx.lineWidth = 2
          ctx.fillRect(item.col * tileSize + 4, item.row * tileSize + 4, tileSize - 8, tileSize - 8)
          ctx.strokeRect(item.col * tileSize + 4, item.row * tileSize + 4, tileSize - 8, tileSize - 8)
        }

        if (item.type === 'mirror') {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate((item.angle * Math.PI) / 180)

          // Mirror backing frame
          ctx.fillStyle = '#0a2035'
          ctx.fillRect(-tileSize * 0.35, -3, tileSize * 0.7, 6)

          // Reflective neon glass surface
          ctx.strokeStyle = '#00f5ff'
          ctx.lineWidth = 4
          ctx.shadowColor = '#00f5ff'
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.moveTo(-tileSize * 0.35, 0)
          ctx.lineTo(tileSize * 0.35, 0)
          ctx.stroke()

          ctx.restore()
        }

        if (item.type === 'splitter') {
          ctx.save()
          ctx.translate(x, y)
          ctx.fillStyle = 'rgba(0,245,255,0.2)'
          ctx.strokeStyle = '#00f5ff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(0, 0, tileSize * 0.3, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        }

        if (item.type === 'prism') {
          ctx.save()
          ctx.translate(x, y)
          ctx.fillStyle = 'rgba(170,0,255,0.25)'
          ctx.strokeStyle = '#aa00ff'
          ctx.lineWidth = 2
          ctx.shadowColor = '#aa00ff'
          ctx.shadowBlur = 12

          ctx.beginPath()
          ctx.moveTo(0, -tileSize * 0.35)
          ctx.lineTo(tileSize * 0.35, tileSize * 0.3)
          ctx.lineTo(-tileSize * 0.35, tileSize * 0.3)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        }
      })

      // 3. Draw Targets
      targets.forEach((target) => {
        const x = target.col * tileSize + tileSize / 2
        const y = target.row * tileSize + tileSize / 2
        const r = tileSize * 0.32

        ctx.save()
        ctx.fillStyle = 'rgba(10,10,30,0.8)'
        ctx.strokeStyle = target.requiredColor
        ctx.lineWidth = 3
        ctx.shadowColor = target.requiredColor
        ctx.shadowBlur = 15 + Math.sin(pulse) * 5

        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Core icon
        ctx.fillStyle = target.requiredColor
        ctx.beginPath()
        ctx.arc(x, y, r * 0.4, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      })

      // 4. Trace & Draw Glowing Laser Beams
      const beams = traceLaserBeams()
      beams.forEach(({ color, path }) => {
        if (path.length < 2) return

        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth = 4
        ctx.shadowColor = color
        ctx.shadowBlur = 16 + Math.sin(pulse) * 4
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        path.forEach((pt, idx) => {
          const px = pt.col * tileSize + tileSize / 2
          const py = pt.row * tileSize + tileSize / 2
          if (idx === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        })
        ctx.stroke()

        // Inner bright white laser core
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.shadowBlur = 0
        ctx.stroke()

        ctx.restore()
      })

      // 5. Draw Emitters
      emitters.forEach((e) => {
        const x = e.col * tileSize + tileSize / 2
        const y = e.row * tileSize + tileSize / 2

        ctx.save()
        ctx.fillStyle = e.color
        ctx.shadowColor = e.color
        ctx.shadowBlur = 15

        ctx.beginPath()
        ctx.arc(x, y, tileSize * 0.28, 0, Math.PI * 2)
        ctx.fill()

        // Direction arrow
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.beginPath()
        if (e.dir === 'E') { ctx.moveTo(x, y); ctx.lineTo(x + 12, y) }
        if (e.dir === 'W') { ctx.moveTo(x, y); ctx.lineTo(x - 12, y) }
        if (e.dir === 'N') { ctx.moveTo(x, y); ctx.lineTo(x, y - 12) }
        if (e.dir === 'S') { ctx.moveTo(x, y); ctx.lineTo(x, y + 12) }
        ctx.stroke()

        ctx.restore()
      })

      // 6. Particle spark physics update & render
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0)
      particlesRef.current.forEach((p) => {
        p.life -= 0.04
        const px = p.col * tileSize + tileSize / 2 + (1 - p.life) * p.vx * 10
        const py = p.row * tileSize + tileSize / 2 + (1 - p.life) * p.vy * 10

        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1.0
      })

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [gridItems, emitters, targets, traceLaserBeams])

  // ── Canvas Click Handler ─────────────────────────────────────────
  const handleCanvasClick = (evt) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = evt.clientX - rect.left
    const y = evt.clientY - rect.top

    const tileSize = rect.width / GRID_SIZE
    const col = Math.floor(x / tileSize)
    const row = Math.floor(y / tileSize)

    // Check mirror click
    const mirror = gridItems.find((i) => i.row === row && i.col === col && i.type === 'mirror')
    if (mirror && !mirror.fixed) {
      const nextAngle = (mirror.angle + 45) % 180
      rotateMirror(row, col)
      if (sendMirrorRotate) sendMirrorRotate(row, col, nextAngle)
      return
    }

    // Check emitter click (Host controls Red, Client controls Blue, Solo controls both)
    const emitter = emitters.find((e) => e.row === row && e.col === col)
    if (emitter) {
      if (
        playerRole === 'solo' ||
        (playerRole === 'host' && emitter.owner === 'host') ||
        (playerRole === 'client' && emitter.owner === 'client')
      ) {
        const dirs = ['E', 'S', 'W', 'N']
        const nextDir = dirs[(dirs.indexOf(emitter.dir) + 1) % 4]
        setEmitterDir(emitter.id, nextDir)
        if (sendEmitterDir) sendEmitterDir(emitter.id, nextDir)
      }
    }
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full p-2">
      <canvas
        ref={canvasRef}
        width={560}
        height={560}
        onClick={handleCanvasClick}
        className="rounded-2xl cursor-pointer shadow-2xl transition-all"
        style={{
          width: 'min(88vw, 560px)',
          height: 'min(88vw, 560px)',
          border: '2px solid rgba(0,245,255,0.3)',
          boxShadow: '0 0 40px rgba(0,245,255,0.15)',
        }}
      />
    </div>
  )
}
