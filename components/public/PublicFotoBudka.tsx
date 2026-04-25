'use client'

import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/types'
import { Camera, Upload, X, Send, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

const FRAMES = [
  { id: 'none', label: 'Brak' },
  { id: 'event', label: '💍 Ślubna' },
  { id: 'gold', label: '✨ Złota' },
  { id: 'flowers', label: '🌸 Kwiaty' },
  { id: 'hearts', label: '💕 Serduszka' },
]

export default function PublicFotoBudka({ event }: { event: Event }) {
  const color = event.primary_color || '#0ea5e9'
  const webcamRef = useRef<Webcam>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [frame, setFrame] = useState('none')
  const [mode, setMode] = useState<'camera' | 'upload'>('camera')
  const [uploading, setUploading] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  const capture = useCallback(() => {
    const img = webcamRef.current?.getScreenshot()
    if (img) setPhoto(img)
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadPhoto = async () => {
    if (!photo) return
    setUploading(true)
    try {
      const supabase = createClient()
      const blob = await (await fetch(photo)).blob()
      const path = `${event.id}/${uuidv4()}.jpg`
      const { error: uploadError } = await supabase.storage.from('gallery').upload(path, blob, { contentType: 'image/jpeg' })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path)
      const { error: dbError } = await supabase.from('gallery_photos').insert({ event_id: event.id, storage_path: path, url: publicUrl, frame })
      if (dbError) throw dbError
      toast.success('Zdjęcie dodane do galerii! 🎉')
      setPhoto(null)
    } catch (err) {
      toast.error('Błąd podczas wgrywania')
    } finally {
      setUploading(false)
    }
  }

  const getOverlay = () => {
    const isWedding = event.type === 'wedding'
    const name = isWedding && event.partner1_name && event.partner2_name
      ? `${event.partner1_name} & ${event.partner2_name}`
      : event.title
    switch (frame) {
      case 'event': return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
          <div className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm rounded-xl py-2 px-3">
            <span className="text-white font-bold text-base">{name}</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm rounded-xl py-2 px-3">
            <span className="text-white text-sm">{new Date(event.date).toLocaleDateString('pl-PL')} · {event.venue_city || ''}</span>
          </div>
          <div className="absolute top-2 left-2 text-xl">💐</div>
          <div className="absolute top-2 right-2 text-xl">💐</div>
        </div>
      )
      case 'gold': return <div className="absolute inset-0 pointer-events-none border-8 border-yellow-400 rounded-2xl"><span className="absolute top-2 left-2 text-2xl">✨</span><span className="absolute top-2 right-2 text-2xl">✨</span><span className="absolute bottom-2 left-2 text-2xl">✨</span><span className="absolute bottom-2 right-2 text-2xl">✨</span></div>
      case 'flowers': return <div className="absolute inset-0 pointer-events-none border-8 border-pink-300 rounded-2xl"><span className="absolute top-2 left-2 text-2xl">🌸</span><span className="absolute top-2 right-2 text-2xl">🌺</span><span className="absolute bottom-2 left-2 text-2xl">🌷</span><span className="absolute bottom-2 right-2 text-2xl">🌸</span></div>
      case 'hearts': return <div className="absolute inset-0 pointer-events-none border-8 border-red-300 rounded-2xl"><span className="absolute top-2 left-2 text-2xl">💕</span><span className="absolute top-2 right-2 text-2xl">💖</span><span className="absolute bottom-2 left-2 text-2xl">💗</span><span className="absolute bottom-2 right-2 text-2xl">💕</span></div>
      default: return null
    }
  }

  return (
    <section className="min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Camera size={32} className="mx-auto mb-3" style={{ color }} />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Foto Budka</h2>
          <p className="text-gray-500">Zrób zdjęcie i dodaj je do galerii!</p>
        </div>

        <div className="flex gap-2 justify-center mb-4">
          {(['camera', 'upload'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setPhoto(null) }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${mode === m ? 'text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              style={mode === m ? { backgroundColor: color } : {}}>
              {m === 'camera' ? <><Camera size={15} /> Kamera</> : <><Upload size={15} /> Wgraj</>}
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-center mb-5 flex-wrap">
          {FRAMES.map(f => (
            <button key={f.id} onClick={() => setFrame(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${frame === f.id ? 'text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              style={frame === f.id ? { backgroundColor: color } : {}}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-4">
          {!photo ? (
            mode === 'camera' ? (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full rounded-2xl"
                  onUserMedia={() => setCameraReady(true)}
                  onUserMediaError={() => toast.error('Brak dostępu do kamery')} />
                {getOverlay()}
                {cameraReady && (
                  <button onClick={capture} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform">
                    <Camera size={26} style={{ color }} />
                  </button>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-gray-300 transition-colors">
                <Upload size={36} className="text-gray-300 mb-2" />
                <span className="text-gray-400 text-sm">Kliknij aby wybrać zdjęcie</span>
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
            )
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Podgląd" className="w-full rounded-2xl" />
                {getOverlay()}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPhoto(null)} className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-500 rounded-xl py-3 hover:border-red-300 hover:text-red-400 transition-all text-sm">
                  <X size={15} /> Nowe
                </button>
                <button onClick={uploadPhoto} disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-sm font-semibold transition-all"
                  style={{ backgroundColor: color }}>
                  {uploading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {uploading ? 'Wysyłanie...' : 'Dodaj do galerii'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
