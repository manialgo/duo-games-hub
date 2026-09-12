/**
 * useLaserGridPeer.js — Fast & Robust PeerJS WebRTC hook for Laser Grid Co-Op
 */
import { useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'
import useLaserGridStore from '../store/laserGridStore'

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
  return `lgc-${code.toUpperCase()}-${role}`
}

export function useLaserGridPeer() {
  const peerRef = useRef(null)
  const connRef = useRef(null)
  const timeoutRef = useRef(null)

  const {
    setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError,
    setGamePhase, startGame, setMirrorAngle, setEmitterDir, nextLevel, setPeerSend
  } = useLaserGridStore.getState()

  const sendMessage = useCallback((msg) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(JSON.stringify(msg))
    }
  }, [])

  useEffect(() => {
    setPeerSend(sendMessage)
  }, [sendMessage, setPeerSend])

  // Cleanup on reset
  useEffect(() => {
    const unsub = useLaserGridStore.subscribe(
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

  // Final cleanup
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
        case 'rotate_mirror':
          setMirrorAngle(msg.row, msg.col, msg.angle)
          break
        case 'move_emitter':
          setEmitterDir(msg.id, msg.dir)
          break
        case 'start':
          startGame()
          break
        case 'next_level':
          nextLevel()
          break
        case 'level_clear':
          setGamePhase('levelclear')
          break
        default:
          break
      }
    } catch (e) {
      console.warn('[LaserGridPeer] Message parse error:', e)
    }
  }, [setMirrorAngle, setEmitterDir, startGame, nextLevel, setGamePhase])

  const attachConnection = useCallback((conn) => {
    connRef.current = conn
    conn.on('data', handleMessage)
    conn.on('close', () => {
      setConnectionStatus('idle')
      setConnectionError('Partner disconnected.')
    })
    conn.on('error', (err) => {
      setConnectionError(err.message)
      setConnectionStatus('error')
    })
  }, [handleMessage, setConnectionStatus, setConnectionError])

  const createRoom = useCallback((retryCount = 0) => {
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

    // 10-second timeout watchdog
    timeoutRef.current = setTimeout(() => {
      if (useLaserGridStore.getState().connectionStatus === 'waiting' && !connRef.current?.open) {
        setConnectionError('Room creation timed out. Click below to retry.')
        setConnectionStatus('error')
      }
    }, 10000)

    try {
      const peer = new Peer(id, PEER_CONFIG)
      peerRef.current = peer

      peer.on('open', () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        console.log('[LaserGridPeer] Host peer open:', id)
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
        if (err.type === 'unavailable-id' && retryCount < 3) {
          console.warn('[LaserGridPeer] Code collision, retrying...')
          return createRoom(retryCount + 1)
        }
        setConnectionError(err.message || 'Connection failed.')
        setConnectionStatus('error')
      })
    } catch (e) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setConnectionError('Failed to create room.')
      setConnectionStatus('error')
    }

    return code
  }, [setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError, attachConnection, startGame])

  const joinRoom = useCallback((code) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    connRef.current?.close()
    peerRef.current?.destroy()
    connRef.current = null
    peerRef.current = null

    const trimmed = code.trim().toUpperCase()
    if (trimmed.length < 4) {
      setConnectionError('Enter a 4-character room code.')
      return
    }

    const clientId = peerId(`${trimmed}-${Math.floor(Math.random()*1000)}`, 'client')
    const hostId = peerId(trimmed, 'host')

    setRoomCode(trimmed)
    setPlayerRole('client')
    setConnectionStatus('waiting')
    setConnectionError(null)

    timeoutRef.current = setTimeout(() => {
      if (useLaserGridStore.getState().connectionStatus === 'waiting' && !connRef.current?.open) {
        setConnectionError('Could not reach room. Make sure Host created the room first.')
        setConnectionStatus('error')
      }
    }, 10000)

    try {
      const peer = new Peer(clientId, PEER_CONFIG)
      peerRef.current = peer

      peer.on('open', () => {
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
          msg = 'Room not found. Check code.'
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
    sendMirrorRotate: (row, col, angle) => sendMessage({ type: 'rotate_mirror', row, col, angle }),
    sendEmitterDir: (id, dir) => sendMessage({ type: 'move_emitter', id, dir }),
    sendNextLevel: () => sendMessage({ type: 'next_level' }),
    sendLevelClear: () => sendMessage({ type: 'level_clear' }),
  }
}
