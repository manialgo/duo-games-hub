import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/') // Go back to hub
      } else {
        // Sign up logic. Pass username in metadata so the DB trigger can grab it.
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0]
            }
          }
        })
        if (error) throw error
        alert('Check your email for the confirmation link! (Or login if auto-confirm is enabled in Supabase)')
      }
    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-dark-900 overflow-hidden text-white">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="relative z-10 w-full max-w-md p-8 rounded-xl border border-cyan-500/30 bg-dark-800/80 backdrop-blur-md shadow-neon">
        <h2 className="text-3xl font-black text-center mb-6 glow-cyan" style={{ fontFamily: 'Orbitron, monospace' }}>
          {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
        </h2>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="px-4 py-3 bg-dark-700/50 border border-cyan-500/50 rounded text-cyan-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,245,255,0.5)]"
              style={{ fontFamily: 'Orbitron, monospace' }}
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 bg-dark-700/50 border border-cyan-500/50 rounded text-cyan-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,245,255,0.5)]"
            style={{ fontFamily: 'Orbitron, monospace' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 bg-dark-700/50 border border-cyan-500/50 rounded text-cyan-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,245,255,0.5)]"
            style={{ fontFamily: 'Orbitron, monospace' }}
          />

          {errorMsg && (
            <p className="text-red-400 text-sm text-center tracking-wider">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-neon mt-4 w-full"
            style={{
              color: '#00f5ff',
              borderColor: 'rgba(0,245,255,0.5)',
              background: 'rgba(0,245,255,0.1)',
            }}
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'ENTER' : 'REGISTER')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 tracking-wider"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-white/30 hover:text-white/60 text-xs tracking-widest transition-colors"
          >
            ← BACK TO HUB
          </button>
        </div>
      </div>
    </div>
  )
}
