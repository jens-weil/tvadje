import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Key, ArrowLeft, Send } from 'lucide-react'

export default function PasswordReset() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      setMessage('Länk för återställning har skickats till din e-post!')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="card-elite w-full max-w-[500px] relative overflow-hidden group">
        <button
          onClick={() => window.location.href = '/auth'}
          className="btn-elite-link mb-10 gap-2"
        >
          <ArrowLeft size={14} /> Tillbaka till Logga in
        </button>

        <div className="text-center mb-10">

          <h1 className="font-display text-5xl mb-3 text-gold-gradient leading-none">Glömt Koden?</h1>
          <p className="font-serif text-sm text-white/50 italic tracking-widest mt-2">Vi skickar en återställningslänk direkt.</p>
        </div>

        {message && (
          <div className="p-4 rounded-md mb-8 text-sm border font-body" style={{
            backgroundColor: message.includes('skickats') ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 77, 77, 0.1)',
            borderColor: message.includes('skickats') ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 77, 77, 0.2)',
            color: message.includes('skickats') ? 'var(--color-success, #00e676)' : 'var(--color-error, #ff4d4d)'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <br />
            <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--liquid-gold)' }}>Din E-postadress</label>
            <input
              type="email"
              placeholder="namn@exempel.se"
              className="elite-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="pt-4">
            <br />
            <button
              type="submit"
              disabled={loading}
              className="btn-elite-primary w-full"
            >
              {loading ? 'Skickar...' : 'Skicka Länk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
