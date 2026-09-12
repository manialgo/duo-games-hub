/**
 * LaserGridWrapper.jsx — Main entry component for Laser Grid Co-Op
 */
import React, { useEffect } from 'react'
import useLaserGridStore from './store/laserGridStore'
import { useLaserGridPeer } from './hooks/useLaserGridPeer'
import LaserGridLobby from './components/LaserGridLobby'
import LaserGridCanvas from './components/LaserGridCanvas'
import LaserGridHUD from './components/LaserGridHUD'
import LaserGridVictoryModal from './components/LaserGridVictoryModal'
import useUserStore from '../../store/userStore'

export default function LaserGridWrapper() {
  const { gamePhase } = useLaserGridStore()
  const { initAuth } = useUserStore()
  const peer = useLaserGridPeer()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const showGame = gamePhase === 'playing' || gamePhase === 'levelclear'

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050515] flex items-center justify-center">
      {!showGame ? (
        <LaserGridLobby createRoom={peer.createRoom} joinRoom={peer.joinRoom} />
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <LaserGridHUD />
          <LaserGridCanvas
            sendMirrorRotate={peer.sendMirrorRotate}
            sendEmitterDir={peer.sendEmitterDir}
            sendLevelClear={peer.sendLevelClear}
          />
          {gamePhase === 'levelclear' && (
            <LaserGridVictoryModal sendNextLevel={peer.sendNextLevel} />
          )}
        </div>
      )}
    </div>
  )
}
