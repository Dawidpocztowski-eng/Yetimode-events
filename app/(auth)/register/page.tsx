'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { ParticleBackground } from '@/components/ui/BackgroundGraphics'

const PERKS = [
  'Strona wydarzenia z unikalnym linkiem',
  'Formularz RSVP dla gości',
  'Foto Budka + galeria w chmurze',
  'Panel: goście, budżet, stoliki',
]

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('Hasło musi mieć min. 6 znaków'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Konto utworzone!')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">

      {/* Lewa strona — grafika */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-[#0a0a0f]" />
        <ParticleBackground color="#6366f1" />

        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-violet-900/50">
            <Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Zacznij planować<br />swoje wydarzenie
          </h2>
          <p className="text-gray-400 leading-relaxed mb-10">
            Dołącz do organizatorów, którzy tworzą niezapomniane chwile z YetiMode.
          </p>
          <div className="space-y-3">
            {PERKS.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-violet-400" />
                </div>
                <span className="text-gray-300 text-sm">{perk}</span>
              </div>
            ))}
          </div>

          {/* Dekoracja */}
          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-sm">💍</div>
              <div>
                <p className="text-white text-sm font-medium">Wesele Agnieszki & Dawida</p>
                <p className="text-gray-500 text-xs">yetimode-events.pl/e/wesele-agnieszki-dawida</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['124', 'Gości'], ['18', 'Stoliki'], ['89%', 'Budżet']].map(([v, l]) => (
                <div key={l} className="bg-white/5 rounded-xl py-2">
                  <p className="text-white font-bold text-sm">{v}</p>
                  <p className="text-gray-500 text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prawa strona — formularz */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">YetiMode</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Utwórz konto</h1>
          <p className="text-gray-400 text-sm mb-8">
            Masz już konto?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Zaloguj się
            </Link>
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Imię i nazwisko</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-violet-500 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                placeholder="Jan Kowalski"
              />
            </div>
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
                  placeholder="min. 6 znaków"
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
                <><span>Utwórz konto</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-gray-600 text-xs text-center mt-6">
            Rejestrując się akceptujesz regulamin i politykę prywatności
          </p>
        </div>
      </div>
    </div>
  )
}
