'use client'

import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

export default function PublicSchedule({ event }: { event: Event }) {
  const gold = '#c9a84c'
  const schedule = event.schedule || []
  const formattedDate = format(new Date(event.date), "d MMMM yyyy", { locale: pl })

  return (
    <section className="relative min-h-screen pt-14 px-4 overflow-hidden"
      style={{ backgroundColor: '#faf8f3', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* Tekstura pergaminu w tle */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/texture-parchment.png" alt="" aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.15] pointer-events-none select-none" />

      {/* Mapa świata w tle */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/map-world.png" alt="" aria-hidden="true"
        className="absolute bottom-0 left-0 w-full object-cover opacity-[0.07] pointer-events-none select-none" />

      <div className="relative z-10 max-w-xl mx-auto py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${gold}50)` }} />
            <span className="text-xs tracking-[0.5em] uppercase font-sans" style={{ color: gold }}>Program</span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${gold}50)` }} />
          </div>
          <h2 className="text-4xl font-light mb-3 tracking-[0.04em]" style={{ color: '#1a1008' }}>
            Plan dnia
          </h2>
          <p className="text-stone-400 text-sm font-sans">{formattedDate}</p>

          {/* Kompas dekoracyjny */}
          <div className="flex justify-center mt-6 opacity-60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/compass-rose.png" alt="" aria-hidden="true" className="w-16 h-16 object-contain" />
          </div>
        </div>

        {schedule.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-300 text-sm font-sans tracking-wider">Plan dnia zostanie wkrótce opublikowany</p>
          </div>
        ) : (
          <div className="relative">
            {/* Pionowa linia osi czasu */}
            <div className="absolute left-[27px] top-3 bottom-3 w-px"
              style={{ background: `linear-gradient(to bottom, transparent, ${gold}40 10%, ${gold}40 90%, transparent)` }} />

            <div className="space-y-8">
              {schedule.map((item) => (
                <div key={item.id} className="relative flex gap-6 items-start group">

                  {/* Kropka na osi */}
                  <div className="relative flex-shrink-0 flex items-center justify-center w-14 pt-1">
                    <div className="w-3 h-3 rounded-full border-2 relative z-10 transition-all"
                      style={{
                        borderColor: gold,
                        backgroundColor: '#faf8f3',
                        boxShadow: `0 0 0 3px #faf8f3`,
                      }} />
                  </div>

                  {/* Karta zdarzenia */}
                  <div className="flex-1 pb-2 border-b last:border-0" style={{ borderColor: `${gold}18` }}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-sans text-xs tracking-[0.25em] font-semibold"
                        style={{ color: gold }}>
                        {item.time}
                      </span>
                      {item.icon && <span className="text-base">{item.icon}</span>}
                    </div>
                    <h3 className="text-stone-800 font-sans font-semibold text-base mb-0.5">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-stone-400 text-sm font-sans leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stopka — samolot */}
        <div className="flex flex-col items-center mt-14 gap-3 opacity-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/plane-heart.png" alt="" aria-hidden="true" className="w-20 object-contain" />
          <div className="h-px w-24" style={{ background: `linear-gradient(to right, transparent, ${gold}60, transparent)` }} />
        </div>
      </div>
    </section>
  )
}
