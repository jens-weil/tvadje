import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Beer, Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="card-elite w-full max-w-[500px] relative group">
        <div className="text-center mb-12 relative z-10">
          <h1 className="font-display text-7xl mb-2 text-gold-gradient leading-none">Tvådje</h1>

          <p className="font-serif text-sm text-white/50 italic tracking-widest mt-2">Den flytande samlingspunkten.</p>
        </div>

        {message && (
          <div className="p-4 rounded-md mb-8 text-sm border font-body" style={{
            backgroundColor: message.includes('Check') || message.includes('skickats') ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 77, 77, 0.1)',
            borderColor: message.includes('Check') || message.includes('skickats') ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 77, 77, 0.2)',
            color: message.includes('Check') || message.includes('skickats') ? 'var(--color-success, #00e676)' : 'var(--color-error, #ff4d4d)'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6 relative z-10">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--liquid-gold)' }}>Fullständigt Namn</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  placeholder="Björn Borg"
                  className="elite-input pl-12"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <br />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--liquid-gold)' }}> E-postadress</label>
            <div className="relative">
              <input
                type="email"
                placeholder="namn@exempel.se"
                className="elite-input pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <br />
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--liquid-gold)' }}> Lösenord </label>
              {!isSignUp && (
                <a href="/reset-password" onClick={(e) => { e.preventDefault(); window.location.href = '/reset-password' }} className="btn-elite-link !text-[10px] !py-1 !px-2">
                  Glömt lösen?
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                className="elite-input pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <br></br>
            <button
              type="submit"
              disabled={loading}
              className="btn-elite-primary w-full"
            >
              {loading ? 'Laddar...' : isSignUp ? 'Bli Medlem' : 'Logga In'}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center pt-8 border-t relative z-10" style={{ borderColor: 'var(--elite-border)' }}>
          <p className="font-body text-sm text-white/50">
            {isSignUp ? 'Redan med i gänget? ' : 'Ny på Tvådje? '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="btn-elite-link ml-3 !lowercase first-letter:uppercase"
            >
              {isSignUp ? 'Logga In' : 'Gå med nu'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
