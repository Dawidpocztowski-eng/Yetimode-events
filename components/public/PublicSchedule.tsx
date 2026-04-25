'use client'

import { Event } from '@/lib/types'
import { Clock } from 'lucide-react'

export default function PublicSchedule({ event }: { event: Event }) {
  const color = event.primary_color || '#8b5cf6'
  const schedule = event.schedule || []

  return (
    <section className="min-h-screen py-16 px-4 bg-[#07070f]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <Clock size={32} className="mx-auto mb-3" style={{ color }} />
          <h2 className="text-3xl font-bold text-white mb-2">Plan dnia</h2>
          <p className="text-gray-500">{new Date(event.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {schedule.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <p>Plan dnia zostanie wkrótce opublikowany</p>
          </div>
        ) : (
          <div className="relative">
            {/* Linia czasu */}
            <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${color}40, transparent)` }} />

            <div className="space-y-5">
              {schedule.map((item, idx) => (
                <div key={item.id} className="relative flex gap-5 items-start">
                  {/* Ikona */}
                  <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    {item.icon || '🎉'}
                  </div>
                  {/* Treść */}
                  <div className="bg-white/5 border border-white/8 rounded-2xl p-4 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-bold text-sm" style={{ color }}>{item.time}</span>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                    </div>
                    {item.description && <p className="text-gray-500 text-sm">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
