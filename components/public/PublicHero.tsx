'use client'

import { useEffect, useState } from 'react'
import { Event } from '@/lib/types'
import { MapPin, Clock, Calendar } from 'lucide-react'
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

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden bg-[#07070f]">

      {/* Tło graficzne dopasowane do typu */}
      {isWedding
        ? <WeddingBackground color={color} />
        : <ParticleBackground color={color} />
      }

      {/* Dodatkowy glow na środku */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[150px] opacity-15 pointer-events-none"
        style={{ backgroundColor: color }} />

      {/* Typ badge */}
      <div className="relative inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm text-gray-300 text-xs font-medium px-4 py-2 rounded-full mb-8">
        <span className="text-base">
          {event.type === 'wedding' ? '💍' : event.type === 'birthday' ? '🎂' : event.type === 'christening' ? '🕊️' : '📅'}
        </span>
        {event.type === 'wedding' ? 'Zaproszenie ślubne' : event.type === 'birthday' ? 'Zaproszenie urodzinowe' : event.type === 'christening' ? 'Zaproszenie na chrzciny' : 'Zaproszenie'}
      </div>

      {/* Imiona / tytuł */}
      {isWedding && event.partner1_name && event.partner2_name ? (
        <div className="relative mb-6">
          <h1 className="text-6xl md:text-8xl font-bold leading-none tracking-tight" style={{ color }}>
            {event.partner1_name}
          </h1>
          <div className="flex items-center justify-center gap-6 my-4">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to right, transparent, ${color}40)` }} />
            <span className="text-3xl">💍</span>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to left, transparent, ${color}40)` }} />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold leading-none tracking-tight" style={{ color }}>
            {event.partner2_name}
          </h1>
        </div>
      ) : (
        <h1 className="relative text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color }}>
          {event.title}
        </h1>
      )}

      {/* Data */}
      <p className="relative text-xl md:text-2xl text-gray-300 tracking-[0.3em] uppercase mb-6 font-light">
        {format(new Date(event.date), 'd · MM · yyyy')}
      </p>

      {/* Info */}
      <div className="relative flex flex-col sm:flex-row gap-4 text-gray-400 text-sm mb-12 flex-wrap justify-center">
        {event.venue_name && (
          <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            <MapPin size={13} style={{ color }} /> {event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ''}
          </span>
        )}
        {event.time && (
          <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            <Clock size={13} style={{ color }} /> {event.time}
          </span>
        )}
        {isWedding && event.church_name && (
          <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            <Calendar size={13} style={{ color }} /> {event.church_name}{event.church_time ? ` · ${event.church_time}` : ''}
          </span>
        )}
        {event.type === 'christening' && event.church_name && (
          <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            <Calendar size={13} style={{ color }} /> Chrzest: {event.church_name}{event.church_time ? ` · ${event.church_time}` : ''}
          </span>
        )}
      </div>

      {/* Odliczanie */}
      <div className="relative grid grid-cols-4 gap-3 md:gap-5 mb-12">
        {[{ v: t.days, l: 'Dni' }, { v: t.hours, l: 'Godzin' }, { v: t.minutes, l: 'Minut' }, { v: t.seconds, l: 'Sekund' }].map(({ v, l }) => (
          <div key={l} className="relative bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-4 md:py-5 text-center min-w-[70px] overflow-hidden">
            <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }} />
            <p className="text-3xl md:text-4xl font-bold text-white relative">{String(v).padStart(2, '0')}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider relative">{l}</p>
          </div>
        ))}
      </div>

      {event.description && (
        <p className="relative text-gray-400 text-center max-w-lg mb-10 leading-relaxed">{event.description}</p>
      )}

      {/* CTA */}
      <button onClick={onRSVP}
        className="relative group text-white font-semibold px-10 py-4 rounded-2xl transition-all text-lg shadow-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 20px 60px ${color}30` }}>
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
        <span className="relative">Potwierdź obecność →</span>
      </button>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-white" />
      </div>
    </section>
  )
}
