'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { Lock, Download, Image, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PublicGallery({ event }: { event: Event }) {
  const color = event.primary_color || '#0ea5e9'
  const [code, setCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const unlock = async () => {
    if (code.toUpperCase() !== event.gallery_code.toUpperCase()) { toast.error('Nieprawidłowy kod'); return }
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('gallery_photos').select('*').eq('event_id', event.id).order('created_at', { ascending: false })
    setPhotos(data || [])
    setUnlocked(true)
    toast.success('Galeria odblokowana! 🎉')
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#07070f]">
      <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Lock size={28} style={{ color }} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Galeria</h2>
        <p className="text-gray-500 text-sm mb-6">Wpisz kod dostępu aby zobaczyć zdjęcia</p>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && unlock()}
          className="input text-center text-2xl tracking-widest mb-4" placeholder="XXXX" maxLength={12} />
        <button onClick={unlock} disabled={loading}
          className="w-full text-white font-semibold py-4 rounded-2xl transition-all"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          {loading ? 'Sprawdzanie...' : 'Odblokuj'}
        </button>
      </div>
    </div>
  )

  return (
    <section className="min-h-screen py-16 px-4 bg-[#07070f]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Galeria</h2>
            <p className="text-gray-500 text-sm">{photos.length} zdjęć</p>
          </div>
          <button onClick={refresh} disabled={loading} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Odśwież
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16">
            <Image size={48} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Brak zdjęć. Bądź pierwszy!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <a href={photo.url} download className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2.5">
                    <Download size={16} className="text-white" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
