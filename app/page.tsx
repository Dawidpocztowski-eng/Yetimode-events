import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Heart, PartyPopper, Baby, Camera, Users, Star, ChevronRight, Sparkles } from 'lucide-react'

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0B0F19]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="YetiMode Events" className="h-8 w-auto object-contain" />
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 hidden sm:block">Cennik</Link>
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">Zaloguj się</Link>
          <Link href="/register"
            className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #146EF5, #22D3EE)' }}>
            Zacznij za darmo
          </Link>
        </div>
      </div>
    </nav>
  )
}

function MockBrowser({ title, emoji, date, location, countdown, gradient, className }: {
  title: string; emoji: string; date: string; location: string
  countdown: { d: number; h: number; m: number }
  gradient: string; className?: string
}) {
  return (
    <div className={`bg-[#101828] border border-white/10 rounded-2xl shadow-2xl w-60 overflow-hidden hover:scale-105 transition-transform duration-300 ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 text-[10px] text-gray-600 truncate">yetimode-events.pl/e/...</span>
      </div>
      <div className={`h-14 bg-gradient-to-r ${gradient} flex items-center justify-center`}>
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-white font-semibold text-sm text-center">{title}</p>
        <p className="text-gray-500 text-[11px] text-center">{date} · {location}</p>
        <div className="flex gap-1.5 justify-center">
          {[{ v: countdown.d, l: 'dni' }, { v: countdown.h, l: 'godz' }, { v: countdown.m, l: 'min' }].map(({ v, l }) => (
            <div key={l} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center min-w-[38px]">
              <div className="text-white font-bold text-sm">{v}</div>
              <div className="text-gray-600 text-[9px]">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const EVENT_TYPES = [
  { icon: Heart, label: 'Wesele', desc: 'Strona ślubna z RSVP, planem dnia, galerią i foto budką.', gradient: 'from-pink-600/20 to-rose-600/10', border: 'border-pink-500/20', iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10' },
  { icon: PartyPopper, label: 'Urodziny', desc: 'Zorganizuj niezapomniane urodziny z potwierdzeniami online.', gradient: 'from-[#146EF5]/20 to-[#22D3EE]/10', border: 'border-[#146EF5]/20', iconColor: 'text-[#22D3EE]', iconBg: 'bg-[#146EF5]/10' },
  { icon: Baby, label: 'Chrzciny', desc: 'Piękna strona z galerią i wspomnieniami od rodziny.', gradient: 'from-sky-600/20 to-cyan-600/10', border: 'border-sky-500/20', iconColor: 'text-sky-400', iconBg: 'bg-sky-500/10' },
]

const FEATURES = [
  { icon: Users, label: 'RSVP Online', desc: 'Goście potwierdzają obecność przez formularz — bez papierowych kart.' },
  { icon: Camera, label: 'Foto Budka', desc: 'Zdjęcia z ramkami trafiają prosto do galerii w chmurze.' },
  { icon: Star, label: 'Planer & Budżet', desc: 'Goście, stoliki, budżet — wszystko w jednym panelu.' },
  { icon: Sparkles, label: 'QR Kod', desc: 'Jeden skan i gość trafia na stronę z formularzem.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Nav />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden px-4">
        {/* Tło */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,110,245,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,110,245,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[160px] opacity-15 pointer-events-none" style={{ background: 'radial-gradient(ellipse, #146EF5, transparent)' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border text-xs font-medium px-4 py-1.5 rounded-full mb-8"
            style={{ borderColor: 'rgba(20,110,245,0.3)', background: 'rgba(20,110,245,0.1)', color: '#22D3EE' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
            Platforma wydarzeń online
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Planuj. Twórz.<br />
            <span style={{ background: 'linear-gradient(135deg, #146EF5, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Zapraszaj. Świętuj.
            </span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Stwórz piękną stronę wesela, urodzin lub chrzcin w kilka minut.
            RSVP, galeria, foto budka i planer — wszystko w jednym miejscu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/register"
              className="flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-2xl text-base"
              style={{ background: 'linear-gradient(135deg, #146EF5, #22D3EE)', boxShadow: '0 20px 60px rgba(20,110,245,0.3)' }}>
              Utwórz wydarzenie za darmo <ArrowRight size={18} />
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Zobacz cennik →
            </Link>
          </div>

          {/* Mock windows */}
          <div className="relative h-72 w-full max-w-3xl mx-auto hidden md:block">
            <MockBrowser title="Anna & Piotr 💍" emoji="💍" date="15·07·2027" location="Kraków"
              countdown={{ d: 412, h: 8, m: 33 }} gradient="from-pink-600/40 to-rose-600/40"
              className="absolute -rotate-3 left-0 top-4" />
            <MockBrowser title="Urodziny Marka 🎂" emoji="🎂" date="22·08·2027" location="Warszawa"
              countdown={{ d: 450, h: 14, m: 22 }} gradient="from-[#146EF5]/40 to-[#22D3EE]/40"
              className="absolute left-1/2 -translate-x-1/2 top-0 z-10" />
            <MockBrowser title="Chrzciny Zosi 🕊️" emoji="🕊️" date="10·09·2027" location="Gdańsk"
              countdown={{ d: 469, h: 6, m: 11 }} gradient="from-sky-600/40 to-cyan-600/40"
              className="absolute rotate-3 right-0 top-4" />
          </div>
        </div>
      </section>

      {/* TYPY */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: '#22D3EE' }}>Typy wydarzeń</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Na każdą okazję</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {EVENT_TYPES.map(({ icon: Icon, label, desc, gradient, border, iconColor, iconBg }) => (
              <div key={label} className={`bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-6 hover:scale-[1.02] transition-transform`}>
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{label}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>
                <Link href="/register" className={`inline-flex items-center gap-1 text-xs font-medium ${iconColor}`}>
                  Utwórz {label.toLowerCase()} <ChevronRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(20,110,245,0.03), transparent)' }} />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: '#22D3EE' }}>Funkcje</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Wszystko czego potrzebujesz</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 bg-[#101828] border border-white/10 rounded-2xl p-5 hover:border-[#146EF5]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(20,110,245,0.1)' }}>
                  <Icon size={20} style={{ color: '#22D3EE' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{label}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JAK TO DZIAŁA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: '#22D3EE' }}>Jak to działa</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Proste jak 1, 2, 3</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Utwórz wydarzenie', desc: 'Wybierz typ, wpisz datę i miejsce. Gotowe w 2 minuty.' },
              { num: '02', title: 'Zaproś gości', desc: 'Wyślij link lub QR kod. Goście potwierdzają online.' },
              { num: '03', title: 'Ciesz się chwilą', desc: 'Goście robią zdjęcia, Ty masz wszystko pod kontrolą.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center border"
                  style={{ background: 'rgba(20,110,245,0.1)', borderColor: 'rgba(20,110,245,0.3)' }}>
                  <span className="font-bold text-lg" style={{ color: '#22D3EE' }}>{num}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl p-12 overflow-hidden border"
            style={{ background: 'linear-gradient(135deg, rgba(20,110,245,0.15), rgba(34,211,238,0.05))', borderColor: 'rgba(20,110,245,0.3)' }}>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,110,245,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,110,245,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30" style={{ background: '#146EF5' }} />
            <div className="relative">
              <div className="text-4xl mb-4">🦁</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Gotowy na start?</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Dołącz do organizatorów, którzy tworzą niezapomniane wydarzenia z YetiMode Events.</p>
              <Link href="/register"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl transition-all"
                style={{ background: 'linear-gradient(135deg, #146EF5, #22D3EE)', boxShadow: '0 20px 60px rgba(20,110,245,0.3)' }}>
                Utwórz wydarzenie za darmo <ArrowRight size={18} />
              </Link>
              <p className="text-gray-600 text-xs mt-4">Bez karty kredytowej · Gotowe w 2 minuty</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 px-6" style={{ background: '#0B0F19' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="text-lg">🦁</span>
            <span>Yeti</span><span style={{ color: '#22D3EE' }}>Mode</span>
            <span className="text-xs text-gray-500 tracking-widest uppercase ml-1">Events</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <Link href="/pricing" className="hover:text-gray-400 transition-colors">Cennik</Link>
            <Link href="/login" className="hover:text-gray-400 transition-colors">Logowanie</Link>
            <Link href="/register" className="hover:text-gray-400 transition-colors">Rejestracja</Link>
            <span>© {new Date().getFullYear()} YetiMode Events</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
