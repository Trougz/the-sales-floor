import { Building2, UsersRound } from 'lucide-react';
import Flame from '../ui/Flame.jsx';

/** SALES TALENT → THE SALES FLOOR → COMPANIES, as a semantic ordered list with CSS connectors. */
export default function FlowDiagram() {
  return (
    <ol className="flow" aria-label="The Sales Floor sits between sales talent and companies">
      <li className="flow__node">
        <span className="flow__icon">
          <UsersRound size={28} aria-hidden="true" />
        </span>
        <span className="flow__label">Sales talent</span>
        <span className="flow__sub">Tell us what they’re looking for</span>
      </li>
      <li className="flow__node flow__node--center">
        <span className="flow__icon">
          <Flame />
        </span>
        <span className="flow__label">The Sales Floor</span>
        <span className="flow__sub">We understand both sides and facilitate relevant introductions</span>
      </li>
      <li className="flow__node">
        <span className="flow__icon">
          <Building2 size={28} aria-hidden="true" />
        </span>
        <span className="flow__label">Companies</span>
        <span className="flow__sub">Tell us who they’re looking for</span>
      </li>
    </ol>
  );
}
