import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    months: 12,
    features: [
      'Publiczna strona wydarzenia',
      'Formularz RSVP',
      'Galeria do 100 zdjęć',
      'QR kod',
      'Plan dnia',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  wydarzenie: {
    name: 'Wydarzenie',
    price: 99,
    priceId: process.env.STRIPE_PRICE_WYDARZENIE!,
    months: 18,
    features: [
      'Wszystko ze Starter',
      'Foto Budka z galerią w chmurze',
      'Galeria do 500 zdjęć',
      'Bez brandingu YetiMode',
      'Eksport gości CSV',
    ],
    color: 'from-violet-500 to-indigo-500',
    popular: true,
  },
  premium: {
    name: 'Premium',
    price: 179,
    priceId: process.env.STRIPE_PRICE_PREMIUM!,
    months: 24,
    features: [
      'Wszystko z Wydarzenie',
      'Do 3 wydarzeń',
      'Nielimitowana galeria',
      'Własna domena',
      'Eksport ZIP galerii',
      'Priorytetowe wsparcie',
    ],
    color: 'from-amber-500 to-orange-500',
  },
} as const

export type PlanKey = keyof typeof PLANS
