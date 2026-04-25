'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PLANS, PlanKey } from '@/lib/stripe'
import { Check, Sparkles, ArrowLeft, Zap, Crown, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const PLAN_ICONS = { starter: Zap, wydarzenie: Star, premium: Crown }
const FREE_FEATURES = [
  'Dostęp do plannera (goście, budżet, stoliki)',
  'Podgląd jak wygląda strona',
  'Kreator wydarzenia',
  '❌ Strona NIE jest publiczna',
  '❌ Brak RSVP dla gości',
  '❌ Brak galerii',
]

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const res = await fetch('/api/stripe/plan')
        const data = await res.json()
        setCurrentPlan(data.plan)
        setExpiresAt(data.expires_at)
      }
    }
    init()
    if (searchParams.get('payment') === 'success') toast.success('Płatność zakończona! Plan aktywowany 🎉')
    if (searchParams.get('payment') === 'cancelled') toast.error('Płatność anulowana')
  }, [searchParams])

  const handleBuy = async (planKey: PlanKey) => {
    if (!user) { router.push('/register'); return }
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'Błąd płatności')
    } catch { toast.error('Błąd połączenia') }
    finally { setLoading(null) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/6 rounded-full blur-[150px] pointer-events-none" />

      <nav className="relative z-10 border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Sparkles size={18} className="text-violet-400" /> YetiMode Events
          </Link>
          {user
            ? <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"><ArrowLeft size={15} /> Dashboard</Link>
            : <Link href="/register" className="btn-primary py-2 px-4 text-sm">Zacznij za darmo</Link>
          }
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={12} /> Cennik
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Wybierz swój plan</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Jednorazowa opłata — bez subskrypcji, bez niespodzianek.</p>
          {currentPlan !== 'free' && expiresAt && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-2 rounded-full">
              <Check size={14} /> Aktywny plan: <strong>{currentPlan.toUpperCase()}</strong> · ważny do {new Date(expiresAt).toLocaleDateString('pl-PL')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* FREE */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="mb-5">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-white">0</span>
                <span className="text-gray-500 mb-1">zł</span>
              </div>
              <p className="text-xs text-gray-600">Na zawsze darmowy</p>
            </div>
            <ul className="space-y-2 flex-1 mb-6">
              {FREE_FEATURES.map(f => (
                <li key={f} className={`flex items-start gap-2 text-xs ${f.startsWith('❌') ? 'text-gray-600' : 'text-gray-400'}`}>
                  {!f.startsWith('❌') && <Check size={12} className="text-gray-500 mt-0.5 flex-shrink-0" />}
                  <span>{f.replace('❌ ', '')}</span>
                </li>
              ))}
            </ul>
            {user
              ? <Link href="/dashboard" className="w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 transition-colors">Twój plan</Link>
              : <Link href="/register" className="w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 transition-colors">Zacznij za darmo</Link>
            }
          </div>

          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
            const Icon = PLAN_ICONS[key]
            const isPopular = 'popular' in plan && plan.popular
            const isCurrent = currentPlan === key
            return (
              <div key={key} className={`relative rounded-2xl p-6 flex flex-col transition-all ${
                isPopular ? 'bg-gradient-to-b from-violet-600/20 to-indigo-600/10 border border-violet-500/30' : 'bg-white/5 border border-white/10'
              }`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Najpopularniejszy
                  </div>
                )}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-white">{plan.name}</p>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-500 mb-1">zł</span>
                  </div>
                  <p className="text-xs text-gray-600">jednorazowo · {plan.months} miesięcy</p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                      <Check size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full text-center py-3 rounded-xl bg-green-500/15 border border-green-500/20 text-green-400 text-sm font-medium">✓ Aktywny plan</div>
                ) : (
                  <button onClick={() => handleBuy(key)} disabled={loading === key}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                      isPopular ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30' : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}>
                    {loading === key
                      ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Przekierowanie...</span>
                      : `Kup za ${plan.price} zł`
                    }
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white text-center mb-8">Często zadawane pytania</h2>
          <div className="space-y-4">
            {[
              { q: 'Czy to jednorazowa opłata?', a: 'Tak. Płacisz raz i masz dostęp przez określony czas (12-24 miesiące). Żadnych ukrytych opłat.' },
              { q: 'Co się stanie po wygaśnięciu planu?', a: 'Twoja strona pozostanie widoczna, ale nie będziesz mógł edytować danych ani dodawać nowych gości. Możesz odnowić plan w dowolnym momencie.' },
              { q: 'Czy mogę zmienić plan?', a: 'Tak, możesz w każdej chwili kupić wyższy plan. Czas dostępu liczy się od nowego zakupu.' },
              { q: 'Jakie metody płatności są dostępne?', a: 'Karta kredytowa/debetowa (Visa, Mastercard). Płatności obsługuje Stripe — bezpieczny i szyfrowany.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="font-medium text-white text-sm mb-2">{q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PricingContent />
    </Suspense>
  )
}
