'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { ParticleBackground } from '@/components/ui/BackgroundGraphics'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Nieprawidłowy email lub hasło')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">

      {/* Lewa strona — grafika */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
        {/* Tło */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-950 to-[#0a0a0f]" />
        <ParticleBackground color="#8b5cf6" />

        {/* Treść */}
        <div className="relative z-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-900/50">
            <Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Witaj z powrotem
          </h2>
          <p className="text-gray-400 leading-relaxed mb-10">
            Zaloguj się i zarządzaj swoimi wydarzeniami. Goście czekają na Twoje zaproszenie.
          </p>

          {/* Mock cards */}
          <div className="space-y-3">
            {[
              { name: 'Wesele Ani & Piotra', date: '15.07.2027', guests: 124, color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/20' },
              { name: 'Urodziny Marka', date: '22.08.2027', guests: 48, color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20' },
            ].map(ev => (
              <div key={ev.name} className={`bg-gradient-to-r ${ev.color} border ${ev.border} rounded-2xl px-5 py-4 text-left backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm">{ev.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{ev.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{ev.guests}</p>
                    <p className="text-gray-400 text-xs">gości</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prawa strona — formularz */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">YetiMode</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Zaloguj się</h1>
          <p className="text-gray-400 text-sm mb-8">
            Nie masz konta?{' '}
            <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Zarejestruj się
            </Link>
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                placeholder="twoj@email.pl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Hasło</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-900/30 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Zaloguj się</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
