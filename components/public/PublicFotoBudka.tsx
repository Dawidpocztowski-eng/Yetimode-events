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
  { id: 'passport', label: '🧭 Paszport' },
  { id: 'boarding', label: '✈ Boarding' },
  { id: 'compass', label: '⭐ Kompas' },
  { id: 'map', label: '🗺 Mapa' },
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
    const dateStr = new Date(event.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
    const gold = '#c9a84c'

    switch (frame) {
      // NAKŁADKA: Paszport ślubny — kremowe tło na górze i dole, styl dokumentu
      case 'passport': return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Górna belka — styl paszportu */}
          <div className="absolute top-0 left-0 right-0 px-4 py-3"
            style={{ background: 'linear-gradient(to bottom, rgba(250,248,243,0.97), rgba(250,248,243,0.85) 70%, transparent)' }}>
            <p className="text-center font-serif font-light tracking-[0.3em] text-xs uppercase"
              style={{ color: gold }}>✈ Wedding Pass · 1 Klasa</p>
          </div>
          {/* Dolna belka */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-4"
            style={{ background: 'linear-gradient(to top, rgba(250,248,243,0.97), rgba(250,248,243,0.85) 70%, transparent)' }}>
            <p className="text-center font-serif font-semibold tracking-[0.08em]"
              style={{ fontSize: 'clamp(14px, 4vw, 20px)', color: '#1a1008' }}>{name}</p>
            <p className="text-center font-sans text-xs tracking-[0.2em] mt-0.5"
              style={{ color: `${gold}cc` }}>{dateStr}</p>
          </div>
          {/* Narożniki — styl biletu */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t border-l" style={{ borderColor: `${gold}80` }} />
          <div className="absolute top-2 right-2 w-5 h-5 border-t border-r" style={{ borderColor: `${gold}80` }} />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b border-l" style={{ borderColor: `${gold}80` }} />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b border-r" style={{ borderColor: `${gold}80` }} />
        </div>
      )

      // NAKŁADKA: Boarding Pass — poziome pasy jak bilet lotniczy
      case 'boarding': return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Lewy pasek złoty jak na zaproszeniu */}
          <div className="absolute top-0 left-0 bottom-0 w-10 flex items-center justify-center"
            style={{ background: `linear-gradient(to bottom, ${gold}ee, ${gold}bb)` }}>
            <p className="text-white text-xs font-sans font-bold tracking-[0.3em] uppercase"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.3em' }}>
              Wedding Pass
            </p>
          </div>
          {/* Dolna belka */}
          <div className="absolute bottom-0 left-10 right-0 px-3 py-3"
            style={{ background: 'linear-gradient(to top, rgba(250,248,243,0.96), rgba(250,248,243,0.8) 70%, transparent)' }}>
            <p className="font-serif font-semibold tracking-wider" style={{ color: '#1a1008', fontSize: 'clamp(12px, 3.5vw, 18px)' }}>
              {name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-sans text-xs tracking-wider" style={{ color: gold }}>✈ {event.venue_city || 'Szczyrk'}</span>
              <span className="text-stone-300 text-xs">·</span>
              <span className="font-sans text-xs text-stone-400">{dateStr}</span>
            </div>
          </div>
          {/* Linia perforowana */}
          <div className="absolute top-1/2 left-10 right-0 flex gap-1 -translate-y-1/2 opacity-0" />
        </div>
      )

      // NAKŁADKA: Kompas — rozeta kompasu na środku z transparentnym tłem
      case 'compass': return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
          {/* Kompas SVG na środku — półtransparentny */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
            <svg width="180" height="180" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke={gold} strokeWidth="1.5" />
              <circle cx="100" cy="100" r="60" stroke={gold} strokeWidth="0.8" strokeOpacity="0.5" />
              <text x="100" y="20" textAnchor="middle" fill={gold} fontSize="14" fontFamily="serif" fontWeight="700">N</text>
              <text x="100" y="190" textAnchor="middle" fill={gold} fontSize="12" fontFamily="serif">S</text>
              <text x="14" y="105" textAnchor="middle" fill={gold} fontSize="12" fontFamily="serif">W</text>
              <text x="188" y="105" textAnchor="middle" fill={gold} fontSize="12" fontFamily="serif">E</text>
              <polygon points="100,25 105,95 100,110 95,95" fill={gold} />
              <polygon points="100,175 105,105 100,90 95,105" fill={gold} opacity="0.5" />
              <polygon points="25,100 95,105 110,100 95,95" fill={gold} opacity="0.5" />
              <polygon points="175,100 105,105 90,100 105,95" fill={gold} />
              <circle cx="100" cy="100" r="8" fill={gold} opacity="0.3" />
              <circle cx="100" cy="100" r="4" fill={gold} opacity="0.7" />
            </svg>
          </div>
          {/* Górna belka */}
          <div className="px-4 py-3" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)' }}>
            <p className="text-white text-xs font-sans tracking-[0.4em] uppercase text-center opacity-90">
              🧭 {event.venue_city || 'Szczyrk'} · {new Date(event.date).getFullYear()}
            </p>
          </div>
          {/* Dolna belka */}
          <div className="px-4 py-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
            <p className="text-white text-center font-serif font-light tracking-[0.1em]"
              style={{ fontSize: 'clamp(14px, 4vw, 22px)' }}>{name}</p>
            <p className="text-center font-sans text-xs mt-1 tracking-widest" style={{ color: `${gold}dd` }}>
              {dateStr}
            </p>
          </div>
          {/* Narożniki */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 opacity-60" style={{ borderColor: gold }} />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 opacity-60" style={{ borderColor: gold }} />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 opacity-60" style={{ borderColor: gold }} />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 opacity-60" style={{ borderColor: gold }} />
        </div>
      )

      // NAKŁADKA: Mapa świata — tło z mapą i samolotem
      case 'map': return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Mapa w tle */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <svg viewBox="0 0 1200 600" className="w-full h-full">
              <g fill={gold}>
                <ellipse cx="580" cy="200" rx="80" ry="70" />
                <ellipse cx="820" cy="210" rx="160" ry="90" />
                <ellipse cx="590" cy="360" rx="70" ry="100" />
                <ellipse cx="230" cy="230" rx="120" ry="100" />
                <ellipse cx="300" cy="400" rx="70" ry="110" />
                <ellipse cx="950" cy="400" rx="80" ry="60" />
              </g>
            </svg>
          </div>
          {/* Samolot z sercem */}
          <div className="absolute top-1/3 left-1/4">
            <svg width="120" height="70" viewBox="0 0 120 70" opacity="0.5">
              <path d="M 10 55 Q 25 20 50 42 Q 65 55 58 30 L 108 10"
                stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
              <text x="102" y="13" fontSize="14" fill="white" transform="rotate(-30, 108, 10)">✈</text>
            </svg>
          </div>
          {/* Górna belka */}
          <div className="absolute top-0 left-0 right-0 px-4 py-3"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
            <p className="text-white text-xs font-sans tracking-[0.5em] text-center uppercase opacity-80">
              Widzimy się na miejscu...
            </p>
          </div>
          {/* Dolna belka */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-4"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
            <p className="text-white text-center font-serif font-semibold tracking-wider"
              style={{ fontSize: 'clamp(14px, 4vw, 20px)' }}>{name}</p>
            <p className="text-center font-sans text-xs mt-1" style={{ color: `${gold}dd` }}>
              ✈ {event.venue_city || 'Szczyrk'} · {dateStr}
            </p>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <section className="min-h-screen pt-14 bg-[#faf8f3] px-4"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <div className="max-w-lg mx-auto py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 opacity-30" style={{ background: '#c9a84c' }} />
            <span className="text-xs tracking-[0.4em] uppercase font-sans" style={{ color: '#c9a84c' }}>Foto Budka</span>
            <div className="h-px w-12 opacity-30" style={{ background: '#c9a84c' }} />
          </div>
          <h2 className="text-4xl font-light mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1008' }}>
            Złap chwilę ✈
          </h2>
          <p className="text-stone-400 text-sm font-sans">Zrób zdjęcie i dodaj je do galerii wspomnień</p>
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
