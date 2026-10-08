import { Link } from 'react-router';
import Logo from '../ui/Logo.jsx';
import FooterFlames from '../visuals/FooterFlames.jsx';
import { FOOTER_COLUMNS } from '../../data/navigation.js';

export default function Footer() {
  return (
    <footer className="site-footer section--dark">
      <FooterFlames />
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Logo onDark />
            <p>A curated talent network connecting proven sales professionals with the startups and growth-stage companies hiring them.</p>
          </div>

          <div className="site-footer__cols">
            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="site-footer__title">{column.title}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>&copy; {new Date().getFullYear()} The Sales Floor. All rights reserved.</p>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
