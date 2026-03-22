import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import PasswordReset from './components/PasswordReset'
import UpdatePassword from './components/UpdatePassword'
import { Loader2 } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)
      } catch (error) {
        console.error('Auth check failed:', error.message)
        if (error.message.includes('URL') || error.message.includes('fetch')) {
           setConfigError(true)
        }
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery detected, current path:', location.pathname)
        if (location.pathname !== '/update-password') {
          navigate('/update-password')
        }
      }
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [navigate, location.pathname])

  if (configError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center' }} className="animate-fade-in-up">
        <div className="card-elite" style={{ maxWidth: 460, width: '100%', padding: '3rem', border: '1px solid rgba(212,154,33,0.25)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--liquid-gold)' }}>Tvådje redo!</h2>
          <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
            Anslut ditt <strong style={{ color: 'white' }}>Supabase</strong>-projekt för att komma igång.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem 1.25rem', borderRadius: 8, textAlign: 'left', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '1.5rem', border: '1px solid var(--elite-border)', color: 'rgba(255,255,255,0.5)', lineHeight: 2 }}>
            1. Gå till supabase.com<br/>
            2. Hämta URL och Anon Key<br/>
            3. Uppdatera .env-filen
          </div>
          <button onClick={() => window.location.reload()} className="btn-elite-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            Försök igen
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader2 style={{ color: 'var(--liquid-gold)', animation: 'spin 1s linear infinite' }} size={48} />
      </div>
    )
  }

  return (
    <>
      <div className="elite-bg-wrapper">
        <div className="elite-bg-image"></div>
        <div className="elite-bg-overlay"></div>
        <div className="elite-texture-overlay"></div>
      </div>
      <div className="relative z-10">
      <Routes>
        <Route 
          path="/" 
          element={session ? <Dashboard session={session} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/auth" 
          element={!session ? <Auth /> : <Navigate to="/" />} 
        />
        <Route 
          path="/profile" 
          element={session ? <Profile session={session} /> : <Navigate to="/auth" />} 
        />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
      </div>
    </>
  )
}

export default App
