// 인라인 SVG 아이콘 세트 (이모지 대체). stroke = currentColor.
const PATHS = {
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a6 6 0 0 0-3.8 10.6c.5.4.8 1 .8 1.7v.7h6v-.7c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 2Z" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth="3" />
    </>
  ),
  map: (
    <>
      <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" />
      <line x1="9" y1="3" x2="9" y2="19" />
      <line x1="15" y1="5" x2="15" y2="21" />
    </>
  ),
  home: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  book: (
    <>
      <path d="M12 6C10.5 4.5 7.5 4 5 4H3v14h2c2.5 0 5.5.5 7 2 1.5-1.5 4.5-2 7-2h2V4h-2c-2.5 0-5.5.5-7 2Z" />
      <line x1="12" y1="6" x2="12" y2="20" />
    </>
  ),
  pencil: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-5.7-7-11a7 7 0 0 1 14 0c0 5.3-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  brain: (
    <>
      <circle cx="6" cy="7" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="12" cy="17" r="2" />
      <path d="M7.7 8.6 10.6 15M16.3 8.6 13.4 15M8 7h8" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11Z" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 3h11a2 2 0 0 1 2 2v13a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V3Z" />
      <path d="M6 3a2 2 0 0 0-2 2v2h4" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" />
    </>
  ),
  egg: <path d="M12 3c3.5 0 6 5 6 9a6 6 0 0 1-12 0c0-4 2.5-9 6-9Z" />,
  chick: (
    <>
      <path d="M12 3c3.5 0 6 5 6 9a6 6 0 0 1-12 0c0-4 2.5-9 6-9Z" />
      <path d="M9 11.5 10.5 10 12 11.5 13.5 10 15 11.5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 20 3M16 7l2 2M18 5l2 2" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z" />
      <path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9Z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  news: (
    <>
      <path d="M4 5h13v13a2 2 0 0 1-2 2H5a2 2 0 0 1-1-1.7Z" />
      <path d="M17 8h3v10a2 2 0 0 1-2 2" />
      <line x1="7" y1="9" x2="14" y2="9" />
      <line x1="7" y1="13" x2="14" y2="13" />
      <line x1="7" y1="17" x2="11" y2="17" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  share: (
    <>
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </>
  ),
};

export default function Icon({ name, size = 16, style, className, strokeWidth = 2 }) {
  return (
    <svg
      className={`ico${className ? ` ${className}` : ""}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] || null}
    </svg>
  );
}
