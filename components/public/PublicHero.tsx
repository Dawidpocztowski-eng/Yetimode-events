'use client'

import { useEffect, useState } from 'react'
import { Event } from '@/lib/types'
import { MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { WeddingBackground, ParticleBackground } from '@/components/ui/BackgroundGraphics'

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

export default function PublicHero({ event, onRSVP, sections = {} }: Props) {
  const color = event.primary_color || '#8b5cf6'
  const eventDate = new Date(event.date + (event.time ? `T${event.time}` : 'T12:00:00'))
  const t = useCountdown(eventDate)
  const isWedding = event.type === 'wedding'
  const isPast = eventDate < new Date()

  const formattedDate = format(new Date(event.date), "d MMMM yyyy", { locale: pl })
  const formattedDayOfWeek = format(new Date(event.date), "EEEE", { locale: pl })

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden bg-[#050508] pt-14">

      {isWedding ? <WeddingBackground color={color} /> : <ParticleBackground color={color} />}

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 pointer-events-none"
        style={{ backgroundColor: color }} />

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">

        {/* Dekoracyjna linia górna */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-white/20 text-xs tracking-[0.4em] uppercase font-sans">
            {event.type === 'wedding' ? 'Zaproszenie' : event.type === 'birthday' ? 'Urodziny' : event.type === 'christening' ? 'Chrzciny' : 'Wydarzenie'}
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* Imiona / tytuł */}
        {isWedding && event.partner1_name && event.partner2_name ? (
          <div className="mb-8">
            <h1 className="font-light tracking-[0.05em] leading-none" style={{
              fontSize: 'clamp(3.5rem, 12vw, 7rem)',
              color,
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif"
            }}>
              {event.partner1_name}
            </h1>
            <div className="flex items-center justify-center gap-5 my-5">
              <div className="h-px flex-1 max-w-[100px]" style={{ background: `linear-gradient(to right, transparent, ${color}30)` }} />
              <span className="text-white/30 text-xl font-light">&</span>
              <div className="h-px flex-1 max-w-[100px]" style={{ background: `linear-gradient(to left, transparent, ${color}30)` }} />
            </div>
            <h1 className="font-light tracking-[0.05em] leading-none" style={{
              fontSize: 'clamp(3.5rem, 12vw, 7rem)',
              color,
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif"
            }}>
              {event.partner2_name}
            </h1>
          </div>
        ) : (
          <h1 className="font-light tracking-[0.05em] mb-8 leading-tight" style={{
            fontSize: 'clamp(2.5rem, 10vw, 5.5rem)',
            color,
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif"
          }}>
            {event.title}
          </h1>
        )}

        {/* Data */}
        <div className="mb-8 space-y-1">
          <p className="text-white/70 font-light tracking-[0.35em] uppercase text-sm font-sans capitalize">
            {formattedDayOfWeek}
          </p>
          <p className="text-white/90 font-light tracking-[0.2em] text-lg font-sans">
            {formattedDate}
          </p>
        </div>

        {/* Lokalizacja i godzina */}
        {(event.venue_name || event.time) && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {event.venue_name && (
              <span className="flex items-center gap-2 text-white/40 text-xs tracking-wider font-sans px-4 py-2 rounded-full border border-white/8">
                <MapPin size={11} style={{ color }} />
                {event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ''}
              </span>
            )}
            {event.time && (
              <span className="flex items-center gap-2 text-white/40 text-xs tracking-wider font-sans px-4 py-2 rounded-full border border-white/8">
                <Clock size={11} style={{ color }} />
                {event.time}
              </span>
            )}
            {isWedding && event.church_name && (
              <span className="flex items-center gap-2 text-white/40 text-xs tracking-wider font-sans px-4 py-2 rounded-full border border-white/8">
                <span className="text-xs" style={{ color }}>✦</span>
                {event.church_name}{event.church_time ? ` · ${event.church_time}` : ''}
              </span>
            )}
          </div>
        )}

        {/* Odliczanie */}
        {!isPast && (
          <div className="grid grid-cols-4 gap-3 md:gap-5 mb-12 w-full max-w-sm">
            {[
              { v: t.days, l: 'Dni' },
              { v: t.hours, l: 'Godz' },
              { v: t.minutes, l: 'Min' },
              { v: t.seconds, l: 'Sek' }
            ].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center">
                <div className="relative w-full aspect-square flex items-center justify-center mb-1.5">
                  <div className="absolute inset-0 rounded-2xl border border-white/8 bg-white/3" />
                  <div className="absolute inset-0 rounded-2xl opacity-5"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }} />
                  <span className="relative text-2xl md:text-3xl font-light text-white tracking-tight" style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif"
                  }}>
                    {String(v).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-white/25 text-[9px] tracking-[0.25em] uppercase font-sans">{l}</span>
              </div>
            ))}
          </div>
        )}

        {event.description && (
          <p className="text-white/40 text-sm leading-relaxed max-w-md mb-10 font-sans font-light">
            {event.description}
          </p>
        )}

        {/* CTA */}
        {sections.rsvp !== false && (
          <button onClick={onRSVP}
            className="group relative overflow-hidden px-10 py-4 rounded-full font-sans text-sm tracking-[0.2em] uppercase font-medium text-white transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}88)`, boxShadow: `0 8px 40px ${color}25` }}>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-full" />
            <span className="relative">Potwierdź obecność</span>
          </button>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-white animate-pulse" />
      </div>
    </section>
  )
}
