import { useId, useState } from 'react';
import { Plus } from 'lucide-react';

/**
 * FAQ accordion. One item open at a time; height animates via the
 * grid-template-rows 0fr → 1fr trick (no measuring, no JS animation).
 * Collapsed panels are `inert` so their links can't be tabbed to.
 */
export default function Accordion({ items, defaultOpen = null }) {
  const base = useId();
  const [openId, setOpenId] = useState(defaultOpen);

  return (
    <div className="accordion">
      {items.map((item) => {
        const open = openId === item.id;
        const buttonId = `${base}-btn-${item.id}`;
        const panelId = `${base}-panel-${item.id}`;
        return (
          <div key={item.id} className={`accordion__item${open ? ' is-open' : ''}`}>
            <h3 className="accordion__heading">
              <button type="button" id={buttonId} className="accordion__trigger" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenId(open ? null : item.id)}>
                <span>{item.q}</span>
                <span className="accordion__icon" aria-hidden="true">
                  <Plus size={20} />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className="accordion__panel" inert={!open}>
              <div className="accordion__panel-inner">
                <div className="accordion__content">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
