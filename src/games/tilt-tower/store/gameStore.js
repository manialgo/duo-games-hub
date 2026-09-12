/**
 * gameStore.js — Global state with Zustand
 *
 * Stores:
 *  - gamePhase: 'lobby' | 'connecting' | 'playing' | 'gameover'
 *  - playerRole: 'host' | 'client' | null
 *  - roomCode: string | null
 *  - survivalTime / blockCount — current run stats
 *  - bestSurvivalTime / bestBlockCount — all-time best (persists between rounds)
 *  - tiltX / tiltZ — axis tilt values
 *  - blocks: Block[] — shared, host-authoritative, synced to client
 *  - peerSend: fn | null — raw P2P send fn registered by usePeer
 *  - isPremium: boolean
 */
import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  // ── Phase ──────────────────────────────────────────
  gamePhase: 'lobby',
  setGamePhase: (phase) => set({ gamePhase: phase }),

  // ── Player / room ──────────────────────────────────
  playerRole: null,
  setPlayerRole: (role) => set({ playerRole: role }),

  roomCode: null,
  setRoomCode: (code) => set({ roomCode: code }),

  connectionStatus: 'idle',
  setConnectionStatus: (s) => set({ connectionStatus: s }),

  connectionError: null,
  setConnectionError: (err) => set({ connectionError: err }),

  // ── Current-run stats ──────────────────────────────
  survivalTime: 0,
  setSurvivalTime: (t) => set({ survivalTime: t }),
  incrementTime: () => set((s) => ({ survivalTime: s.survivalTime + 1 })),

  blockCount: 0,
  incrementBlockCount: () => set((s) => ({ blockCount: s.blockCount + 1 })),

  // ── All-time best (never reset between rounds) ─────
  bestSurvivalTime: 0,
  bestBlockCount: 0,

  // ── Tilt axes ──────────────────────────────────────
  tiltX: 0,
  tiltZ: 0,
  setTiltX: (v) => set({ tiltX: Math.max(-1, Math.min(1, v)) }),
  setTiltZ: (v) => set({ tiltZ: Math.max(-1, Math.min(1, v)) }),

  // ── Shared blocks (host-authoritative) ─────────────
  blocks: [],
  addBlock: (block) => set((s) => ({ blocks: [...s.blocks, block] })),
  clearBlocks: () => set({ blocks: [] }),

  // ── Peer send fn ───────────────────────────────────
  peerSend: null,
  setPeerSend: (fn) => set({ peerSend: fn }),

  // ── Monetization ───────────────────────────────────
  isPremium: false,
  setIsPremium: (v) => set({ isPremium: v }),

  revivesLeft: 1,
  useRevive: () => set((s) => ({
    revivesLeft: Math.max(0, s.revivesLeft - 1),
    gamePhase: s.revivesLeft > 0 ? 'playing' : s.gamePhase,
    blocks: [],
  })),

  // ── Actions ────────────────────────────────────────
  startGame: () => set({
    gamePhase: 'playing',
    survivalTime: 0,
    blockCount: 0,
    tiltX: 0,
    tiltZ: 0,
    blocks: [],
  }),

  /**
   * Trigger game over and simultaneously update best scores.
   * bestBlockCount / bestSurvivalTime are never reset — they persist
   * across Play Again rounds for the session lifetime.
   */
  triggerGameOver: () => set((s) => ({
    gamePhase: 'gameover',
    bestSurvivalTime: Math.max(s.bestSurvivalTime, s.survivalTime),
    bestBlockCount:   Math.max(s.bestBlockCount,   s.blockCount),
  })),

  resetToLobby: () => set((s) => ({
    gamePhase: 'lobby',
    playerRole: null,
    roomCode: null,
    connectionStatus: 'idle',
    connectionError: null,
    survivalTime: 0,
    blockCount: 0,
    tiltX: 0,
    tiltZ: 0,
    revivesLeft: 1,
    blocks: [],
    peerSend: null,
    // bestSurvivalTime and bestBlockCount intentionally preserved
  })),
}))

export default useGameStore
