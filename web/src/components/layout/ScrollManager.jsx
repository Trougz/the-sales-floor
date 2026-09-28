import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/**
 * Restores sensible scroll + focus on navigation:
 *  - hash link  → scroll that section into view (waits a few frames for it to mount)
 *  - new route  → jump to top and move focus to <main> for screen-reader users
 */
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const previousPath = useRef(null);

  useEffect(() => {
    const pathChanged = previousPath.current !== null && previousPath.current !== pathname;
    const firstLoad = previousPath.current === null;
    previousPath.current = pathname;

    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let frames = 0;
      let raf;
      const seek = () => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: pathChanged || firstLoad ? 'instant' : 'smooth', block: 'start' });
          return;
        }
        if (frames++ < 30) raf = requestAnimationFrame(seek);
      };
      seek();
      return () => cancelAnimationFrame(raf);
    }

    // Same page, no hash (e.g. a query-string filter changed): leave the scroll position alone.
    if (pathChanged || firstLoad) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (pathChanged) document.getElementById('main')?.focus({ preventScroll: true });
    return undefined;
  }, [pathname, hash, key]);

  return null;
}
