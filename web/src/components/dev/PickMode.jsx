import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { ArrowUp, Check, Copy, MousePointerClick, Pencil, Trash2, X } from 'lucide-react';
import './pick.css';

/**
 * Review tool, built ONLY into `npm run build:artifact` (and `npm run dev`). Not in the public build.
 * Click any element to describe it; add a note ("delete this", "change to …"); copy the list as a
 * message and paste it to Claude. Each entry carries the page, section, visible text and a selector,
 * which is enough to find the exact line in `src/`.
 */

const UI = '[data-pick-ui]';
const ACTIONS = ['Delete', 'Change text', 'Restyle', 'Move', 'Other'];

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function selectorFor(el) {
  const parts = [];
  let node = el;
  while (node && node.nodeType === 1 && node.id !== 'main' && node !== document.body && parts.length < 6) {
    let part = node.tagName.toLowerCase();
    const cls = [...node.classList].find((c) => !c.startsWith('is-') && !c.startsWith('reveal'));
    if (cls) part += `.${cls}`;
    const same = node.parentElement ? [...node.parentElement.children].filter((c) => c.tagName === node.tagName) : [];
    if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`;
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

function sectionOf(el) {
  // Page-level landmarks only (not <article>: a card's own heading would shadow the section it sits in).
  const section = el.closest('section, header, footer, nav, form');
  if (!section) return '';
  const label = section.getAttribute('aria-label');
  if (label) return label;
  const labelled = section.getAttribute('aria-labelledby');
  const byId = labelled && document.getElementById(labelled.split(' ')[0]);
  const heading = byId || section.querySelector('h1, h2, h3');
  return clean(heading?.textContent);
}

function describe(el, route) {
  const tag = el.tagName.toLowerCase();
  const text = clean(el.getAttribute('aria-label') || el.getAttribute('alt') || el.innerText || el.textContent);
  return { route, section: sectionOf(el), tag, text: clip(text, 120), selector: selectorFor(el) };
}

function buildMessage(items) {
  if (!items.length) return '';
  const lines = [`Changes for the site (${items.length}):`, ''];
  items.forEach((item, i) => {
    const { info } = item;
    lines.push(`${i + 1}. ${item.action.toUpperCase()}${item.note ? ` — ${item.note}` : ''}`);
    lines.push(`   Page: ${info.route}${info.section ? ` · Section: "${info.section}"` : ''}`);
    lines.push(`   Element: <${info.tag}>${info.text ? ` "${info.text}"` : ''}`);
    lines.push(`   Selector: ${info.selector}`);
    lines.push('');
  });
  return lines.join('\n').trimEnd();
}

const toRect = (el) => {
  if (!el || !el.isConnected) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

export default function PickMode() {
  const { pathname, hash } = useLocation();
  const route = `${pathname}${hash}`;
  const [active, setActive] = useState(false);
  const [hoverEl, setHoverEl] = useState(null);
  const [current, setCurrent] = useState(null);
  const [items, setItems] = useState([]);
  const [action, setAction] = useState('Delete');
  const [note, setNote] = useState('');
  const [rects, setRects] = useState({ hover: null, current: null, marks: [] });
  const [copied, setCopied] = useState(false);
  const routeRef = useRef(route);
  routeRef.current = route;
  const textRef = useRef(null);

  const message = useMemo(() => buildMessage(items), [items]);

  const measure = useCallback(() => {
    setRects({
      hover: toRect(hoverEl),
      current: toRect(current?.el),
      marks: items.map((item) => toRect(item.el)),
    });
  }, [hoverEl, current, items]);

  // Keep outlines glued to their elements while the page scrolls or resizes.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    tick();
    window.addEventListener('scroll', tick, true);
    window.addEventListener('resize', tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', tick, true);
      window.removeEventListener('resize', tick);
    };
  }, [measure, route]);

  // Pick mode: hover highlights, click selects instead of acting.
  useEffect(() => {
    if (!active) {
      setHoverEl(null);
      return undefined;
    }
    const onOver = (e) => setHoverEl(e.target.closest?.(UI) ? null : e.target);
    const onClick = (e) => {
      if (e.target.closest?.(UI)) return;
      e.preventDefault();
      e.stopPropagation();
      const target = e.target.closest('a, button') || e.target; // a button's label means the button
      setCurrent({ el: target, info: describe(target, routeRef.current) });
      setCopied(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(false);
    };
    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('pick-active');
    return () => {
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('pick-active');
    };
  }, [active]);

  const parent = () => {
    const up = current?.el.parentElement;
    if (!up || up.id === 'main' || up === document.body || up.closest?.(UI)) return;
    setCurrent({ el: up, info: describe(up, routeRef.current) });
  };

  const add = () => {
    if (!current) return;
    setItems((list) => [...list, { id: Date.now() + list.length, el: current.el, info: current.info, action, note: clean(note) }]);
    setCurrent(null);
    setNote('');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      textRef.current?.focus();
      textRef.current?.select();
      setCopied(false);
    }
  };

  if (!active && items.length === 0) {
    return (
      <div data-pick-ui className="pick-root">
        <button type="button" className="pick-fab" onClick={() => setActive(true)}>
          <Pencil size={16} aria-hidden="true" /> Edit mode
        </button>
      </div>
    );
  }

  return (
    <div data-pick-ui className="pick-root">
      <div className="pick-overlay" aria-hidden="true">
        {active && rects.hover && !current && <div className="pick-box pick-box--hover" style={rects.hover} />}
        {items.map((item, i) => {
          const r = rects.marks[i];
          return r ? (
            <div key={item.id} className="pick-box pick-box--mark" style={r}>
              <span className="pick-badge">{i + 1}</span>
            </div>
          ) : null;
        })}
        {current && rects.current && <div className="pick-box pick-box--current" style={rects.current} />}
      </div>

      {!active ? (
        <button type="button" className="pick-fab" onClick={() => setActive(true)}>
          <Pencil size={16} aria-hidden="true" /> Edit mode · {items.length} change{items.length === 1 ? '' : 's'}
        </button>
      ) : (
        <section className="pick-panel" aria-label="Edit mode">
          <header className="pick-head">
            <span className="pick-title">
              <MousePointerClick size={16} aria-hidden="true" /> Edit mode is on
            </span>
            <button type="button" className="pick-icon-btn" onClick={() => setActive(false)} aria-label="Exit edit mode (Esc)">
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          {!current ? (
            <p className="pick-help">Click anything on the page to pick it. Links and buttons won&rsquo;t fire while this is on. Switch pages with the menu, then keep picking.</p>
          ) : (
            <div className="pick-current">
              <div className="pick-where">
                <strong>{current.info.route}</strong>
                {current.info.section && <span> · {current.info.section}</span>}
              </div>
              <p className="pick-el">
                <code>&lt;{current.info.tag}&gt;</code> {current.info.text ? `“${current.info.text}”` : <em>no text</em>}
              </p>
              <div className="pick-actions" role="group" aria-label="What should change">
                {ACTIONS.map((a) => (
                  <button key={a} type="button" className="pick-chip" aria-pressed={action === a} onClick={() => setAction(a)}>
                    {a === 'Delete' && <Trash2 size={13} aria-hidden="true" />} {a}
                  </button>
                ))}
              </div>
              <label className="pick-label" htmlFor="pick-note">
                Details <span>(optional)</span>
              </label>
              <textarea id="pick-note" className="pick-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={action === 'Delete' ? 'Anything else? e.g. “also remove it from the footer”' : 'What should it say or look like?'} />
              <div className="pick-row">
                <button type="button" className="pick-btn" onClick={parent}>
                  <ArrowUp size={14} aria-hidden="true" /> Pick parent
                </button>
                <button type="button" className="pick-btn" onClick={() => setCurrent(null)}>
                  Cancel
                </button>
                <button type="button" className="pick-btn pick-btn--primary" onClick={add}>
                  Add to list
                </button>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="pick-list">
              <h3 className="pick-list-title">Your changes ({items.length})</h3>
              <ol>
                {items.map((item, i) => (
                  <li key={item.id}>
                    <span className="pick-num">{i + 1}</span>
                    <span className="pick-item">
                      <strong>{item.action}</strong> {item.info.text ? `“${clip(item.info.text, 46)}”` : `<${item.info.tag}>`}
                      <small>
                        {item.info.route}
                        {item.note ? ` · ${clip(item.note, 60)}` : ''}
                      </small>
                    </span>
                    <button type="button" className="pick-icon-btn" aria-label={`Remove change ${i + 1}`} onClick={() => setItems((list) => list.filter((x) => x.id !== item.id))}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
              <label className="sr-only" htmlFor="pick-text">
                Message to send
              </label>
              <textarea id="pick-text" ref={textRef} className="pick-text" readOnly rows={4} value={message} onFocus={(e) => e.target.select()} />
              <div className="pick-row">
                <button type="button" className="pick-btn" onClick={() => setItems([])}>
                  Clear all
                </button>
                <button type="button" className="pick-btn pick-btn--primary" onClick={copy}>
                  {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />} {copied ? 'Copied. Paste it to Claude' : 'Copy for Claude'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
