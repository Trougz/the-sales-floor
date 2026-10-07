import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import Button from '../ui/Button.jsx';
import MobileMenu from './MobileMenu.jsx';
import { CTA_PRIMARY, CTA_SECONDARY, NAV_ITEMS } from '../../data/navigation.js';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { key } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on any navigation.
  useEffect(() => setMenuOpen(false), [key]);

  // While the mobile menu is open: lock page scroll, make the page inert, close on Escape,
  // and close if the viewport grows into the desktop layout.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const covered = document.querySelectorAll('main, footer');
    covered.forEach((node) => {
      node.inert = true;
    });
    const onKey = (event) => event.key === 'Escape' && setMenuOpen(false);
    const desktop = window.matchMedia('(min-width: 1240px)');
    const onResize = (event) => event.matches && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    return () => {
      document.body.style.overflow = previous;
      covered.forEach((node) => {
        node.inert = false;
      });
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
      <div className="site-header__inner">
        <Logo />

        <nav aria-label="Primary" className="site-nav">
          <ul className="site-nav__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className="nav-item">
                <NavLink to={item.to} className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Button to={CTA_SECONDARY.to} variant="outline" className="btn--compact">
            {CTA_SECONDARY.label}
          </Button>
          <Button to={CTA_PRIMARY.to} className="btn--compact">
            {CTA_PRIMARY.label}
          </Button>
        </div>

        <button type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      <MobileMenu open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </header>
  );
}
