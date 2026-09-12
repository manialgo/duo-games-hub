/**
 * laserGridStore.js — Zustand store for Laser Grid Co-Op
 */
import { create } from 'zustand'

/** Pre-designed optical puzzle levels (8x8 grid: rows 0-7, cols 0-7) */
export const LEVELS = [
  {
    id: 1,
    title: 'LEVEL 1: FIRST REFLECTION',
    desc: 'Player 1 controls the Red Emitter. Player 2 rotates the Mirror to hit the Energy Core!',
    gridSize: 8,
    emitters: [
      { id: 'e1', row: 1, col: 0, dir: 'E', color: '#ff0055', owner: 'host' },
    ],
    targets: [
      { id: 't1', row: 6, col: 4, requiredColor: '#ff0055' },
    ],
    initialItems: [
      { row: 1, col: 4, type: 'mirror', angle: 45, fixed: false },
      { row: 3, col: 2, type: 'wall' },
      { row: 3, col: 3, type: 'wall' },
    ]
  },
  {
    id: 2,
    title: 'LEVEL 2: ZIG-ZAG CIRCUIT',
    desc: 'Route the beam around static barriers using dual adjustable mirrors.',
    gridSize: 8,
    emitters: [
      { id: 'e1', row: 0, col: 2, dir: 'S', color: '#ff0055', owner: 'host' },
    ],
    targets: [
      { id: 't1', row: 7, col: 6, requiredColor: '#ff0055' },
    ],
    initialItems: [
      { row: 3, col: 2, type: 'mirror', angle: 45, fixed: false },
      { row: 3, col: 6, type: 'mirror', angle: 90, fixed: false },
      { row: 2, col: 4, type: 'wall' },
      { row: 4, col: 4, type: 'wall' },
    ]
  },
  {
    id: 3,
    title: 'LEVEL 3: DUAL FREQUENCY',
    desc: 'Both Red (Host) and Blue (Client) lasers must power their matching targets!',
    gridSize: 8,
    emitters: [
      { id: 'e1', row: 1, col: 0, dir: 'E', color: '#ff0055', owner: 'host' },
      { id: 'e2', row: 6, col: 7, dir: 'W', color: '#00f5ff', owner: 'client' },
    ],
    targets: [
      { id: 't1', row: 7, col: 2, requiredColor: '#ff0055' },
      { id: 't2', row: 0, col: 5, requiredColor: '#00f5ff' },
    ],
    initialItems: [
      { row: 1, col: 2, type: 'mirror', angle: 45, fixed: false },
      { row: 6, col: 5, type: 'mirror', angle: 135, fixed: false },
      { row: 4, col: 3, type: 'wall' },
    ]
  },
  {
    id: 4,
    title: 'LEVEL 4: BEAM SPLITTER',
    desc: 'A special optical prism splits 1 incoming beam into 2 perpendicular laser paths!',
    gridSize: 8,
    emitters: [
      { id: 'e1', row: 2, col: 0, dir: 'E', color: '#ff0055', owner: 'host' },
    ],
    targets: [
      { id: 't1', row: 0, col: 4, requiredColor: '#ff0055' },
      { id: 't2', row: 7, col: 4, requiredColor: '#ff0055' },
    ],
    initialItems: [
      { row: 2, col: 4, type: 'splitter', angle: 45, fixed: true },
      { row: 5, col: 4, type: 'mirror', angle: 45, fixed: false },
      { row: 1, col: 4, type: 'mirror', angle: 135, fixed: false },
    ]
  },
  {
    id: 5,
    title: 'LEVEL 5: SYNTHESIS CORE',
    desc: 'Combine Red and Blue lasers into a Purple Master Beam to activate the Core Target!',
    gridSize: 8,
    emitters: [
      { id: 'e1', row: 0, col: 2, dir: 'S', color: '#ff0055', owner: 'host' },
      { id: 'e2', row: 4, col: 0, dir: 'E', color: '#00f5ff', owner: 'client' },
    ],
    targets: [
      { id: 't1', row: 7, col: 7, requiredColor: '#aa00ff' }, // Purple target requires combined beam!
    ],
    initialItems: [
      { row: 4, col: 2, type: 'prism', angle: 0, fixed: true }, // Prism merges beams
      { row: 4, col: 7, type: 'mirror', angle: 45, fixed: false },
    ]
  }
]

const useLaserGridStore = create((set, get) => ({
  // Phase & Room
  gamePhase: 'lobby',
  setGamePhase: (phase) => set({ gamePhase: phase }),

  playerRole: null,
  setPlayerRole: (role) => set({ playerRole: role }),

  roomCode: null,
  setRoomCode: (code) => set({ roomCode: code }),

  connectionStatus: 'idle',
  setConnectionStatus: (s) => set({ connectionStatus: s }),

  connectionError: null,
  setConnectionError: (err) => set({ connectionError: err }),

  // Level & Game State
  currentLevelIndex: 0,
  levelTimer: 0,
  bestLevel: 1,
  
  // Dynamic Grid Items (mirrors, walls, splitters, etc.)
  gridItems: [],
  emitters: [],
  targets: [],

  // Computed state
  targetsCharged: false,

  // Peer send fn
  peerSend: null,
  setPeerSend: (fn) => set({ peerSend: fn }),

  // Actions
  loadLevel: (idx) => {
    const level = LEVELS[idx] || LEVELS[0]
    set({
      currentLevelIndex: idx,
      levelTimer: 0,
      gridItems: JSON.parse(JSON.stringify(level.initialItems)),
      emitters: JSON.parse(JSON.stringify(level.emitters)),
      targets: JSON.parse(JSON.stringify(level.targets)),
      targetsCharged: false,
    })
  },

  rotateMirror: (row, col) => {
    set((state) => {
      const updated = state.gridItems.map((item) => {
        if (item.row === row && item.col === col && item.type === 'mirror' && !item.fixed) {
          const nextAngle = (item.angle + 45) % 180
          return { ...item, angle: nextAngle }
        }
        return item
      })
      return { gridItems: updated }
    })
  },

  setMirrorAngle: (row, col, angle) => {
    set((state) => {
      const updated = state.gridItems.map((item) => {
        if (item.row === row && item.col === col) {
          return { ...item, angle }
        }
        return item
      })
      return { gridItems: updated }
    })
  },

  setEmitterDir: (id, dir) => {
    set((state) => {
      const updated = state.emitters.map((e) => e.id === id ? { ...e, dir } : e)
      return { emitters: updated }
    })
  },

  setTargetsCharged: (charged) => set({ targetsCharged: charged }),

  incrementTimer: () => set((s) => ({ levelTimer: s.levelTimer + 1 })),

  nextLevel: () => {
    const nextIdx = get().currentLevelIndex + 1
    if (nextIdx < LEVELS.length) {
      get().loadLevel(nextIdx)
      set((s) => ({
        gamePhase: 'playing',
        bestLevel: Math.max(s.bestLevel, nextIdx + 1)
      }))
    } else {
      // Loop back or victory mode
      get().loadLevel(0)
      set({ gamePhase: 'playing' })
    }
  },

  startGame: () => {
    get().loadLevel(0)
    set({ gamePhase: 'playing' })
  },

  resetToLobby: () => {
    set({
      gamePhase: 'lobby',
      playerRole: null,
      roomCode: null,
      connectionStatus: 'idle',
      connectionError: null,
      levelTimer: 0,
      gridItems: [],
      emitters: [],
      targets: [],
      targetsCharged: false,
      peerSend: null,
    })
  }
}))

export default useLaserGridStore
