import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useUserStore from '../store/userStore'

const GAMES = [
  {
    id: 'tilt-tower',
    title: 'TILT TOWER',
    desc: '2-PLAYER CO-OP BALANCING',
    color: '#00f5ff',
    active: true,
    path: '/play/tilt-tower'
  },
  {
    id: 'neon-pong',
    title: 'NEON PONG (SOON)',
    desc: 'CLASSIC DUEL',
    color: '#ff00ff',
    active: false,
    path: '#'
  }
]

export default function Hub() {
  const { user, profile, loading, signOut, initAuth } = useUserStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <div className="relative flex flex-col items-center w-full h-full bg-dark-900 overflow-hidden p-6 text-white">
      {/* Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header / User Profile */}
      <div className="relative z-10 w-full max-w-4xl flex justify-between items-center py-6 border-b border-white/10 mb-12">
        <div className="text-2xl font-black tracking-widest glow-cyan" style={{ fontFamily: 'Orbitron, monospace' }}>
          DUO GAMES HUB
        </div>
        
        <div className="flex items-center gap-6">
          {!loading && user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-bold text-cyan-400 tracking-wider">{profile?.username || user.email}</div>
                <div className="text-xs text-white/50 tracking-widest">
                  STREAK: <span className="text-orange-400">🔥 {profile?.current_streak || 0}</span>
                </div>
              </div>
              <button 
                onClick={signOut}
                className="px-4 py-2 border border-red-500/50 text-red-400 text-xs tracking-widest rounded hover:bg-red-500/10 transition"
              >
                LOGOUT
              </button>
            </div>
          ) : !loading && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/40 tracking-widest">PLAYING AS GUEST</span>
              <Link to="/auth" className="btn-neon text-xs px-4 py-2" style={{ color: '#00f5ff', borderColor: '#00f5ff' }}>
                LOGIN / SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Games Grid */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES.map(game => (
          <div 
            key={game.id} 
            className={`flex flex-col p-6 rounded-xl border ${game.active ? 'hover:scale-105 transition-transform cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            style={{
              borderColor: `rgba(${game.color === '#00f5ff' ? '0,245,255' : '255,0,255'}, 0.3)`,
              background: `rgba(${game.color === '#00f5ff' ? '0,245,255' : '255,0,255'}, 0.05)`,
            }}
          >
            <h3 className="text-2xl font-black mb-2 tracking-wider" style={{ fontFamily: 'Orbitron, monospace', color: game.color }}>
              {game.title}
            </h3>
            <p className="text-sm text-white/50 tracking-widest mb-6">{game.desc}</p>
            
            {game.active ? (
              <Link 
                to={game.path}
                className="mt-auto text-center py-3 rounded font-bold tracking-widest"
                style={{
                  background: `rgba(${game.color === '#00f5ff' ? '0,245,255' : '255,0,255'}, 0.1)`,
                  color: game.color,
                  border: `1px solid ${game.color}`
                }}
              >
                PLAY NOW
              </Link>
            ) : (
              <div className="mt-auto text-center py-3 rounded font-bold tracking-widest border border-white/20 text-white/30">
                COMING SOON
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
