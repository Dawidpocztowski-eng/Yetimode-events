export type EventType = 'wedding' | 'birthday' | 'christening' | 'other'

export interface Event {
  id: string
  user_id: string
  slug: string
  type: EventType
  title: string
  date: string
  time?: string
  venue_name?: string
  venue_city?: string
  description?: string
  cover_url?: string
  primary_color: string
  gallery_code: string
  is_published: boolean
  created_at: string
  // wesele
  partner1_name?: string
  partner2_name?: string
  church_name?: string
  church_time?: string
  // nowe
  visible_from?: string
  rsvp_deadline?: string
  visible_sections?: {
    countdown: boolean
    church: boolean
    venue: boolean
    description: boolean
    rsvp: boolean
    gallery: boolean
    photobooth: boolean
    schedule: boolean
  }
  schedule?: ScheduleItem[]
}

export interface ScheduleItem {
  id: string
  time: string
  title: string
  description?: string
  icon?: string
}

export interface Guest {
  id: string
  event_id: string
  name: string
  group_type: 'family' | 'friends' | 'vendors'
  confirmed: boolean
  companion_name?: string
  children: { id: string; name: string }[]
  notes?: string
  created_at: string
}

export interface BudgetItem {
  id: string
  event_id: string
  name: string
  category: string
  total_cost: number
  deposits: { id: string; amount: number; date: string; note: string; scan_url?: string }[]
  paid: boolean
  note?: string
  created_at: string
}

export interface TableItem {
  id: string
  event_id: string
  name: string
  shape: 'round' | 'rect'
  capacity: number
  seats: { id: string; guest_name: string }[]
  created_at: string
}

export interface RSVPEntry {
  id: string
  event_id: string
  first_name: string
  last_name: string
  attending: boolean
  guests_count: number
  accommodation: boolean
  transport: boolean
  dietary_needs?: string
  notes?: string
  created_at: string
}

export interface GalleryPhoto {
  id: string
  event_id: string
  storage_path: string
  url: string
  frame: string
  created_at: string
}
