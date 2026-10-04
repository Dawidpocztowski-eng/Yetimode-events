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
  const color = event.primary_color || '#8b5cf6'
  const webcamRef = useRef<Webcam>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<{ dataUrl: string; name: string }[]>([])
  const [frame, setFrame] = useState('none')
  const [mode, setMode] = useState<'camera' | 'upload'>('camera')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const capture = useCallback(() => {
    const img = webcamRef.current?.getScreenshot()
    if (img) setPhoto(img)
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const fileArray = Array.from(files)
    const results: { dataUrl: string; name: string }[] = []
    let loaded = 0
    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = ev => {
        results.push({ dataUrl: ev.target?.result as string, name: file.name })
        loaded++
        if (loaded === fileArray.length) setUploadedFiles(results)
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
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
      toast.success('Zdjęcie dodane do galerii!')
      setPhoto(null)
    } catch {
      toast.error('Błąd podczas wgrywania')
    } finally {
      setUploading(false)
    }
  }

  const uploadAllFiles = async () => {
    if (uploadedFiles.length === 0) return
    setUploading(true)
    setUploadProgress({ done: 0, total: uploadedFiles.length })
    let successCount = 0
    let errorCount = 0
    const supabase = createClient()

    for (let i = 0; i < uploadedFiles.length; i++) {
      try {
        const blob = await (await fetch(uploadedFiles[i].dataUrl)).blob()
        const path = `${event.id}/${uuidv4()}.jpg`
        const { error: uploadError } = await supabase.storage.from('gallery').upload(path, blob, { contentType: 'image/jpeg' })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path)
        const { error: dbError } = await supabase.from('gallery_photos').insert({ event_id: event.id, storage_path: path, url: publicUrl, frame })
        if (dbError) throw dbError
        successCount++
      } catch { errorCount++ }
      setUploadProgress({ done: i + 1, total: uploadedFiles.length })
    }

    setUploading(false)
    setUploadProgress(null)
    if (errorCount === 0) toast.success(`${successCount} zdjęć dodanych do galerii!`)
    else toast.error(`${successCount} wgrano, ${errorCount} błędów`)
    if (successCount > 0) setUploadedFiles([])
  }

  const getOverlay = () => {
    const name = event.partner1_name && event.partner2_name
      ? `${event.partner1_name} & ${event.partner2_name}` : event.title
    switch (frame) {
      case 'event': return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
          <div className="flex items-center justify-center gap-2 bg-black/50 backdrop-blur-sm rounded-xl py-2 px-3">
            <span className="text-white font-sans font-medium text-sm">{name}</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-black/50 backdrop-blur-sm rounded-xl py-2 px-3">
            <span className="text-white/70 font-sans text-xs">{new Date(event.date).toLocaleDateString('pl-PL')} · {event.venue_city || ''}</span>
          </div>
          <div className="absolute top-2 left-2 text-xl">💐</div>
          <div className="absolute top-2 right-2 text-xl">💐</div>
        </div>
      )
      case 'gold': return <div className="absolute inset-0 pointer-events-none border-4 border-yellow-400/60 rounded-2xl"><span className="absolute top-2 left-2 text-xl">✨</span><span className="absolute top-2 right-2 text-xl">✨</span><span className="absolute bottom-2 left-2 text-xl">✨</span><span className="absolute bottom-2 right-2 text-xl">✨</span></div>
      case 'flowers': return <div className="absolute inset-0 pointer-events-none border-4 border-pink-300/60 rounded-2xl"><span className="absolute top-2 left-2 text-xl">🌸</span><span className="absolute top-2 right-2 text-xl">🌺</span><span className="absolute bottom-2 left-2 text-xl">🌷</span><span className="absolute bottom-2 right-2 text-xl">🌸</span></div>
      case 'hearts': return <div className="absolute inset-0 pointer-events-none border-4 border-red-300/60 rounded-2xl"><span className="absolute top-2 left-2 text-xl">💕</span><span className="absolute top-2 right-2 text-xl">💖</span><span className="absolute bottom-2 left-2 text-xl">💗</span><span className="absolute bottom-2 right-2 text-xl">💕</span></div>
      default: return null
    }
  }

  return (
    <section className="min-h-screen pt-14 bg-[#050508] px-4">
      <div className="max-w-lg mx-auto py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/15" />
            <span className="text-white/20 text-xs tracking-[0.4em] uppercase font-sans">Foto Budka</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/15" />
          </div>
          <h2 className="text-4xl font-light text-white mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Złap chwilę
          </h2>
          <p className="text-white/30 text-sm font-sans">Zrób zdjęcie i dodaj je do galerii</p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex border border-white/8 rounded-full p-0.5 gap-0.5">
            {(['camera', 'upload'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setPhoto(null) }}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-sans tracking-[0.1em] uppercase transition-all ${
                  mode === m ? 'text-white' : 'text-white/25 hover:text-white/50'
                }`}
                style={mode === m ? { backgroundColor: `${color}30`, color } : {}}>
                {m === 'camera' ? <><Camera size={12} /> Kamera</> : <><Upload size={12} /> Wgraj</>}
              </button>
            ))}
          </div>
        </div>

        {/* Frame selector */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          {FRAMES.map(f => (
            <button key={f.id} onClick={() => setFrame(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all border ${
                frame === f.id ? 'text-white border-white/20' : 'text-white/25 border-white/8 hover:border-white/15'
              }`}
              style={frame === f.id ? { backgroundColor: `${color}20`, borderColor: `${color}40` } : {}}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Camera / upload area */}
        <div className="rounded-2xl overflow-hidden border border-white/8 bg-black/20">
          {!photo ? (
            mode === 'camera' ? (
              <div className="relative bg-black">
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
                  className="w-full block"
                  onUserMedia={() => setCameraReady(true)}
                  onUserMediaError={() => toast.error('Brak dostępu do kamery')} />
                {getOverlay()}
                {cameraReady && (
                  <button onClick={capture}
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 hover:bg-white transition-all" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <label className="flex flex-col items-center justify-center h-44 border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                  <Upload size={28} className="text-white/15 mb-3" />
                  <span className="text-white/30 text-sm font-sans">Kliknij aby wybrać zdjęcia</span>
                  <span className="text-white/15 text-xs font-sans mt-1">Możesz wybrać wiele plików</span>
                  <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                </label>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden aspect-square group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover" />
                          <button onClick={() => removeUploadedFile(i)}
                            className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={11} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {uploadProgress && (
                      <div className="h-px w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%`, backgroundColor: color }} />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => setUploadedFiles([])} disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 border border-white/8 text-white/30 rounded-xl py-3 hover:border-white/15 hover:text-white/50 transition-all text-xs font-sans">
                        <X size={13} /> Wyczyść
                      </button>
                      <button onClick={uploadAllFiles} disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-xs font-sans font-medium transition-all"
                        style={{ backgroundColor: `${color}cc` }}>
                        {uploading
                          ? <><RefreshCw size={13} className="animate-spin" /> {uploadProgress ? `${uploadProgress.done}/${uploadProgress.total}` : '...'}</>
                          : <><Send size={13} /> Dodaj {uploadedFiles.length} zdjęć</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div>
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Podgląd" className="w-full block" />
                {getOverlay()}
              </div>
              <div className="flex gap-2 p-3">
                <button onClick={() => setPhoto(null)}
                  className="flex-1 flex items-center justify-center gap-2 border border-white/8 text-white/30 rounded-xl py-3 hover:border-white/15 hover:text-white/50 transition-all text-xs font-sans">
                  <X size={13} /> Nowe
                </button>
                <button onClick={uploadPhoto} disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-xs font-sans font-medium transition-all"
                  style={{ backgroundColor: `${color}cc` }}>
                  {uploading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                  {uploading ? 'Wysyłanie...' : 'Dodaj do galerii'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center mt-14">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </section>
  )
}
