export default function RatingStars({ value = 0, max = 5, size = 'sm', editable = false, onChange }) {
  const val = Number(value) || 0;
  return (
    <span className={`stars ${size === 'lg' ? 'stars-lg' : ''}`} role="img" aria-label={`Рейтинг ${val.toFixed(1)} з ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const pos = i + 1;
        const full = val >= pos;
        const half = !full && val >= pos - 0.5;
        const ch = full ? '★' : half ? '⯨' : '☆';
        const style = editable ? { cursor: 'pointer' } : null;
        const onClick = editable ? () => onChange?.(pos) : undefined;
        return <span key={i} style={style} onClick={onClick}>{ch}</span>;
      })}
    </span>
  );
}
