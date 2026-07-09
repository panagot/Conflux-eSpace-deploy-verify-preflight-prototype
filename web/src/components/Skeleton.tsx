export function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-surface-2" />
            <div className="h-2 w-12 rounded bg-surface-2" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[20px_1fr] gap-4">
            <div className="h-2.5 w-2.5 rounded-full bg-surface-2" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-surface-2" />
              <div className="h-3 w-full max-w-md rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
