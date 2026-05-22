import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipData {
  type: string;
  name: string;
  base: string;
  implicits: string[];
  explicits: string[];
  iconUrl: string;
  reqLevel: string;
  stats: string[];
  tags: string;
  cost: string;
  description: string;
  confidence: string;
  note: string;
}

function readData(el: Element): TooltipData | null {
  const type = el.getAttribute('data-tooltip-type');
  if (!type) return null;
  const split = (attr: string) =>
    (el.getAttribute(attr) || '').split('||').filter(Boolean);
  return {
    type,
    name:        el.getAttribute('data-tooltip-name') || '',
    base:        el.getAttribute('data-tooltip-base') || '',
    implicits:   split('data-tooltip-implicits'),
    explicits:   split('data-tooltip-explicits'),
    iconUrl:     el.getAttribute('data-tooltip-icon-url') || '',
    reqLevel:    el.getAttribute('data-tooltip-req-level') || '',
    stats:       split('data-tooltip-stats'),
    tags:        el.getAttribute('data-tooltip-tags') || '',
    cost:        el.getAttribute('data-tooltip-cost') || '',
    description: el.getAttribute('data-tooltip-description') || '',
    confidence:  el.getAttribute('data-tooltip-confidence') || '',
    note:        el.getAttribute('data-tooltip-note') || '',
  };
}

interface Pos { top: number; left: number; flipX: boolean; flipY: boolean; }

function computePos(trigger: Element, tooltipW = 380, tooltipH = 420): Pos {
  const r = trigger.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const flipX = r.right + tooltipW + 12 > vw;
  const rawTop = r.top;
  const flipY = rawTop + tooltipH > vh && r.top > tooltipH;
  return {
    left: flipX ? r.left - tooltipW - 12 : r.right + 12,
    top:  flipY ? r.bottom - tooltipH    : rawTop,
    flipX,
    flipY,
  };
}

function ConfBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    confirmed:   'var(--color-conf-confirmed)',
    datamine:    'var(--color-conf-datamine)',
    inferred:    'var(--color-conf-inferred)',
    speculation: 'var(--color-conf-speculation)',
  };
  return (
    <span style={{ color: colors[tier] || '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {tier}
    </span>
  );
}

function TooltipContent({ data }: { data: TooltipData }) {
  if (data.type === 'unique') {
    return (
      <>
        <div className="ut-header">
          <div className="ut-name">{data.name}</div>
          <div className="ut-base">{data.base}</div>
        </div>
        {data.iconUrl && (
          <div className="ut-icon-wrap">
            <img src={data.iconUrl} alt="" width={96} height={96} className="ut-icon" loading="lazy" />
          </div>
        )}
        <div className="ut-body">
          {data.reqLevel && (
            <>
              <div className="ut-req">Requires: <span className="ut-req-val">Level {data.reqLevel}</span></div>
              <div className="ut-sep" />
            </>
          )}
          {data.implicits.length > 0 && (
            <>
              <div className="ut-mods ut-mods-implicit">
                {data.implicits.map((m, i) => <div key={i}>{m}</div>)}
              </div>
              <div className="ut-sep" />
            </>
          )}
          {data.explicits.length > 0 && (
            <div className="ut-mods ut-mods-explicit">
              {data.explicits.map((m, i) => <div key={i}>{m}</div>)}
            </div>
          )}
          {data.note && (
            <>
              <div className="ut-sep" />
              <div className="ut-note">⚠ {data.note}</div>
            </>
          )}
          <div className="ut-sep" />
          <ConfBadge tier={data.confidence} />
        </div>
      </>
    );
  }

  if (data.type === 'skill') {
    return (
      <div className="ptt-generic">
        <div className="ptt-title">{data.name}</div>
        {data.tags && <div className="ptt-tags">{data.tags}</div>}
        {data.cost && <div className="ptt-cost">Cost: {data.cost}</div>}
        {data.description && <p className="ptt-desc">{data.description}</p>}
        {data.stats.length > 0 && (
          <ul className="ptt-stats">
            {data.stats.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        )}
        <ConfBadge tier={data.confidence} />
      </div>
    );
  }

  if (data.type === 'rune') {
    return (
      <div className="ptt-generic">
        <div className="ptt-title">{data.name}</div>
        {data.stats.length > 0 && (
          <ul className="ptt-stats">
            {data.stats.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        )}
        <ConfBadge tier={data.confidence} />
      </div>
    );
  }

  // node (ascendancy node)
  return (
    <div className="ptt-generic">
      <div className="ptt-title">{data.name}</div>
      {data.stats.length > 0 && (
        <ul className="ptt-stats">
          {data.stats.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
      {data.note && <div className="ptt-note">⚠ {data.note}</div>}
      <ConfBadge tier={data.confidence} />
    </div>
  );
}

export default function TooltipPortal() {
  const [data, setData] = useState<TooltipData | null>(null);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, flipX: false, flipY: false });
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef<Element | null>(null);

  const findTrigger = (el: EventTarget | null): Element | null => {
    if (!(el instanceof Element)) return null;
    return el.closest('[data-tooltip-type]');
  };

  const handleMouseEnter = useCallback((e: MouseEvent) => {
    if (pinned) return;
    const trigger = findTrigger(e.target);
    if (!trigger) return;
    const d = readData(trigger);
    if (!d) return;
    triggerRef.current = trigger;
    setData(d);
    setPos(computePos(trigger));
  }, [pinned]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (pinned) return;
    const trigger = findTrigger(e.target);
    if (!trigger) return;
    setData(null);
    triggerRef.current = null;
  }, [pinned]);

  const handleClick = useCallback((e: MouseEvent) => {
    const trigger = findTrigger(e.target);
    if (trigger) {
      e.stopPropagation();
      const d = readData(trigger);
      if (!d) return;
      if (pinned && triggerRef.current === trigger) {
        setPinned(false);
        setData(null);
        triggerRef.current = null;
      } else {
        triggerRef.current = trigger;
        setData(d);
        setPos(computePos(trigger));
        setPinned(true);
      }
    } else {
      if (pinned) {
        setPinned(false);
        setData(null);
        triggerRef.current = null;
      }
    }
  }, [pinned]);

  useEffect(() => {
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      document.removeEventListener('click', handleClick);
    };
  }, [handleMouseEnter, handleMouseLeave, handleClick]);

  if (!data) return null;

  const tooltip = (
    <div
      className={`poe-tooltip${pinned ? ' poe-tooltip--pinned' : ''}${data.type === 'unique' ? ' poe-tooltip--unique' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      role="tooltip"
    >
      <TooltipContent data={data} />
      {pinned && (
        <button
          className="ptt-close"
          onClick={e => { e.stopPropagation(); setPinned(false); setData(null); triggerRef.current = null; }}
          aria-label="Close tooltip"
        >✕</button>
      )}
    </div>
  );

  return createPortal(tooltip, document.body);
}
