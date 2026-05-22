// src/components/PatchNotesFilter.tsx
import { useState, useMemo } from 'react';

interface Entry {
  id: string;
  title: string;
  category: string;
  entries: string[];
}

interface Category {
  readonly id: string;
  readonly label: string;
}

interface Props {
  sections: Entry[];
  categories: readonly Category[];
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlight(text: string, query: string): string {
  if (!query) return escapeHtml(text);
  const safe = escapeHtml(text);
  const q = escapeRegex(escapeHtml(query));
  return safe.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>');
}

export default function PatchNotesFilter({ sections, categories }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return sections.filter(section => {
      const matchCat = activeCategory === null || section.category === activeCategory;
      if (!matchCat) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        section.title.toLowerCase().includes(q) ||
        section.entries.some(e => e.toLowerCase().includes(q))
      );
    });
  }, [sections, query, activeCategory]);

  return (
    <div className="patch-notes-filter">
      <div className="patch-notes-controls">
        <input
          className="patch-notes-search"
          type="search"
          placeholder="Search patch notes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search patch notes"
        />
        <div className="patch-notes-categories" role="group" aria-label="Filter by category">
          <button
            className={`pn-cat-btn${activeCategory === null ? ' active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`pn-cat-btn${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="patch-notes-results">
        {filtered.length === 0 && (
          <p className="patch-notes-empty">No results for &ldquo;{query}&rdquo;</p>
        )}
        {filtered.map(section => (
          <details key={section.id} className="pn-section" open={!!query}>
            <summary className="pn-section-title">{section.title}</summary>
            <ul className="pn-entries">
              {section.entries.map((entry, i) => (
                <li
                  key={i}
                  className="pn-entry"
                  dangerouslySetInnerHTML={{ __html: highlight(entry, query) }}
                />
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
