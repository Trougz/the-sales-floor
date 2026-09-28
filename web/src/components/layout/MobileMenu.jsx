import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { ChevronDown } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { CTA_PRIMARY, CTA_SECONDARY, NAV_ITEMS } from '../../data/navigation.js';

/** Full-height slide-down menu for < 1240px. Groups with children expand as accordions. */
export default function MobileMenu({ open, onNavigate }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} inert={!open}>
      <nav aria-label="Mobile" className="mobile-menu__nav">
        <ul>
          {NAV_ITEMS.map((item) => {
            const isOpen = expanded === item.label;
            return (
              <li key={item.label} className="mobile-menu__item">
                <div className="mobile-menu__row">
                  <NavLink to={item.to} className={({ isActive }) => `mobile-menu__link${isActive ? ' is-active' : ''}`} onClick={onNavigate}>
                    {item.label}
                  </NavLink>
                  {item.children && (
                    <button type="button" className="mobile-menu__toggle" aria-expanded={isOpen} aria-controls={`mm-${item.label}`} aria-label={`${item.label} submenu`} onClick={() => setExpanded(isOpen ? null : item.label)}>
                      <ChevronDown size={20} aria-hidden="true" />
                    </button>
                  )}
                </div>
                {item.children && (
                  <div id={`mm-${item.label}`} className={`mobile-menu__sub${isOpen ? ' is-open' : ''}`} inert={!isOpen}>
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <Link to={child.to} onClick={onNavigate}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mobile-menu__ctas">
        <Button to={CTA_PRIMARY.to} size="lg" arrow onClick={onNavigate}>
          {CTA_PRIMARY.label}
        </Button>
        <Button to={CTA_SECONDARY.to} variant="outline" size="lg" onClick={onNavigate}>
          {CTA_SECONDARY.label}
        </Button>
      </div>
    </div>
  );
}
