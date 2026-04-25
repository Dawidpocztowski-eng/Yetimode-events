'use client'

import { useEffect, useState } from 'react'

export type PlanName = 'free' | 'starter' | 'wydarzenie' | 'premium'

export function usePlan() {
  const [plan, setPlan] = useState<PlanName>('free')
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stripe/plan')
      .then(r => r.json())
      .then(data => {
        setPlan(data.plan || 'free')
        setExpiresAt(data.expires_at || null)
      })
      .finally(() => setLoading(false))
  }, [])

  const canPublish = plan !== 'free'
  const hasPhotobooth = plan === 'wydarzenie' || plan === 'premium'
  const hasUnlimitedGallery = plan === 'premium'
  const maxEvents = plan === 'premium' ? 3 : plan === 'free' ? 0 : 1

  return { plan, expiresAt, loading, canPublish, hasPhotobooth, hasUnlimitedGallery, maxEvents }
}
