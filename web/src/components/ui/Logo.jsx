import { Link } from 'react-router';
import Flame from './Flame.jsx';

export default function Logo({ onDark = false }) {
  return (
    <Link to="/" className={`logo${onDark ? ' logo--on-dark' : ''}`} aria-label="The Sales Floor — home">
      <Flame />
      <span>The Sales Floor</span>
    </Link>
  );
}
