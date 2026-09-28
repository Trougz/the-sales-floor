import { useRef } from 'react';

/**
 * Accessible tab list (WAI-ARIA tabs pattern): arrow keys / Home / End move
 * between tabs, only the active tab is in the tab order.
 * Pair with <TabPanel> using the same `idBase`.
 */
export function Tabs({ tabs, value, onChange, idBase, label, className = '', variant = 'pill' }) {
  const refs = useRef([]);

  const onKeyDown = (event, index) => {
    const last = tabs.length - 1;
    let next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={`tabs tabs--${variant} ${className}`.trim()}>
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            role="tab"
            type="button"
            id={`${idBase}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={`tab${selected ? ' is-active' : ''}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
            {typeof tab.count === 'number' && <span className="tab__count">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, value, idBase, className = '', children }) {
  if (id !== value) return null;
  return (
    <div role="tabpanel" id={`${idBase}-panel-${id}`} aria-labelledby={`${idBase}-tab-${id}`} tabIndex={0} className={`tab-panel ${className}`.trim()}>
      {children}
    </div>
  );
}
