/**
 * TiltTowerGameWrapper.jsx — Game wrapper for the specific game route
 */
import React, { useEffect } from 'react'
import useGameStore from './store/gameStore'
import Lobby from './components/Lobby'
import Game from './components/Game'
import useUserStore from '../../store/userStore'

export default function TiltTowerGameWrapper() {
  const gamePhase = useGameStore((s) => s.gamePhase)
  const { initAuth } = useUserStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const showGame = gamePhase === 'playing' || gamePhase === 'gameover'

  return (
    <div className="w-full h-full" style={{ background: '#050510' }}>
      {!showGame ? <Lobby /> : <Game />}
    </div>
  )
}
