import { useState } from 'react';
import type { BalanceChange } from '../content/balance.js';
import { extractDeltas } from '../content/balanceDeltas.js';

const CAT_COLORS: Record<string, { bg: string; fg: string }> = {
  nerf:   { bg: 'color-mix(in srgb,#e53935 18%,transparent)', fg: '#e53935' },
  buff:   { bg: 'color-mix(in srgb,#43a047 18%,transparent)', fg: '#43a047' },
  rework: { bg: 'color-mix(in srgb,#ff9800 18%,transparent)', fg: '#ff9800' },
  new:    { bg: 'color-mix(in srgb,#ff9800 18%,transparent)', fg: '#ff9800' },
};

const CONF_COLORS: Record<string, string> = {
  confirmed:   'var(--color-conf-confirmed)',
  datamine:    'var(--color-conf-datamine)',
  inferred:    'var(--color-conf-inferred)',
  speculation: 'var(--color-conf-speculation)',
};

function ConfBadge({ tier }: { tier: string }) {
  return (
    <span style={{ color: CONF_COLORS[tier] || '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {tier}
    </span>
  );
}

interface Props {
  changes: BalanceChange[];
}

export default function BalanceList({ changes }: Props) {
  const [views, setViews] = useState<Record<string, 'before' | 'after'>>({});

  return (
    <div>
      {changes.map(change => {
        // Separate delta lines from bullet lines
        const deltaRows: { delta: ReturnType<typeof extractDeltas>[number]; line: string }[] = [];
        const bulletLines: string[] = [];
        for (const line of change.details) {
          const d = extractDeltas([line]);
          if (d.length > 0) {
            deltaRows.push({ delta: d[0], line });
          } else {
            bulletLines.push(line);
          }
        }

        const hasDeltas = deltaRows.length > 0;
        const view: 'before' | 'after' = views[change.id] ?? 'after';
        const cat = CAT_COLORS[change.category] ?? CAT_COLORS.rework;

        return (
          <div key={change.id} className="card" style={{ marginBottom: '1rem' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                padding: '0.1em 0.5em',
                borderRadius: '3px',
                background: cat.bg,
                color: cat.fg,
              }}>
                {change.category}
              </span>
              <strong style={{ color: 'var(--color-gold-light)' }}>{change.subject}</strong>
              <ConfBadge tier={change.confidence} />
            </div>

            {/* Summary */}
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 0.5rem' }}>{change.summary}</p>

            {/* Before/After toggle + delta rows */}
            {hasDeltas && (
              <>
                <div className="balance-toggle">
                  {(['before', 'after'] as const).map(v => (
                    <button
                      key={v}
                      className={`pn-cat-btn${view === v ? ' active' : ''}`}
                      aria-pressed={view === v}
                      onClick={() => setViews(prev => ({ ...prev, [change.id]: v }))}
                    >
                      {v === 'before' ? 'Before' : 'After (current)'}
                    </button>
                  ))}
                </div>
                <div className="balance-deltas">
                  {deltaRows.map(({ delta }, i) => (
                    <div key={i} className={`balance-delta balance-delta--${view}`}>
                      {view === 'before' ? delta.before : delta.after}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Non-delta bullet lines */}
            {bulletLines.length > 0 && (
              <ul style={{ margin: '0', paddingLeft: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                {bulletLines.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}

            {/* Note */}
            {change.note && (
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--color-conf-datamine)' }}>
                ⚠ {change.note}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
