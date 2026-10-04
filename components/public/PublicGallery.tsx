'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { Download, RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PublicGallery({ event }: { event: Event }) {
  const color = event.primary_color || '#8b5cf6'
  const [code, setCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const unlock = async () => {
    if (code.toUpperCase() !== event.gallery_code.toUpperCase()) { toast.error('Nieprawidłowy kod'); return }
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('gallery_photos').select('*').eq('event_id', event.id).order('created_at', { ascending: false })
    setPhotos(data || [])
    setUnlocked(true)
    setLoading(false)
  }

  const refresh = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('gallery_photos').select('*').eq('event_id', event.id).order('created_at', { ascending: false })
    setPhotos(data || [])
    setLoading(false)
  }

  if (!unlocked) return (
    <div className="min-h-screen pt-14 bg-[#050508] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/15" />
          <span className="text-white/20 text-xs tracking-[0.4em] uppercase font-sans">Galeria</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/15" />
        </div>

        <h2 className="text-4xl font-light text-white mb-3"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Zdjęcia
        </h2>
        <p className="text-white/30 text-sm font-sans mb-10">Wpisz kod dostępu, aby zobaczyć galerię</p>

        <div className="space-y-4">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && unlock()}
            className="w-full bg-transparent border-b border-white/10 focus:border-white/30 py-3 text-center text-white text-xl tracking-[0.5em] font-sans placeholder-white/15 outline-none transition-all"
            placeholder="XXXX"
            maxLength={12}
          />
          <button onClick={unlock} disabled={loading}
            className="w-full py-4 rounded-full font-sans text-sm tracking-[0.2em] uppercase font-medium text-white transition-all duration-300 mt-6 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}88)`, boxShadow: `0 8px 40px ${color}20` }}>
            {loading ? 'Sprawdzanie...' : 'Odblokuj'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <section className="min-h-screen pt-14 bg-[#050508] px-4">
      <div className="max-w-4xl mx-auto py-16">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/15" />
              <span className="text-white/20 text-xs tracking-[0.4em] uppercase font-sans">Galeria</span>
            </div>
            <h2 className="text-3xl font-light text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Wspomnienia
            </h2>
            <p className="text-white/25 text-xs font-sans mt-1">{photos.length} {photos.length === 1 ? 'zdjęcie' : 'zdjęć'}</p>
          </div>
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 text-xs font-sans tracking-wider transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Odśwież
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/15 text-sm font-sans tracking-wider">Brak zdjęć. Bądź pierwszy!</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-2 space-y-2">
            {photos.map(photo => (
              <div key={photo.id}
                className="relative group break-inside-avoid overflow-hidden rounded-xl cursor-pointer"
                onClick={() => setLightbox(photo.url)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt=""
                  className="w-full block transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <a href={photo.url} download
                    onClick={e => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2.5 hover:bg-white/20">
                    <Download size={14} className="text-white" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors p-2">
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </section>
  )
}
