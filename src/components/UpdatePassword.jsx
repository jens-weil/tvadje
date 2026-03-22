import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Lock, ArrowLeft, Save } from 'lucide-react'

export default function UpdatePassword() {
  console.log('Rendering UpdatePassword component')
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage({ text: 'Ditt lösenord har uppdaterats!', type: 'success' })
      setTimeout(() => window.location.href = '/', 2000)
    } catch (error) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="card-elite w-full max-w-[500px] relative overflow-hidden group">
        <button
          onClick={() => window.location.href = '/'}
          className="btn-elite-link mb-10 gap-2"
        >
          <ArrowLeft size={14} /> Tillbaka till Hem
        </button>

        <div className="text-center mb-10">
          <h1 className="font-display text-5xl mb-3 text-gold-gradient leading-none">Nytt Lösenord</h1>
          <p className="font-serif text-sm text-white/50 italic tracking-widest mt-2">Välj ett säkert lösenord för framtiden.</p>
        </div>

        {message.text && (
          <div className="p-4 rounded-md mb-8 text-sm border font-body" style={{
            backgroundColor: message.type === 'error' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 230, 118, 0.1)',
            borderColor: message.type === 'error' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(0, 230, 118, 0.2)',
            color: message.type === 'error' ? 'var(--color-error, #ff4d4d)' : 'var(--color-success, #00e676)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--liquid-gold)' }}>Nytt Lösenord</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="elite-input pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-elite-primary w-full"
            >
              {loading ? 'Sparar...' : 'Uppdatera Lösenord'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
