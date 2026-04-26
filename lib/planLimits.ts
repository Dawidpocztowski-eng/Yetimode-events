export const PLAN_LIMITS = {
  free: {
    maxEvents: 0,        // nie może publikować
    maxPhotos: 0,
    photobooth: false,
    branding: true,      // pokazuje "Stworzone w YetiMode"
    csvExport: false,
    zipExport: false,
  },
  starter: {
    maxEvents: 1,
    maxPhotos: 100,
    photobooth: false,
    branding: true,
    csvExport: false,
    zipExport: false,
  },
  wydarzenie: {
    maxEvents: 1,
    maxPhotos: 500,
    photobooth: true,
    branding: false,     // bez brandingu
    csvExport: true,
    zipExport: false,
  },
  premium: {
    maxEvents: 3,
    maxPhotos: 99999,    // nielimitowane
    photobooth: true,
    branding: false,
    csvExport: true,
    zipExport: true,
  },
} as const

export type PlanName = keyof typeof PLAN_LIMITS

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanName] ?? PLAN_LIMITS.free
}
