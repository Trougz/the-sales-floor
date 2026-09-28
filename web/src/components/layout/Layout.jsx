import { Outlet, useLocation } from 'react-router';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ScrollManager from './ScrollManager.jsx';

export default function Layout() {
  const { pathname } = useLocation();

  // A plain href="#main" would clobber the router URL (especially with hash routing),
  // so the skip link moves focus programmatically instead.
  const skip = (event) => {
    event.preventDefault();
    const main = document.getElementById('main');
    main?.focus();
    main?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };

  return (
    <>
      <a href="#main" className="skip-link" onClick={skip}>
        Skip to content
      </a>
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1}>
        <div key={pathname} className="page">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}
