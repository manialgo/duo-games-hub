/**
 * usePeer.js — Fast & Robust PeerJS WebRTC hook (Singleton-safe)
 *
 * Features:
 *  - Google STUN ICE servers configured for fast NAT traversal
 *  - Automatic cleanup of stale peer instances
 *  - Automatic retry & fallback code generation on ID collision
 *  - 10-second connection timeout watchdog to prevent hanging
 */
import { useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'
import useGameStore from '../store/gameStore'

const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
  },
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function peerId(code, role) {
  return `ttc-${code.toUpperCase()}-${role}`
}

export function usePeer() {
  const peerRef = useRef(null)
  const connRef = useRef(null)
  const timeoutRef = useRef(null)

  const {
    setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError,
    setGamePhase, setTiltX, setTiltZ, triggerGameOver, startGame,
    addBlock, incrementBlockCount, setPeerSend,
  } = useGameStore.getState()

  const sendMessage = useCallback((msg) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(JSON.stringify(msg))
    }
  }, [])

  useEffect(() => {
    setPeerSend(sendMessage)
  }, [sendMessage, setPeerSend])

  // Destroy peer when game resets to lobby
  useEffect(() => {
    const unsub = useGameStore.subscribe(
      (s) => s.gamePhase,
      (phase) => {
        if (phase === 'lobby') {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          connRef.current?.close()
          peerRef.current?.destroy()
          connRef.current = null
          peerRef.current = null
        }
      }
    )
    return unsub
  }, [])

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      connRef.current?.close()
      peerRef.current?.destroy()
    }
  }, [])

  const handleMessage = useCallback((data) => {
    try {
      const msg = typeof data === 'string' ? JSON.parse(data) : data
      switch (msg.type) {
        case 'tilt':
          if (msg.axis === 'X') setTiltX(msg.value)
          if (msg.axis === 'Z') setTiltZ(msg.value)
          break
        case 'spawn':
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
  const createRoom = useCallback((retryCount = 0) => {
    // 1. Clean up existing peer & connection
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    connRef.current?.close()
    peerRef.current?.destroy()
    connRef.current = null
    peerRef.current = null

    const code = generateRoomCode()
    const id = peerId(code, 'host')

    setRoomCode(code)
    setPlayerRole('host')
    setConnectionStatus('waiting')
    setConnectionError(null)

    // 10-second connection watchdog
    timeoutRef.current = setTimeout(() => {
      if (useGameStore.getState().connectionStatus === 'waiting' && !connRef.current?.open) {
        setConnectionError('Room creation timed out. Click below to retry.')
        setConnectionStatus('error')
      }
    }, 10000)

    try {
      const peer = new Peer(id, PEER_CONFIG)
      peerRef.current = peer

      peer.on('open', () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        console.log('[PeerJS] Host peer open:', id)
      })

      peer.on('connection', (conn) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        attachConnection(conn)
        conn.on('open', () => {
          setConnectionStatus('connected')
          conn.send(JSON.stringify({ type: 'start' }))
          startGame()
        })
      })

      peer.on('error', (err) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        console.error('[PeerJS] Host peer error:', err)

        if (err.type === 'unavailable-id' && retryCount < 3) {
          console.warn('[PeerJS] ID collision, retrying with new code...')
          return createRoom(retryCount + 1)
        }

        setConnectionError(err.message || 'Connection failed. Try again.')
        setConnectionStatus('error')
      })
    } catch (e) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setConnectionError('Failed to initialize connection.')
      setConnectionStatus('error')
    }

    return code
  }, [setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError, attachConnection, startGame])

  // ── JOIN ROOM (Client) ────────────────────────────────────────────
  const joinRoom = useCallback((code) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    connRef.current?.close()
    peerRef.current?.destroy()
    connRef.current = null
    peerRef.current = null

    const trimmed = code.trim().toUpperCase()
    if (trimmed.length < 4) {
      setConnectionError('Room code must be 4 characters.')
      return
    }

    const clientId = peerId(`${trimmed}-${Math.floor(Math.random()*1000)}`, 'client')
    const hostId = peerId(trimmed, 'host')

    setRoomCode(trimmed)
    setPlayerRole('client')
    setConnectionStatus('waiting')
    setConnectionError(null)

    // 10-second join watchdog
    timeoutRef.current = setTimeout(() => {
      if (useGameStore.getState().connectionStatus === 'waiting' && !connRef.current?.open) {
        setConnectionError('Could not reach room. Verify host is active.')
        setConnectionStatus('error')
      }
    }, 10000)

    try {
      const peer = new Peer(clientId, PEER_CONFIG)
      peerRef.current = peer

      peer.on('open', () => {
        console.log('[PeerJS] Client peer open, connecting to host:', hostId)
        const conn = peer.connect(hostId, { reliable: true })
        attachConnection(conn)
        conn.on('open', () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          setConnectionStatus('connected')
        })
      })

      peer.on('error', (err) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        let msg = err.message || 'Connection failed.'
        if (err.type === 'peer-unavailable') {
          msg = 'Room not found. Make sure Host created the room first.'
        }
        setConnectionError(msg)
        setConnectionStatus('error')
      })
    } catch (e) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setConnectionError('Failed to join room.')
      setConnectionStatus('error')
    }
  }, [setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError, attachConnection])

  return {
    createRoom,
    joinRoom,
    sendTiltAxis: (axis, value) => sendMessage({ type: 'tilt', axis, value }),
    sendGameOver: () => sendMessage({ type: 'gameover' }),
    sendRevive: () => sendMessage({ type: 'revive' }),
  }
}
