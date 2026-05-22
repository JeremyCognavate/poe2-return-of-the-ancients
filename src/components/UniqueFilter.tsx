import { useState, useMemo } from 'react';

interface UniqueItem {
  name: string;
  baseType: string;
  itemClass: string;
  reqLevel?: number;
  implicits: string[];
  explicits: string[];
  iconUrl?: string;
  confidence: string;
  note?: string;
  spiritWalkerSynergy?: boolean;
}

interface Props {
  items: UniqueItem[];
}

export default function UniqueFilter({ items }: Props) {
  const [query, setQuery] = useState('');
  const [activeClass, setActiveClass] = useState<string | null>(null);

  const itemClasses = useMemo(() => {
    const classes = [...new Set(items.map(i => i.itemClass).filter(Boolean))].sort();
    return classes;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(item => {
      if (activeClass && item.itemClass !== activeClass) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.baseType.toLowerCase().includes(q)
      );
    });
  }, [items, query, activeClass]);

  return (
    <div className="unique-filter">
      <div className="unique-filter-controls">
        <input
          className="patch-notes-search"
          type="search"
          placeholder="Search by name or base type…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search unique items"
        />
        <div className="patch-notes-categories" role="group" aria-label="Filter by item class">
          <button
            className={`pn-cat-btn${activeClass === null ? ' active' : ''}`}
            onClick={() => setActiveClass(null)}
          >
            All ({items.length})
          </button>
          {itemClasses.map(cls => {
            const count = items.filter(i => i.itemClass === cls).length;
            return (
              <button
                key={cls}
                className={`pn-cat-btn${activeClass === cls ? ' active' : ''}`}
                onClick={() => setActiveClass(activeClass === cls ? null : cls)}
              >
                {cls} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <p style={{ color: '#666', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
          No items matching &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="unique-grid">
        {filtered.map(item => (
          <div
            key={item.name}
            className="unique-wrap"
            tabIndex={0}
            data-tooltip-type="unique"
            data-tooltip-name={item.name}
            data-tooltip-base={item.baseType}
            data-tooltip-implicits={item.implicits.join('||')}
            data-tooltip-explicits={item.explicits.join('||')}
            data-tooltip-icon-url={item.iconUrl || ''}
            data-tooltip-req-level={item.reqLevel?.toString() || ''}
            data-tooltip-confidence={item.confidence}
            data-tooltip-note={item.note || ''}
          >
            <div className="unique-card">
              <div className="unique-card-icon">
                {item.iconUrl
                  ? <img src={item.iconUrl} alt={item.name} width={64} height={64} loading="lazy" style={{ objectFit: 'contain' }} />
                  : <div className="unique-card-icon-fallback">⬥</div>
                }
              </div>
              <div className="unique-card-meta">
                <div className="unique-card-name">{item.name}</div>
                <div className="unique-card-base">
                  {item.baseType}{item.itemClass && item.itemClass !== item.baseType ? ` · ${item.itemClass}` : ''}
                </div>
                <div className="unique-card-tags">
                  <span
                    style={{
                      color: item.confidence === 'confirmed' ? 'var(--color-conf-confirmed)' :
                             item.confidence === 'datamine'  ? 'var(--color-conf-datamine)'  :
                             item.confidence === 'inferred'  ? 'var(--color-conf-inferred)'  :
                             'var(--color-conf-speculation)',
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {item.confidence}
                  </span>
                  {item.spiritWalkerSynergy && (
                    <span className="badge badge-spirit">Spirit Walker</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
