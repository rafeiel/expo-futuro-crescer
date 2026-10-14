import { useEffect, useState } from 'react';

interface Drop {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  kind: 'drop' | 'leaf';
}

// Fundo animado leve: gotas, folhas, turbinas eólicas e skyline — tema Cidade do Amanhã
const CityBackground = () => {
  const [items, setItems] = useState<Drop[]>([]);

  useEffect(() => {
    setItems(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 85,
        size: Math.random() * 10 + 10,
        duration: Math.random() * 3 + 4,
        delay: Math.random() * 3,
        kind: i % 2 === 0 ? 'drop' : 'leaf',
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Brilho de sol */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Gotas e folhas flutuando */}
      {items.map(item => (
        <div
          key={item.id}
          className="absolute animate-float opacity-30"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.kind === 'drop' ? (
            <svg width={item.size} height={item.size * 1.3} viewBox="0 0 20 26">
              <path d="M10 0 C10 0 0 12 0 17 a10 9 0 0 0 20 0 C20 12 10 0 10 0Z" fill="#7FD8F2" />
            </svg>
          ) : (
            <svg width={item.size * 1.2} height={item.size} viewBox="0 0 24 20">
              <path d="M2 18 C2 6 12 0 22 2 C22 12 14 20 2 18Z" fill="#4ADE80" />
              <path d="M2 18 L16 7" stroke="#14532d" strokeWidth="1.2" />
            </svg>
          )}
        </div>
      ))}

      {/* Turbinas eólicas */}
      {[
        { right: '6%', h: 150, d: '6s' },
        { right: '16%', h: 110, d: '8s' },
      ].map((t, i) => (
        <div key={i} className="absolute bottom-0 opacity-25" style={{ right: t.right }}>
          <svg width="80" height={t.h + 40} viewBox={`0 0 80 ${t.h + 40}`}>
            <path d={`M38 40 L36 ${t.h + 40} L44 ${t.h + 40} L42 40Z`} fill="#e2e8f0" />
            <g style={{ transformOrigin: '40px 40px', animation: `spin ${t.d} linear infinite` }}>
              <path d="M40 40 L37 6 Q40 2 43 6Z" fill="#e2e8f0" />
              <path d="M40 40 L37 6 Q40 2 43 6Z" fill="#e2e8f0" transform="rotate(120 40 40)" />
              <path d="M40 40 L37 6 Q40 2 43 6Z" fill="#e2e8f0" transform="rotate(240 40 40)" />
            </g>
            <circle cx="40" cy="40" r="4" fill="#cbd5e1" />
          </svg>
        </div>
      ))}

      {/* Skyline */}
      <svg
        className="absolute bottom-0 left-0 w-full h-40 opacity-20"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
      >
        <path
          d="M0 160 V110 H60 V70 H110 V95 H150 V50 H200 V90 H240 V30 H290 V80 H340 V100 H390 V60 H430 V85 H480 V40 H520 V95 H580 V75 H630 V110 H680 V55 H730 V90 H780 V35 H830 V80 H880 V100 H930 V65 H980 V95 H1040 V50 H1090 V100 H1140 V80 H1200 V160 Z"
          fill="#0ea5e9"
        />
      </svg>
    </div>
  );
};

export default CityBackground;
