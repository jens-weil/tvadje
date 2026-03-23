import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, ArrowLeft, Save, Shield, Mail, Lock, Key, LogOut } from 'lucide-react'

export default function Profile({ session }) {
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select(`full_name`)
        .eq('id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      setFullName(data?.full_name || session.user.user_metadata.full_name || '')
      setEmail(session.user.email)
    } catch (error) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(e) {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setMessage({ text: 'Profilen har uppdaterats!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 5000)
    } catch (error) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault()
    if (!newPassword) return
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setMessage({ text: 'Lösenordet har ändrats!', type: 'success' })
      setNewPassword('')
      setTimeout(() => setMessage({ text: '', type: '' }), 5000)
    } catch (error) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPasswordRequest() {
    setLoading(true)
    setMessage({ text: '', type: '' })
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      setMessage({ text: 'Återställningslänk har skickats till din e-post!', type: 'success' })
    } catch (error) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '25vh', padding: '1rem 0' }}>
      <div className="max-w-2xl mx-auto">
        <header className="responsive-header">
          <button
            onClick={() => window.location.href = '/'}
            className="btn-elite-link gap-2 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Tillbaka</span>
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-elite-link !text-error/60 hover:!text-error !border-transparent hover:!border-error/20 hover:!bg-error/5 gap-2"
          >
            <LogOut size={14} /> Logga ut
          </button>
        </header>

        <main className="space-y-10">
          <section className="card-elite relative overflow-hidden group" style={{ padding: '3rem 3.5rem', marginBottom: '2rem' }}>
            {/* Profile Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700 opacity-20" style={{ background: 'var(--liquid-gold)' }}></div>

            <div className="flex items-center gap-8 mb-10 border-b pb-10" style={{ borderColor: 'var(--elite-border)' }}>

              <div>
                <h1 className="font-display text-5xl mb-1 text-gold-gradient">Min Profil</h1>
                <p className="font-serif italic text-white/50 text-sm tracking-widest mt-1">Medlem i Tvådje</p>
              </div>
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

            <form onSubmit={updateProfile} className="space-y-8 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--liquid-gold)' }}>Visningsnamn</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    className="elite-input pl-12"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">E-postadress (Kan ej ändras)</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    className="elite-input pl-12 opacity-50 cursor-not-allowed"
                    value={email}
                    disabled
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-elite-primary w-full"
              >
                {loading ? 'Sparar...' : 'Spara Profil'}
              </button>
            </form>
          </section>


          <section className="card-elite" style={{ padding: '3rem 3.5rem' }}>
            <h2 className="font-display text-3xl mb-8 flex items-center gap-3 text-white">
              <Shield size={28} style={{ color: 'var(--liquid-gold)' }} />
              Säkerhet & Lösenord
            </h2>

            <div className="dashboard-layout">
              <button
                onClick={handleResetPasswordRequest}
                disabled={loading}
                className="btn-elite-primary"
              >
                Maila Återställningslänk
              </button>
              <br></br>
              <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--elite-surface)', border: '1px solid var(--elite-border)' }}>
                <div className="font-serif italic text-sm text-white/60 mb-4 leading-relaxed">
                  "Vi rekommenderar ett starkt och unikt lösenord för din säkerhet i klubben."
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 rounded-full" style={{ background: 'linear-gradient(90deg, var(--liquid-gold-dark), var(--liquid-gold-light))' }}></div>
                </div>
              </div>
            </div>
            {/*
            <div className="mt-12 pt-10" style={{ borderTop: '1px solid var(--elite-border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 ml-1" style={{ color: 'var(--liquid-gold)' }}>Ändra Lösenord Direkt</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-6 relative z-10">
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    placeholder="Nytt lösenord"
                    className="elite-input pl-12"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-elite-primary w-full"
                >
                  Uppdatera Lösenord
                </button>
              </form>
            </div>
*/}
          </section>
        </main>
      </div>
    </div>
  )
}
