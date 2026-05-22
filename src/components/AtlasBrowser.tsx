import { useState, useMemo } from 'react';
import type { AtlasTreeGroup, AtlasTreeKind } from '../content/atlasNodes.js';

const KIND_LABELS: Record<AtlasTreeKind | 'all', string> = {
  all:    'All',
  core:   'Core',
  master: 'Masters',
  league: 'League Trees',
};

interface Props {
  groups: AtlasTreeGroup[];
}

export default function AtlasBrowser({ groups }: Props) {
  const [query, setQuery]   = useState('');
  const [kind,  setKind]    = useState<'all' | AtlasTreeKind>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: groups.length, core: 0, master: 0, league: 0 };
    for (const g of groups) c[g.kind] = (c[g.kind] ?? 0) + 1;
    return c;
  }, [groups]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return groups.filter(g => {
      if (kind !== 'all' && g.kind !== kind) return false;
      if (!q) return true;
      return g.name.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q);
    });
  }, [groups, query, kind]);

  return (
    <div className="atlas-browser">
      <div className="atlas-browser-controls">
        <input
          className="patch-notes-search"
          type="search"
          placeholder="Search Atlas systems…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search Atlas systems"
        />
        <div className="patch-notes-categories" role="group" aria-label="Filter by kind">
          {(['all', 'core', 'master', 'league'] as const).map(k => (
            <button
              key={k}
              className={`pn-cat-btn${kind === k ? ' active' : ''}`}
              onClick={() => setKind(kind === k && k !== 'all' ? 'all' : k)}
              aria-pressed={kind === k}
            >
              {KIND_LABELS[k]} ({counts[k] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p style={{ color: '#666', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
          No Atlas systems match.
        </p>
      )}

      <div className="atlas-browser-grid">
        {filtered.map(g => (
          <div
            key={g.id}
            className="card atlas-node"
            role="button"
            tabIndex={0}
            data-tooltip-type="node"
            data-tooltip-name={g.name}
            data-tooltip-stats={g.highlights.join('||')}
            data-tooltip-confidence={g.confidence}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.currentTarget as HTMLElement).click();
              }
            }}
          >
            <div className="atlas-node-head">
              <strong>{g.name}</strong>
              <span className={`atlas-kind atlas-kind--${g.kind}`}>{KIND_LABELS[g.kind]}</span>
            </div>
            <div className="atlas-node-scale">{g.scale}</div>
            <p className="atlas-node-summary">{g.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
