import { useState } from 'react';
import type { WhatsNewEntry } from '../content/whatsnew';

interface Props {
  entries: WhatsNewEntry[];
}

export default function WhatsNew({ entries }: Props) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const badge = entries.filter(e => e.date >= sevenDaysAgo).length;

  // Group by date descending
  const byDate = new Map<string, WhatsNewEntry[]>();
  for (const e of entries) {
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date)!.push(e);
  }
  const sortedDates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div className="whatsnew card">
      <button
        className="whatsnew-toggle pn-cat-btn"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        What's New
        {badge > 0 && <span className="whatsnew-badge">{badge}</span>}
        <span className="whatsnew-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="whatsnew-list">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="whatsnew-date">{date}</div>
              {byDate.get(date)!.map((e, i) => (
                <div key={i} className="whatsnew-entry">
                  {e.kind === 'teaser' ? (
                    <div className="whatsnew-teaser">
                      {e.thumbnail && (
                        <img src={e.thumbnail} alt="" className="whatsnew-thumb" loading="lazy" />
                      )}
                      <div className="whatsnew-teaser-body">
                        <a href={e.url} target="_blank" rel="noopener" className="whatsnew-teaser-title">
                          {e.label}
                        </a>
                        {e.channel && <div className="whatsnew-teaser-channel">{e.channel}</div>}
                        {e.summary && <p className="whatsnew-teaser-summary">{e.summary}</p>}
                      </div>
                    </div>
                  ) : e.kind === 'added' ? (
                    <span>
                      <span className="whatsnew-kind whatsnew-kind--added">new</span>
                      {' '}{e.dataset}: <strong style={{ color: 'var(--color-gold-light)' }}>{e.label}</strong>
                    </span>
                  ) : (
                    <span>
                      <span className="whatsnew-kind whatsnew-kind--changed">updated</span>
                      {' '}<strong style={{ color: 'var(--color-gold-light)' }}>{e.label}</strong>
                      {e.fields && e.fields.length > 0 && (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}> ({e.fields.join(', ')})</span>
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
