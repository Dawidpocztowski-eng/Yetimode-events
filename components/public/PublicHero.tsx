'use client'

import { useEffect, useState } from 'react'
import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface Props { event: Event; onRSVP: () => void; sections?: Record<string, boolean> }

function useCountdown(target: Date) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) return setT({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setT({ days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60) })
    }
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id)
  }, [target])
  return t
}

// Kompas SVG w stylu zaproszeń
function CompassSVG({ color = '#c9a84c', size = 200 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
      {/* Outer ring */}
      <circle cx="100" cy="100" r="90" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="0.5" strokeOpacity="0.3" />
      {/* Tick marks */}
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (i * 360) / 32
        const rad = (angle * Math.PI) / 180
        const isMajor = i % 4 === 0
        const r1 = 82, r2 = isMajor ? 74 : 78
        return (
          <line key={i}
            x1={100 + r1 * Math.sin(rad)} y1={100 - r1 * Math.cos(rad)}
            x2={100 + r2 * Math.sin(rad)} y2={100 - r2 * Math.cos(rad)}
            stroke={color} strokeWidth={isMajor ? 1.2 : 0.6} strokeOpacity={isMajor ? 0.6 : 0.3} />
        )
      })}
      {/* Cardinal letters */}
      <text x="100" y="20" textAnchor="middle" fill={color} fontSize="11" fontFamily="serif" fontWeight="600" opacity="0.8">N</text>
      <text x="100" y="190" textAnchor="middle" fill={color} fontSize="11" fontFamily="serif" fontWeight="600" opacity="0.5">S</text>
      <text x="16" y="104" textAnchor="middle" fill={color} fontSize="11" fontFamily="serif" fontWeight="600" opacity="0.5">W</text>
      <text x="186" y="104" textAnchor="middle" fill={color} fontSize="11" fontFamily="serif" fontWeight="600" opacity="0.5">E</text>
      {/* Star points — 8-pointed */}
      <polygon points="100,28 106,94 100,108 94,94" fill={color} opacity="0.9" />
      <polygon points="100,172 106,106 100,92 94,106" fill={color} opacity="0.4" />
      <polygon points="28,100 94,106 108,100 94,94" fill={color} opacity="0.4" />
      <polygon points="172,100 106,106 92,100 106,94" fill={color} opacity="0.9" />
      {/* Diagonal points */}
      <polygon points="149,51 106,96 100,108 96,96" fill={color} opacity="0.6" />
      <polygon points="51,149 94,104 100,92 104,104" fill={color} opacity="0.4" />
      <polygon points="51,51 96,96 108,100 96,104" fill={color} opacity="0.6" />
      <polygon points="149,149 104,104 92,100 104,96" fill={color} opacity="0.4" />
      {/* Center */}
      <circle cx="100" cy="100" r="10" fill={color} opacity="0.15" />
      <circle cx="100" cy="100" r="5" fill={color} opacity="0.6" />
      <circle cx="100" cy="100" r="2.5" fill="white" opacity="0.8" />
      {/* Plane at top */}
      <text x="100" y="10" textAnchor="middle" fontSize="10" opacity="0.7">✈</text>
      {/* Heart at bottom */}
      <text x="100" y="198" textAnchor="middle" fontSize="8" fill={color} opacity="0.6">♥</text>
    </svg>
  )
}

// Mapa świata — uproszczona konturowa
function WorldMapBg() {
  return (
    <svg viewBox="0 0 1200 600" className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="xMidYMid slice">
      <g fill="#c9a84c">
        {/* Europa */}
        <ellipse cx="580" cy="200" rx="80" ry="70" />
        {/* Azja */}
        <ellipse cx="820" cy="210" rx="160" ry="90" />
        {/* Afryka */}
        <ellipse cx="590" cy="360" rx="70" ry="100" />
        {/* Ameryka Północna */}
        <ellipse cx="230" cy="230" rx="120" ry="100" />
        {/* Ameryka Połudnowa */}
        <ellipse cx="300" cy="400" rx="70" ry="110" />
        {/* Australia */}
        <ellipse cx="950" cy="400" rx="80" ry="60" />
      </g>
    </svg>
  )
}

// Samolot ze śladem serca
function PlanePath({ color = '#c9a84c' }: { color?: string }) {
  return (
    <svg width="160" height="80" viewBox="0 0 160 80" className="opacity-50">
      <path d="M 20 60 Q 40 20 70 50 Q 90 70 80 40 L 145 15"
        stroke={color} strokeWidth="1" fill="none" strokeDasharray="4 3" />
      <text x="138" y="18" fontSize="16" fill={color} transform="rotate(-30, 145, 15)">✈</text>
    </svg>
  )
}

export default function PublicHero({ event, onRSVP, sections = {} }: Props) {
  const gold = '#c9a84c'
  const eventDate = new Date(event.date + (event.time ? `T${event.time}` : 'T12:00:00'))
  const t = useCountdown(eventDate)
  const isPast = eventDate < new Date()
  const isWedding = event.type === 'wedding'

  const formattedDate = format(new Date(event.date), "d MMMM yyyy", { locale: pl })

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-14"
      style={{ backgroundColor: '#faf8f3', fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>

      {/* Mapa świata w tle */}
      <WorldMapBg />

      {/* Dekoracyjna ramka w stylu paszportu */}
      <div className="absolute inset-6 md:inset-10 border pointer-events-none rounded-sm opacity-20"
        style={{ borderColor: gold }} />
      <div className="absolute inset-8 md:inset-12 border pointer-events-none rounded-sm opacity-10"
        style={{ borderColor: gold }} />

      {/* Nagłówek — WEDDING PASS */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${gold}60)` }} />
          <p className="text-xs tracking-[0.5em] uppercase font-sans font-medium" style={{ color: gold }}>
            Wedding Pass
          </p>
          <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${gold}60)` }} />
        </div>
        <p className="text-xs tracking-[0.2em] text-stone-400 font-sans uppercase">
          Typ biletu: 1 Klasa
        </p>
      </div>

      {/* Kompas */}
      <div className="relative z-10 mb-6">
        <CompassSVG color={gold} size={160} />
      </div>

      {/* Imiona */}
      <div className="relative z-10 mb-4">
        {isWedding && event.partner1_name && event.partner2_name ? (
          <>
            <h1 className="font-light leading-none tracking-[0.08em]"
              style={{ fontSize: 'clamp(2.2rem, 9vw, 5rem)', color: '#1a1008' }}>
              {event.partner1_name}
            </h1>
            <div className="flex items-center justify-center gap-4 my-3">
              <div className="h-px w-20 opacity-30" style={{ background: gold }} />
              <span className="text-lg font-light" style={{ color: gold }}>&</span>
              <div className="h-px w-20 opacity-30" style={{ background: gold }} />
            </div>
            <h1 className="font-light leading-none tracking-[0.08em]"
              style={{ fontSize: 'clamp(2.2rem, 9vw, 5rem)', color: '#1a1008' }}>
              {event.partner2_name}
            </h1>
          </>
        ) : (
          <h1 className="font-light tracking-[0.06em]"
            style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', color: '#1a1008' }}>
            {event.title}
          </h1>
        )}
      </div>

      {/* Data */}
      <div className="relative z-10 mb-6 space-y-1">
        <p className="text-stone-400 text-xs tracking-[0.4em] uppercase font-sans">
          {format(new Date(event.date), 'EEEE', { locale: pl })}
        </p>
        <p className="text-stone-600 text-base tracking-[0.15em] font-sans">
          {formattedDate}
        </p>
        {(event.venue_name || event.venue_city) && (
          <p className="text-stone-400 text-xs tracking-[0.2em] font-sans">
            ✈ {event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ''}
          </p>
        )}
      </div>

      {/* Samolot dekoracyjny */}
      <div className="relative z-10 mb-6">
        <PlanePath color={gold} />
      </div>

      {/* Odliczanie */}
      {!isPast && (
        <div className="relative z-10 flex gap-4 md:gap-6 mb-8">
          {[
            { v: t.days, l: 'Dni' },
            { v: t.hours, l: 'Godz' },
            { v: t.minutes, l: 'Min' },
            { v: t.seconds, l: 'Sek' },
          ].map(({ v, l }) => (
            <div key={l} className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 border flex items-center justify-center mb-1.5"
                style={{ borderColor: `${gold}40`, backgroundColor: `${gold}08` }}>
                <span className="text-2xl md:text-3xl font-light" style={{ color: '#1a1008' }}>
                  {String(v).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-sans text-stone-400">{l}</span>
            </div>
          ))}
        </div>
      )}

      {event.description && (
        <p className="relative z-10 text-stone-500 text-sm leading-relaxed max-w-md mb-8 font-sans font-light">
          {event.description}
        </p>
      )}

      {/* CTA */}
      {sections.rsvp !== false && (
        <button onClick={onRSVP}
          className="relative z-10 group border px-10 py-3.5 text-xs tracking-[0.35em] uppercase font-sans font-medium transition-all duration-300"
          style={{ borderColor: gold, color: gold }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = gold
            ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = gold
          }}>
          Potwierdź obecność ✈
        </button>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-25 z-10">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-stone-400" />
        <div className="w-1 h-1 rounded-full bg-stone-400" />
      </div>
    </section>
  )
}
