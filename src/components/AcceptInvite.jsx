import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Lock, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'

export default function AcceptInvite() {
  const [loading, setLoading] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setEmail(session.user.email)
      } else {
        // If no session, they might have clicked a link that expired or is invalid
        setMessage('Hittade ingen aktiv inbjudan. Vänligen kontakta administratören.')
      }
    }
    checkSession()
  }, [])

  const handleCompleteRegistration = async (e) => {
    e.preventDefault()
    setCompleting(true)
    setMessage('')

    try {
      // 1. Update the password
      const { error: passwordError } = await supabase.auth.updateUser({ 
        password: password 
      })
      if (passwordError) throw passwordError

      // 2. Update the profile metadata
      const { error: profileError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })
      if (profileError) throw profileError

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setCompleting(false)
    }
  }

  if (success) {
    return (
      <div className="container animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="card-elite text-center p-12" style={{ maxWidth: 500 }}>
          <div className="flex justify-center mb-6">
            <CheckCircle2 size={64} className="text-success animate-bounce" style={{ color: '#00e676' }} />
          </div>
          <h1 className="font-display text-5xl mb-4 text-gold-gradient">Välkommen in!</h1>
          <p className="text-white/60 mb-8">Ditt konto är nu redo. Vi skickar dig vidare till din dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="card-elite w-full max-w-[500px] relative overflow-hidden group">
        <div className="text-center mb-10 relative z-10">
          <div className="inline-block p-3 rounded-full bg-gold/10 mb-4" style={{ backgroundColor: 'rgba(212, 154, 33, 0.1)' }}>
            <Sparkles className="text-gold" style={{ color: 'var(--liquid-gold)' }} size={32} />
          </div>
          <h1 className="font-display text-6xl mb-3 text-gold-gradient leading-none">Grattis!</h1>
          <p className="font-serif text-sm text-white/50 italic tracking-widest mt-2">Du är inbjuden till Tvådje Elite.</p>
        </div>

        {message && (
          <div className="p-4 rounded-md mb-8 text-sm border font-body" style={{
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            borderColor: 'rgba(255, 77, 77, 0.2)',
            color: '#ff4d4d'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleCompleteRegistration} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest ml-1 text-white/40">E-postadress</label>
            <input
              type="email"
              value={email}
              readOnly
              className="elite-input opacity-60 cursor-not-allowed"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--liquid-gold)' }}>Ditt Fullständiga Namn</label>
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

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--liquid-gold)' }}>Välj ett lösenord</label>
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

          <div className="pt-6">
            <button
              type="submit"
              disabled={completing || !email}
              className="btn-elite-primary w-full"
            >
              {completing ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Gå med i gänget <ArrowRight size={20} className="ml-2" /></>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-[10px] text-white/30 uppercase tracking-[0.2em]">
          Ett steg kvar till exklusivitet
        </div>
      </div>
    </div>
  )
}

function ArrowRight({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
