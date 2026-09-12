/**
 * useLaserGridPeer.js — PeerJS WebRTC hook for Laser Grid Co-Op
 */
import { useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'
import useLaserGridStore from '../store/laserGridStore'

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
          connRef.current?.close()
          peerRef.current?.destroy()
          connRef.current = null
          peerRef.current = null
        }
      }
    )
    return unsub
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

  const createRoom = useCallback(() => {
    const code = generateRoomCode()
    const id = peerId(code, 'host')

    setRoomCode(code)
    setPlayerRole('host')
    setConnectionStatus('waiting')
    setConnectionError(null)

    const peer = new Peer(id, { debug: 0 })
    peerRef.current = peer

    peer.on('connection', (conn) => {
      attachConnection(conn)
      conn.on('open', () => {
        setConnectionStatus('connected')
        conn.send(JSON.stringify({ type: 'start' }))
        startGame()
      })
    })

    peer.on('error', (err) => {
      setConnectionError(err.message || 'Connection failed.')
      setConnectionStatus('error')
    })

    return code
  }, [setRoomCode, setPlayerRole, setConnectionStatus, setConnectionError, attachConnection, startGame])

  const joinRoom = useCallback((code) => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length < 4) {
      setConnectionError('Enter a 4-character room code.')
      return
    }

    const clientId = peerId(trimmed, 'client')
    const hostId = peerId(trimmed, 'host')

    setRoomCode(trimmed)
    setPlayerRole('client')
    setConnectionStatus('waiting')
    setConnectionError(null)

    const peer = new Peer(clientId, { debug: 0 })
    peerRef.current = peer

    peer.on('open', () => {
      const conn = peer.connect(hostId, { reliable: true })
      attachConnection(conn)
      conn.on('open', () => {
        setConnectionStatus('connected')
      })
    })

    peer.on('error', (err) => {
      let msg = err.message || 'Connection failed.'
      if (err.type === 'peer-unavailable') {
        msg = 'Room not found. Check code.'
      }
      setConnectionError(msg)
      setConnectionStatus('error')
    })
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
