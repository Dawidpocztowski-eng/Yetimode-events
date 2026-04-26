'use client'

// Animowane tło SVG — cząsteczki, kształty geometryczne, dekoracje
export function ParticleBackground({ color = '#8b5cf6' }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Siatka */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Główny glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[160px] opacity-15 animate-pulse"
        style={{ backgroundColor: color }} />

      {/* SVG dekoracje */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="pg1" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pg2" cx="20%" cy="80%" r="40%">
            <stop offset="0%" stopColor={color} stopOpacity="0.06" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pg3" cx="80%" cy="20%" r="40%">
            <stop offset="0%" stopColor={color} stopOpacity="0.06" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glowy */}
        <ellipse cx="50%" cy="40%" rx="700" ry="500" fill="url(#pg1)" />
        <ellipse cx="20%" cy="80%" rx="400" ry="300" fill="url(#pg2)" />
        <ellipse cx="80%" cy="20%" rx="400" ry="300" fill="url(#pg3)" />

        {/* Okręgi dekoracyjne */}
        <circle cx="10%" cy="20%" r="120" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />
        <circle cx="10%" cy="20%" r="80" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" />
        <circle cx="90%" cy="75%" r="150" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.12" />
        <circle cx="90%" cy="75%" r="100" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.08" />
        <circle cx="50%" cy="90%" r="200" fill="none" stroke={color} strokeWidth="0.3" strokeOpacity="0.06" />

        {/* Linie diagonalne */}
        <line x1="-5%" y1="60%" x2="30%" y2="10%" stroke={color} strokeWidth="0.5" strokeOpacity="0.08" />
        <line x1="70%" y1="0%" x2="105%" y2="50%" stroke={color} strokeWidth="0.5" strokeOpacity="0.08" />
        <line x1="0%" y1="100%" x2="50%" y2="40%" stroke={color} strokeWidth="0.3" strokeOpacity="0.05" />

        {/* Małe kwadraty / diamenty */}
        <rect x="15%" y="15%" width="8" height="8" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.2" transform="rotate(45 15% 15%)" />
        <rect x="82%" y="30%" width="6" height="6" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.15" transform="rotate(45 82% 30%)" />
        <rect x="5%" y="70%" width="10" height="10" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.15" transform="rotate(45 5% 70%)" />
        <rect x="92%" y="60%" width="7" height="7" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.2" transform="rotate(45 92% 60%)" />
        <rect x="45%" y="5%" width="5" height="5" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.15" transform="rotate(45 45% 5%)" />

        {/* Kropki */}
        <circle cx="25%" cy="8%" r="2" fill={color} fillOpacity="0.2" />
        <circle cx="75%" cy="12%" r="1.5" fill={color} fillOpacity="0.15" />
        <circle cx="8%" cy="45%" r="2.5" fill={color} fillOpacity="0.15" />
        <circle cx="95%" cy="40%" r="2" fill={color} fillOpacity="0.2" />
        <circle cx="60%" cy="95%" r="2" fill={color} fillOpacity="0.15" />
        <circle cx="35%" cy="88%" r="1.5" fill={color} fillOpacity="0.1" />
        <circle cx="88%" cy="88%" r="3" fill={color} fillOpacity="0.1" />
        <circle cx="12%" cy="92%" r="1.5" fill={color} fillOpacity="0.12" />

        {/* Trójkąty */}
        <polygon points="85%,5% 87%,10% 83%,10%" fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.15" />
        <polygon points="3%,35% 5%,40% 1%,40%" fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.12" />
      </svg>
    </div>
  )
}

// Tło weselne z sercami i kwiatami
export function WeddingBackground({ color = '#ec4899' }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full blur-[180px] opacity-12"
        style={{ backgroundColor: color }} />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-8"
        style={{ backgroundColor: '#8b5cf6' }} />

      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="wg1" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50%" cy="50%" rx="800" ry="500" fill="url(#wg1)" />

        {/* Serca SVG */}
        <g opacity="0.12" fill={color}>
          {/* Serce lewy górny */}
          <path d="M 80 60 C 80 55, 73 48, 65 55 C 57 48, 50 55, 50 60 C 50 70, 65 80, 65 80 C 65 80, 80 70, 80 60 Z" transform="scale(0.6) translate(100, 80)" />
          {/* Serce prawy górny */}
          <path d="M 80 60 C 80 55, 73 48, 65 55 C 57 48, 50 55, 50 60 C 50 70, 65 80, 65 80 C 65 80, 80 70, 80 60 Z" transform="scale(0.4) translate(1800, 120)" />
          {/* Serce lewy dolny */}
          <path d="M 80 60 C 80 55, 73 48, 65 55 C 57 48, 50 55, 50 60 C 50 70, 65 80, 65 80 C 65 80, 80 70, 80 60 Z" transform="scale(0.5) translate(80, 1400)" />
          {/* Serce prawy dolny */}
          <path d="M 80 60 C 80 55, 73 48, 65 55 C 57 48, 50 55, 50 60 C 50 70, 65 80, 65 80 C 65 80, 80 70, 80 60 Z" transform="scale(0.7) translate(1600, 1200)" />
        </g>

        {/* Obrączki */}
        <circle cx="8%" cy="30%" r="25" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.12" />
        <circle cx="8%" cy="30%" r="18" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.08" />
        <circle cx="93%" cy="65%" r="30" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.1" />
        <circle cx="93%" cy="65%" r="22" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.07" />

        {/* Kwiaty (uproszczone) */}
        <g opacity="0.1" stroke={color} strokeWidth="1" fill="none">
          <circle cx="20%" cy="85%" r="12" />
          <circle cx="20%" cy="73%" r="12" />
          <circle cx="14%" cy="79%" r="12" />
          <circle cx="26%" cy="79%" r="12" />
          <circle cx="20%" cy="79%" r="6" fill={color} fillOpacity="0.15" />
        </g>
        <g opacity="0.08" stroke={color} strokeWidth="1" fill="none">
          <circle cx="78%" cy="10%" r="10" />
          <circle cx="78%" cy="0%" r="10" />
          <circle cx="73%" cy="5%" r="10" />
          <circle cx="83%" cy="5%" r="10" />
          <circle cx="78%" cy="5%" r="5" fill={color} fillOpacity="0.12" />
        </g>

        {/* Linie eleganckie */}
        <line x1="0%" y1="50%" x2="15%" y2="50%" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" />
        <line x1="85%" y1="50%" x2="100%" y2="50%" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" />

        {/* Diamenty */}
        <rect x="48%" y="2%" width="10" height="10" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.2" transform="rotate(45, 48%, 2%)" />
        <rect x="3%" y="55%" width="8" height="8" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.15" transform="rotate(45, 3%, 55%)" />
        <rect x="94%" y="20%" width="8" height="8" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.15" transform="rotate(45, 94%, 20%)" />

        {/* Gwiazdki / iskry */}
        <g fill={color} fillOpacity="0.2">
          <polygon points="5%,10% 5.3%,11% 6%,11% 5.5%,11.5% 5.7%,12.5% 5%,12% 4.3%,12.5% 4.5%,11.5% 4%,11% 4.7%,11%" />
          <polygon points="92%,80% 92.3%,81% 93%,81% 92.5%,81.5% 92.7%,82.5% 92%,82% 91.3%,82.5% 91.5%,81.5% 91%,81% 91.7%,81%" />
          <polygon points="50%,96% 50.2%,97% 50.8%,97% 50.4%,97.4% 50.6%,98.2% 50%,97.8% 49.4%,98.2% 49.6%,97.4% 49.2%,97% 49.8%,97%" />
        </g>
      </svg>
    </div>
  )
}

// Tło dla landing page — tech/dark
export function TechBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glowy */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-600/8 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-indigo-600/6 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-pink-600/5 rounded-full blur-[120px]" />

      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="tg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tg2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Duże trójkąty */}
        <polygon points="0,0 400,0 0,400" fill="url(#tg1)" />
        <polygon points="1000,1000 1000,400 600,1000" fill="url(#tg2)" />

        {/* Hexagony */}
        <polygon points="150,80 170,68 190,80 190,104 170,116 150,104" fill="none" stroke="#8b5cf6" strokeWidth="0.8" strokeOpacity="0.12" />
        <polygon points="155,83 170,74 185,83 185,101 170,110 155,101" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.08" />

        {/* Hexagon prawy */}
        <g transform="translate(1200, 500)">
          <polygon points="-40,-23 0,-46 40,-23 40,23 0,46 -40,23" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.1" />
          <polygon points="-28,-16 0,-32 28,-16 28,16 0,32 -28,16" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.07" />
        </g>

        {/* Linie połączeń (jak sieć) */}
        <line x1="150" y1="150" x2="350" y2="250" stroke="#8b5cf6" strokeWidth="0.4" strokeOpacity="0.1" />
        <line x1="350" y1="250" x2="550" y2="150" stroke="#8b5cf6" strokeWidth="0.4" strokeOpacity="0.1" />
        <line x1="550" y1="150" x2="750" y2="300" stroke="#8b5cf6" strokeWidth="0.4" strokeOpacity="0.08" />
        <line x1="750" y1="300" x2="900" y2="200" stroke="#8b5cf6" strokeWidth="0.4" strokeOpacity="0.08" />
        <line x1="100" y1="700" x2="300" y2="800" stroke="#6366f1" strokeWidth="0.4" strokeOpacity="0.08" />
        <line x1="300" y1="800" x2="500" y2="700" stroke="#6366f1" strokeWidth="0.4" strokeOpacity="0.08" />
        <line x1="500" y1="700" x2="700" y2="850" stroke="#6366f1" strokeWidth="0.4" strokeOpacity="0.06" />

        {/* Węzły sieci */}
        <circle cx="150" cy="150" r="3" fill="#8b5cf6" fillOpacity="0.2" />
        <circle cx="350" cy="250" r="2" fill="#8b5cf6" fillOpacity="0.15" />
        <circle cx="550" cy="150" r="3" fill="#8b5cf6" fillOpacity="0.18" />
        <circle cx="750" cy="300" r="2" fill="#8b5cf6" fillOpacity="0.12" />
        <circle cx="900" cy="200" r="2.5" fill="#8b5cf6" fillOpacity="0.15" />
        <circle cx="100" cy="700" r="2" fill="#6366f1" fillOpacity="0.15" />
        <circle cx="300" cy="800" r="3" fill="#6366f1" fillOpacity="0.12" />
        <circle cx="500" cy="700" r="2" fill="#6366f1" fillOpacity="0.15" />
        <circle cx="700" cy="850" r="2.5" fill="#6366f1" fillOpacity="0.1" />

        {/* Okręgi koncentryczne */}
        <circle cx="50" cy="500" r="60" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="4 8" />
        <circle cx="50" cy="500" r="40" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.06" strokeDasharray="4 8" />
        <circle cx="950" cy="500" r="80" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.07" strokeDasharray="4 8" />

        {/* Małe kwadraty */}
        <rect x="390" y="25" width="8" height="8" fill="none" stroke="#8b5cf6" strokeWidth="0.8" strokeOpacity="0.15" transform="rotate(45 394 29)" />
        <rect x="590" y="910" width="8" height="8" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.12" transform="rotate(45 594 914)" />
        <rect x="18" y="240" width="6" height="6" fill="none" stroke="#8b5cf6" strokeWidth="0.8" strokeOpacity="0.12" transform="rotate(45 21 243)" />
        <rect x="960" y="740" width="6" height="6" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.12" transform="rotate(45 963 743)" />
      </svg>
    </div>
  )
}
