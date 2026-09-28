import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ChevronDown } from 'lucide-react';

/**
 * Desktop dropdown. The label stays a real link (goes to the section's overview
 * page); the chevron is a separate toggle button so keyboard and touch users can
 * open the menu without navigating. Hover also opens it.
 */
export default function NavDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const toggleRef = useRef(null);
  const timer = useRef();
  const menuId = useId();
  const { key } = useLocation();

  useEffect(() => setOpen(false), [key]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 140);
  };

  const onBlur = (event) => {
    if (!wrapRef.current?.contains(event.relatedTarget)) setOpen(false);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      toggleRef.current?.focus();
    }
  };

  return (
    <li className={`nav-item nav-item--has-menu${open ? ' is-open' : ''}`} ref={wrapRef} onMouseEnter={show} onMouseLeave={hideSoon} onBlur={onBlur} onKeyDown={onKeyDown}>
      <NavLink to={item.to} className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
        {item.label}
      </NavLink>
      <button ref={toggleRef} type="button" className="nav-chevron" aria-expanded={open} aria-controls={menuId} aria-label={`${item.label} menu`} onClick={() => setOpen((v) => !v)}>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div id={menuId} className="dropdown" role="group" aria-label={item.label}>
        <ul className="dropdown__list">
          {item.children.map((child) => (
            <li key={child.to}>
              <Link to={child.to} className="dropdown__link" onClick={() => setOpen(false)}>
                <span className="dropdown__label">{child.label}</span>
                {child.desc && <span className="dropdown__desc">{child.desc}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
