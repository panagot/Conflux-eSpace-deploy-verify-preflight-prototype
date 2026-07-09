import { useId, useState, type ReactNode } from 'react'
import { Info } from '@phosphor-icons/react'

type Props = {
  content: ReactNode
  label?: string
  className?: string
}

export function Tooltip({ content, label = 'More info', className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded text-text-dim transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <Info size={12} weight="bold" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-md border border-border bg-surface-2 px-3 py-2 text-left text-[11px] leading-relaxed text-text-muted shadow-lg"
        >
          {content}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-surface-2" />
        </span>
      )}
    </span>
  )
}
