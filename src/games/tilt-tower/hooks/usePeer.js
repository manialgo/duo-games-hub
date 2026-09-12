/**
 * usePeer.js — PeerJS WebRTC hook (singleton-safe)
 *
 * IMPORTANT: Call this hook ONCE at the App level only.
 * The peerRef / connRef live as long as App lives (page lifetime),
 * so the connection survives the Lobby → Game screen transition.
 *
 * Provides:
 *  - createRoom()        → generates 4-digit code, opens PeerJS peer, waits
 *  - joinRoom(code)      → dials the host peer
 *  - sendTiltAxis(a, v)  → sends tilt data over the data channel
 *  - sendGameOver()      → notifies remote of game over
 *  - sendRevive()        → notifies remote to revive
 *
 * Message protocol (JSON):
 *   { type: 'tilt',     axis: 'X'|'Z', value: number }
 *   { type: 'spawn',    block: Block }   ← host→client block sync
 *   { type: 'start' }
 *   { type: 'gameover' }
 *   { type: 'revive' }
 *
 * peerSend is also registered in gameStore so deep components like
 * BlockSpawner can send messages without prop-drilling.
 */
import { useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'
import useGameStore from '../store/gameStore'

/** Generates a random 4-char uppercase alphanumeric room code. */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** Deterministic PeerJS peer ID: "ttc-<CODE>-host" or "ttc-<CODE>-client" */
function peerId(code, role) {
  return `ttc-${code.toUpperCase()}-${role}`
}

export function usePeer() {
  const peerRef = useRef(null)
  const connRef = useRef(null)

  // Pull stable store setters once (these functions never change)
  const {
    setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError,
    setGamePhase, setTiltX, setTiltZ, triggerGameOver, startGame,
    addBlock, incrementBlockCount, setPeerSend,
  } = useGameStore.getState()

  // ── Raw send (stable ref) ────────────────────────────────────────
  const sendMessage = useCallback((msg) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(JSON.stringify(msg))
    }
  }, [])

  // Register peerSend in Zustand so BlockSpawner et al. can reach it
  useEffect(() => {
    setPeerSend(sendMessage)
    // No cleanup: App never unmounts during gameplay.
    // peerSend is nulled in resetToLobby() inside the store action.
  }, [sendMessage, setPeerSend])

  // ── Destroy peer when game resets to lobby ───────────────────────
  useEffect(() => {
    const unsub = useGameStore.subscribe(
      (s) => s.gamePhase,
      (phase) => {
        if (phase === 'lobby') {
          connRef.current?.close()
          peerRef.current?.destroy()
          connRef.current = null
          peerRef.current = null
        }
      }
    )
    return unsub
  }, [])

  // ── Final cleanup when page closes ──────────────────────────────
  useEffect(() => {
    return () => {
      connRef.current?.close()
      peerRef.current?.destroy()
    }
  }, [])

  // ── Incoming message handler ─────────────────────────────────────
  const handleMessage = useCallback((data) => {
    try {
      const msg = typeof data === 'string' ? JSON.parse(data) : data
      switch (msg.type) {
        case 'tilt':
          // Remote player sent their axis update
          if (msg.axis === 'X') setTiltX(msg.value)
          if (msg.axis === 'Z') setTiltZ(msg.value)
          break
        case 'spawn':
          // Client receives a block spawned by the host
          addBlock(msg.block)
          incrementBlockCount()
          break
        case 'start':
          startGame()
          break
        case 'gameover':
          triggerGameOver()
          break
        case 'revive':
          setGamePhase('playing')
          break
        default:
          break
      }
    } catch (e) {
      console.warn('[PeerJS] Bad message:', data, e)
    }
  }, [setTiltX, setTiltZ, startGame, triggerGameOver, setGamePhase, addBlock, incrementBlockCount])

  // ── Wire up a DataChannel connection ─────────────────────────────
  const attachConnection = useCallback((conn) => {
    connRef.current = conn
    conn.on('data', handleMessage)
    conn.on('close', () => {
      setConnectionStatus('idle')
      setConnectionError('Peer disconnected.')
    })
    conn.on('error', (err) => {
      setConnectionError(err.message)
      setConnectionStatus('error')
    })
  }, [handleMessage, setConnectionStatus, setConnectionError])

  // ── CREATE ROOM (Host) ────────────────────────────────────────────
  const createRoom = useCallback(() => {
    const code = generateRoomCode()
    const id = peerId(code, 'host')

    setRoomCode(code)
    setPlayerRole('host')
    setConnectionStatus('waiting')
    setConnectionError(null)

    const peer = new Peer(id, { debug: 0 })
    peerRef.current = peer

    peer.on('open', () => {
      console.log('[PeerJS] Host peer open:', id)
    })

    peer.on('connection', (conn) => {
      console.log('[PeerJS] Client connected!')
      attachConnection(conn)
      conn.on('open', () => {
        setConnectionStatus('connected')
        // Tell client to start simultaneously
        conn.send(JSON.stringify({ type: 'start' }))
        startGame()
      })
    })

    peer.on('error', (err) => {
      console.error('[PeerJS] Peer error:', err)
      setConnectionError(err.message || 'Connection failed. Try again.')
      setConnectionStatus('error')
    })

    return code
  }, [setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError, attachConnection, startGame])

  // ── JOIN ROOM (Client) ────────────────────────────────────────────
  const joinRoom = useCallback((code) => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length < 4) {
      setConnectionError('Room code must be 4 characters.')
      return
    }

    const clientId = peerId(trimmed, 'client')
    const hostId   = peerId(trimmed, 'host')

    setRoomCode(trimmed)
    setPlayerRole('client')
    setConnectionStatus('waiting')
    setConnectionError(null)

    const peer = new Peer(clientId, { debug: 0 })
    peerRef.current = peer

    peer.on('open', () => {
      console.log('[PeerJS] Client peer open, connecting to host:', hostId)
      const conn = peer.connect(hostId, { reliable: true })
      attachConnection(conn)
      conn.on('open', () => {
        console.log('[PeerJS] Connected to host!')
        setConnectionStatus('connected')
      })
    })

    peer.on('error', (err) => {
      console.error('[PeerJS] Error:', err)
      let msg = err.message || 'Connection failed.'
      if (err.type === 'peer-unavailable') {
        msg = 'Room not found. Check the code and try again.'
      }
      setConnectionError(msg)
      setConnectionStatus('error')
    })
  }, [setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError, attachConnection])

  // ── SEND HELPERS ─────────────────────────────────────────────────
  const sendTiltAxis = useCallback((axis, value) => {
    sendMessage({ type: 'tilt', axis, value })
  }, [sendMessage])

  const sendGameOver = useCallback(() => {
    sendMessage({ type: 'gameover' })
  }, [sendMessage])

  const sendRevive = useCallback(() => {
    sendMessage({ type: 'revive' })
  }, [sendMessage])

  return {
    createRoom,
    joinRoom,
    sendTiltAxis,
    sendGameOver,
    sendRevive,
  }
}
