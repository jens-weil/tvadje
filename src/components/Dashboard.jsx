import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Beer, User, MapPin, Calendar, LogOut, CheckCircle } from 'lucide-react'

export default function Dashboard({ session }) {
  const [profile, setProfile] = useState(null)
  const [participants, setParticipants] = useState([])
  const [isParticipating, setIsParticipating] = useState(false)
  const [loading, setLoading] = useState(true)

  function getNextFridayDate() {
    const today = new Date()
    const day = today.getDay()
    // If today IS Friday (5) and it's before midnight, use today; otherwise next Friday
    const daysUntilFriday = day === 5 ? 0 : (5 - day + 7) % 7 || 7
    const nextFriday = new Date(today)
    nextFriday.setDate(today.getDate() + daysUntilFriday)
    return nextFriday.toISOString().split('T')[0]
  }

  const eventDate = getNextFridayDate()

  useEffect(() => {
    getProfile()
    getParticipants()

    const subscription = supabase
      .channel('public:event_participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, () => {
        getParticipants()
      })
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [])

  async function getProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      setProfile(data || { full_name: session.user.user_metadata?.full_name || 'Medlem' })
    } catch (error) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function getParticipants() {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('profile_id, profiles(full_name)')
        .eq('event_date', eventDate)
      if (error) throw error

      const formatted = data.map(p => ({
        id: p.profile_id,
        name: p.profiles?.full_name || 'Okänd Medlem',
      }))
      setParticipants(formatted)
      setIsParticipating(formatted.some(p => p.id === session.user.id))
    } catch (error) {
      console.error('Error loading participants:', error.message)
    }
  }

  const toggleParticipation = async () => {
    const isJoining = !isParticipating
    setIsParticipating(isJoining)
    try {
      if (isJoining) {
        const { error } = await supabase.from('event_participants').insert({
          profile_id: session.user.id,
          event_date: eventDate,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('event_participants').delete()
          .eq('profile_id', session.user.id)
          .eq('event_date', eventDate)
        if (error) throw error
      }
      getParticipants()
    } catch (error) {
      console.error('Error toggling:', error.message)
      setIsParticipating(!isJoining)
    }
  }

  const getNextFridayStr = () => {
    const d = new Date(eventDate)
    return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
  }

  const displayName = profile?.full_name || 'Medlem'

  return (
    <div className="container animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '4rem 0' }}>

      {/* ── Header ── */}
      <header className="responsive-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'var(--liquid-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(212,154,33,0.4)',
          }}>
            <Beer size={26} color="#040c0f" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.08em', lineHeight: 1, color: 'white', margin: 0 }}>Tvådje</h1>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--liquid-gold)', fontWeight: 800, opacity: 0.8, marginTop: 2 }}>Guld i mun</p>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              color: 'rgba(255,255,255,0.5)',
              padding: '0.5rem 1rem',
              borderRadius: 10,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--liquid-gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            <User size={16} /> {loading ? '...' : displayName}
          </a>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.6rem 1.2rem',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--elite-border)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,77,0.1)'; e.currentTarget.style.color = '#ff4d4d'; e.currentTarget.style.borderColor = 'rgba(255,77,77,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'var(--elite-border)' }}
          >
            <LogOut size={14} /> Logga ut
          </button>
        </nav>
      </header>

      {/* ── Main Layout ── */}
      <main className="dashboard-layout">

          {/* ── Hero Event Card ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section
              className="texture-beer-elite hero-section"
              style={{
                borderRadius: 'var(--radius-xl)',
                minHeight: 460,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: 'var(--hero-padding, 3rem)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Dark overlay for readability */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                zIndex: 1,
              }} />

              <div style={{ position: 'relative', zIndex: 2, maxWidth: 560 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.4rem 1.2rem',
                  background: 'var(--liquid-gold)',
                  color: 'var(--midnight-pine-dark)',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  borderRadius: 100,
                  marginBottom: '1.5rem',
                  boxShadow: '0 0 20px rgba(212,154,33,0.4)',
                  fontFamily: 'var(--font-body)',
                }}>
                  Nästa AW
                </span>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(3rem, 7vw, 5rem)',
                  lineHeight: 0.95,
                  color: 'white',
                  letterSpacing: '0.02em',
                  marginBottom: '1.5rem',
                }}>Vi ses<br /><span style={{ color: 'var(--liquid-gold)' }}>Där</span>
                </h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  {[
                    { icon: <Calendar size={16} />, label: getNextFridayStr() },
                    { icon: <MapPin size={16} />, label: 'På stan' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '0.5rem 1.2rem',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 100,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.85)',
                    }}>
                      <span style={{ color: 'var(--liquid-gold)' }}>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                <button
                  onClick={toggleParticipation}
                  className={isParticipating ? '' : 'btn-elite-primary'}
                  style={isParticipating ? {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '1rem 2.5rem',
                    borderRadius: 4,
                    background: 'rgba(0,230,118,0.15)',
                    border: '1px solid rgba(0,230,118,0.3)',
                    color: '#00e676',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0,230,118,0.15)',
                  } : {}}
                >
                  {isParticipating
                    ? <><CheckCircle size={22} /> Anmäld &amp; Klar</>
                    : <><Beer size={22} /> Anmäl deltagande</>}
                </button>
              </div>
            </section>

            {/* ── Editorial Quote Card ── */}
            <section className="card-elite" style={{ padding: '2.5rem 3rem' }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                lineHeight: 1.5,
                fontStyle: 'italic',
                marginBottom: '1.5rem',
                color: 'rgba(255,255,255,0.85)',
              }}>
                "Gemenskap, vänner och det flytande guldet från norr.{' '}
                <span style={{ color: 'var(--liquid-gold)' }}>Fredagarna med Tvådje är heliga.</span>"
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.8 }}>
                <p>Vi samlas för att fira veckans segrar och blicka framåt. Inget krångel, bara god stämning och de kallaste enheterna i stan.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 40, height: 2, background: 'rgba(212,154,33,0.4)' }} />
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 900, color: 'rgba(255,255,255,0.2)' }}>Håll traditionen vid liv</p>
                </div>
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Participants Card ── */}
            <section className="card-elite" style={{ padding: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--elite-border)',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Vilka kommer?</h3>
                <span style={{
                  padding: '0.2rem 0.75rem',
                  background: 'rgba(212,154,33,0.1)',
                  borderRadius: 100,
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  color: 'var(--liquid-gold)',
                  border: '1px solid rgba(212,154,33,0.2)',
                }}>
                  {participants.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {participants.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2.5rem 1rem',
                    color: 'rgba(255,255,255,0.25)',
                    fontStyle: 'italic',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.95rem',
                  }}>
                    Ingen anmäld än...
                  </div>
                ) : (
                  participants.map((p, i) => {
                    const isMe = p.id === session.user.id
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isMe ? 'rgba(0,230,118,0.12)' : 'rgba(255,255,255,0.05)',
                          border: isMe ? '1px solid rgba(0,230,118,0.25)' : '1px solid rgba(255,255,255,0.05)',
                          color: isMe ? '#00e676' : 'rgba(255,255,255,0.5)',
                        }}>
                          <User size={18} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: isMe ? 'white' : 'rgba(255,255,255,0.75)', margin: 0 }}>
                            {isMe ? `Du (${p.name})` : p.name}
                          </p>
                          <p style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: isMe ? '#00e676' : 'rgba(255,255,255,0.25)', margin: 0 }}>
                            Bekräftad
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* ── Motto Card ── */}
            <section style={{
              padding: '2.5rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'rgba(212,154,33,0.05)',
              border: '1px solid rgba(212,154,33,0.15)',
              textAlign: 'center',
            }}>
              <Beer
                size={44}
                style={{
                  color: 'var(--liquid-gold)',
                  filter: 'drop-shadow(0 0 12px rgba(212,154,33,0.5))',
                  marginBottom: '1rem',
                  display: 'block',
                  margin: '0 auto 1rem',
                }}
              />
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--liquid-gold)',
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                lineHeight: 1.6,
              }}>
                "Tvådje — aldrig mer än så"
              </p>
            </section>
          </div>
      </main>
    </div>
  )
}
