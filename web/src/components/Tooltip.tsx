import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Info } from '@phosphor-icons/react'

type Props = {
  content: ReactNode
  label?: string
  className?: string
}

const HEADER_CLEARANCE = 72
const GAP = 8
const WIDTH = 224

export function Tooltip({ content, label = 'More info', className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; place: 'above' | 'below' } | null>(
    null,
  )
  const btnRef = useRef<HTMLButtonElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const id = useId()

  const place = () => {
    const btn = btnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const tipH = tipRef.current?.offsetHeight ?? 80
    const spaceAbove = r.top
    const preferBelow = spaceAbove < HEADER_CLEARANCE + tipH
    const left = Math.min(
      Math.max(12, r.left + r.width / 2 - WIDTH / 2),
      window.innerWidth - WIDTH - 12,
    )
    const top = preferBelow ? r.bottom + GAP : r.top - GAP
    setCoords({ top, left, place: preferBelow ? 'below' : 'above' })
  }

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }
    place()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onReposition = () => place()
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [open])

  return (
    <span className={`relative inline-flex align-middle ${className}`}>
      <button
        ref={btnRef}
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
      {open &&
        createPortal(
          <span
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{
              position: 'fixed',
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              width: WIDTH,
              transform: coords?.place === 'above' ? 'translateY(-100%)' : undefined,
              visibility: coords ? 'visible' : 'hidden',
            }}
            className="z-[100] rounded-md border border-border bg-surface-2 px-3 py-2 text-left text-[11px] leading-relaxed text-text-muted shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            {content}
            <span
              className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                coords?.place === 'below'
                  ? 'bottom-full border-b-surface-2'
                  : 'top-full border-t-surface-2'
              }`}
            />
          </span>,
          document.body,
        )}
    </span>
  )
}
