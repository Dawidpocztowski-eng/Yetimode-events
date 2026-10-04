'use client'

import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

export default function PublicSchedule({ event }: { event: Event }) {
  const color = event.primary_color || '#8b5cf6'
  const schedule = event.schedule || []
  const formattedDate = format(new Date(event.date), "d MMMM yyyy", { locale: pl })

  return (
    <section className="min-h-screen pt-14 bg-[#050508] px-4">
      <div className="max-w-xl mx-auto py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/15" />
            <span className="text-white/20 text-xs tracking-[0.4em] uppercase font-sans">Program</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/15" />
          </div>
          <h2 className="text-4xl font-light text-white mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Plan dnia
          </h2>
          <p className="text-white/30 text-sm font-sans">{formattedDate}</p>
        </div>

        {schedule.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/20 text-sm font-sans tracking-wider">Plan dnia zostanie wkrótce opublikowany</p>
          </div>
        ) : (
          <div className="relative">
            {/* Pionowa linia */}
            <div className="absolute left-[27px] top-3 bottom-3 w-px"
              style={{ background: `linear-gradient(to bottom, transparent, ${color}25 15%, ${color}25 85%, transparent)` }} />

            <div className="space-y-8">
              {schedule.map((item, idx) => (
                <div key={item.id} className="relative flex gap-6 items-start group">
                  {/* Kropka na osi */}
                  <div className="relative flex-shrink-0 flex items-center justify-center w-14">
                    <div className="w-2 h-2 rounded-full border border-white/20 bg-[#050508] relative z-10 transition-all group-hover:border-white/50"
                      style={{ boxShadow: `0 0 0 4px #050508` }} />
                  </div>

                  {/* Treść */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline gap-3 mb-1.5">
                      <span className="font-sans text-xs tracking-[0.2em] font-medium"
                        style={{ color: `${color}cc` }}>
                        {item.time}
                      </span>
                      <span className="text-white/20 text-xs">—</span>
                      <span className="text-white font-sans text-sm font-medium">
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.title}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-white/30 text-xs font-sans leading-relaxed pl-0">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center mt-16">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </section>
  )
}
