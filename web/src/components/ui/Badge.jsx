/** Small label. `tone="sample"` is the loud, uppercase "this is illustrative" marker used on all placeholder content. */
export default function Badge({ tone = 'neutral', icon, children, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`.trim()}>
      {icon}
      {children}
    </span>
  );
}
