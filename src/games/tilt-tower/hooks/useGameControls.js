/**
 * useGameControls.js — Keyboard input hook
 *
 * Player 1 (Host):   A / D keys      → tilt X-axis (left / right)
 * Player 2 (Client): ↑ / ↓ arrow keys → tilt Z-axis (forward / back)
 *
 * Each key sets the tilt to ±TILT_SPEED. Released keys return axis to 0.
 * Syncs local tilt to the store AND sends it over PeerJS.
 */
import { useEffect, useRef } from 'react'
import useGameStore from '../store/gameStore'

const TILT_SPEED = 0.6   // max tilt magnitude per axis

export function useGameControls({ sendTiltAxis }) {
  const keysRef = useRef({})

  useEffect(() => {
    const { gamePhase } = useGameStore.getState()
    if (gamePhase !== 'playing') return

    const onKeyDown = (e) => { keysRef.current[e.code] = true }
    const onKeyUp   = (e) => { keysRef.current[e.code] = false }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    let raf
    let lastX = null
    let lastZ = null

    const tick = () => {
      const keys  = keysRef.current
      const state = useGameStore.getState()
      const { playerRole, gamePhase: phase, setTiltX, setTiltZ } = state

      if (phase !== 'playing') {
        raf = requestAnimationFrame(tick)
        return
      }

      if (playerRole === 'host') {
        // A → tilt left (−X),  D → tilt right (+X)
        let x = 0
        if (keys['KeyA']) x = -TILT_SPEED
        if (keys['KeyD']) x =  TILT_SPEED

        if (x !== lastX) {
          setTiltX(x)
          sendTiltAxis('X', x)
          lastX = x
        }
      } else if (playerRole === 'client') {
        // ↑ → tilt forward (−Z),  ↓ → tilt back (+Z)
        let z = 0
        if (keys['ArrowUp'])   z = -TILT_SPEED
        if (keys['ArrowDown']) z =  TILT_SPEED

        if (z !== lastZ) {
          setTiltZ(z)
          sendTiltAxis('Z', z)
          lastZ = z
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      cancelAnimationFrame(raf)
    }
  }, [sendTiltAxis])
}
