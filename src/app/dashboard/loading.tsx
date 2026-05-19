import { Skeleton } from '@/presentation/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Mobile greeting */}
      <div className="flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-9 rounded-[10px]" />
      </div>

      {/* Mobile hero balance */}
      <Skeleton className="h-44 rounded-3xl lg:hidden" />

      {/* Mobile quick stats */}
      <div className="grid grid-cols-2 gap-2.5 lg:hidden">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>

      {/* Desktop stat cards */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card space-y-2">
            <Skeleton className="h-3 w-20 rounded-lg" />
            <Skeleton className="h-7 w-32 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
          <Skeleton className="h-[240px] w-full rounded-xl" />
        </div>
        <div className="card space-y-4">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-[220px] w-full rounded-xl" />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card space-y-4">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-[220px] w-full rounded-xl" />
        </div>
        <div className="card space-y-3">
          <Skeleton className="h-5 w-32 rounded-lg" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24 rounded-lg" />
                <Skeleton className="h-3 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent + Upcoming */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="card space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-lg" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-[var(--color-border-soft)]">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="card space-y-3">
          <Skeleton className="h-5 w-24 rounded-lg mb-2" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'var(--color-surface-muted)' }}>
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
