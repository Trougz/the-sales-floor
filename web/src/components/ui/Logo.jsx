import { Link } from 'react-router';
import LogoMark from './LogoMark.jsx';

export default function Logo({ onDark = false }) {
  return (
    <Link to="/" className={`logo${onDark ? ' logo--on-dark' : ''}`} aria-label="The Sales Floor — home">
      <LogoMark />
      <span>The Sales Floor</span>
    </Link>
  );
}
