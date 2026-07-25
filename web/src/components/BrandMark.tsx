type Props = {
  size?: number
  className?: string
}

/** Shared VerifyFlow mark — tree / preflight gate (matches favicon). */
export function BrandMark({ size = 36, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="7" fill="#1a2438" />
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="6.25"
        fill="none"
        stroke="#5fd4b3"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      <path
        d="M8 24 L16 7 L24 24"
        fill="none"
        stroke="#5fd4b3"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M11 19.5 H21"
        fill="none"
        stroke="#5fd4b3"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="19.5" r="2.1" fill="#5fd4b3" />
    </svg>
  )
}
