import { useEffect, useState } from 'react';

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'league', label: 'Runes of Aldur' },
  { id: 'kalguuran-skills', label: 'Kalguuran Skills' },
  { id: 'spirit-walker', label: 'Spirit Walker' },
  { id: 'shaman', label: 'Shaman' },
  { id: 'endgame', label: 'Endgame' },
  { id: 'ocean-expedition', label: '↳ Ocean Expedition' },
  { id: 'delirium', label: '↳ Delirium' },
  { id: 'breach', label: '↳ Breach' },
  { id: 'ritual', label: '↳ Ritual' },
  { id: 'abyss', label: '↳ Abyss' },
  { id: 'atlas', label: '↳ Atlas Tree' },
  { id: 'uniques', label: 'Unique Items' },
  { id: 'balance', label: 'Balance & Reworks' },
  { id: 'qol', label: 'QoL Features' },
  { id: 'patch-notes', label: 'Patch Notes' },
];

export default function Sidebar() {
  const [activeId, setActiveId] = useState('overview');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="mobile-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
        style={{
          display: 'none',
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 60,
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border-gold)',
          borderRadius: '4px',
          padding: '0.5rem',
          cursor: 'pointer',
          color: 'var(--color-gold-primary)',
        }}
      >
        ☰
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
          }}
        />
      )}

      {/* Nav content */}
      <nav style={{ padding: '1.5rem 0' }}>
        {/* Logo */}
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <img
            src="/images/Blood of Mages Logo.png"
            alt="Blood of Mages"
            style={{ width: '100%', maxWidth: '200px', height: 'auto' }}
          />
          <div style={{
            marginTop: '0.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            PoE2 0.5.0 Reference
          </div>
        </div>

        {/* Nav links */}
        <ul style={{ listStyle: 'none', padding: '1rem 0', margin: 0 }}>
          {NAV_ITEMS.map(({ id, label }) => {
            const isActive = activeId === id;
            const isNested = label.startsWith('↳');
            return (
              <li key={id}>
                <button
                  onClick={() => handleNavClick(id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: `0.35rem ${isNested ? '2rem' : '1.25rem'}`,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: isNested ? '0.85rem' : '0.95rem',
                    color: isActive ? 'var(--color-gold-primary)' : isNested ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                    borderLeft: isActive ? '2px solid var(--color-gold-primary)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {isNested ? label.slice(2) : label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Confidence legend */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--color-border)',
          marginTop: 'auto',
        }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Confidence
          </div>
          {(['confirmed', 'datamine', 'inferred', 'speculation'] as const).map((tier) => (
            <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span className={`badge badge-${tier}`}>{tier}</span>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
