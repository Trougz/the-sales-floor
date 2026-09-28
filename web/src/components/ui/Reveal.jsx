import useReveal from '../../hooks/useReveal.js';

/** Scroll-triggered fade/slide-in wrapper. `delay` is in ms for staggering siblings. */
export default function Reveal({ as: Tag = 'div', delay = 0, scale = false, className = '', style, children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal${scale ? ' reveal--scale' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
