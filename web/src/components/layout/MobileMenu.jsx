import { NavLink } from 'react-router';
import Button from '../ui/Button.jsx';
import { CTA_PRIMARY, CTA_SECONDARY, NAV_ITEMS } from '../../data/navigation.js';

/** Full-height slide-down menu for < 1240px. */
export default function MobileMenu({ open, onNavigate }) {
  return (
    <div id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} inert={!open}>
      <nav aria-label="Mobile" className="mobile-menu__nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className="mobile-menu__item">
              <NavLink to={item.to} className={({ isActive }) => `mobile-menu__link${isActive ? ' is-active' : ''}`} onClick={onNavigate}>
                {item.label}
              </NavLink>
            </li>
          ))}
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
