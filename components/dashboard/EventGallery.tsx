'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { Trash2, Download, RefreshCw, Image } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EventGallery({ event }: { event: Event }) {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('gallery_photos').select('*').eq('event_id', event.id).order('created_at', { ascending: false })
    setPhotos(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [event.id])

  const removePhoto = async (id: string, storagePath: string) => {
    await supabase.storage.from('gallery').remove([storagePath])
    await supabase.from('gallery_photos').delete().eq('id', id)
    setPhotos(prev => prev.filter(p => p.id !== id))
    toast.success('Zdjęcie usunięte')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-lg">Galeria</h2>
          <p className="text-xs text-gray-500">{photos.length} zdjęć · Kod: <strong className="text-gray-300">{event.gallery_code}</strong></p>
        </div>
        <button onClick={load} className="btn-secondary py-2 px-4 text-sm">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Odśwież
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="card text-center py-12">
          <Image size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Brak zdjęć w galerii</p>
          <p className="text-gray-600 text-xs mt-1">Goście dodają zdjęcia przez Foto Budkę</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <a href={photo.url} download className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2"><Download size={14} className="text-white" /></a>
                <button onClick={() => removePhoto(photo.id, photo.storage_path)} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
