'use client'

import Link from 'next/link'
import { usePlan } from '@/lib/usePlan'
import { Zap, Star, Crown, ArrowRight, AlertCircle } from 'lucide-react'

const PLAN_CONFIG = {
  free:       { label: 'Free',       icon: null,  color: 'text-gray-400',   bg: 'bg-white/5',           border: 'border-white/10' },
  starter:    { label: 'Starter',    icon: Zap,   color: 'text-blue-400',   bg: 'bg-blue-500/10',       border: 'border-blue-500/20' },
  wydarzenie: { label: 'Wydarzenie', icon: Star,  color: 'text-violet-400', bg: 'bg-violet-500/10',     border: 'border-violet-500/20' },
  premium:    { label: 'Premium',    icon: Crown, color: 'text-amber-400',  bg: 'bg-amber-500/10',      border: 'border-amber-500/20' },
}

export default function PlanBanner() {
  const { plan, expiresAt, loading } = usePlan()
  if (loading) return null

  const cfg = PLAN_CONFIG[plan]
  const Icon = cfg.icon

  if (plan === 'free') {
    return (
      <div className="bg-gradient-to-r from-violet-600/15 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle size={18} className="text-violet-400 flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Masz plan Free</p>
            <p className="text-gray-500 text-xs">Kup plan aby opublikować stronę dla gości</p>
          </div>
        </div>
        <Link href="/pricing" className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
          Kup plan <ArrowRight size={13} />
        </Link>
      </div>
    )
  }

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className={`${cfg.color} flex-shrink-0`} />}
        <div>
          <p className="text-white text-sm font-medium">Plan <span className={cfg.color}>{cfg.label}</span></p>
          {expiresAt && <p className="text-gray-500 text-xs">Ważny do {new Date(expiresAt).toLocaleDateString('pl-PL')}</p>}
        </div>
      </div>
      {plan !== 'premium' && (
        <Link href="/pricing" className="flex-shrink-0 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          Upgrade <ArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}
