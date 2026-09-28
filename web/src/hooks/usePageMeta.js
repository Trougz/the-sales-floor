import { useEffect } from 'react';

const SITE = 'The Sales Floor';
const DEFAULT_DESCRIPTION =
  'The Sales Floor is a curated talent network connecting proven B2B sales professionals with startups and growth-stage companies that are actually hiring.';

/** Sets the document title + meta description for the current route. */
export default function usePageMeta(title, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE} | A curated network for sales talent`;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [title, description]);
}
