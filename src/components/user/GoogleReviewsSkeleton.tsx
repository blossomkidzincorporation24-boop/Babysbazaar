import Container from '@/components/ui/Container'

export default function GoogleReviewsSkeleton() {
  return (
    <section className="w-full py-10 lg:py-16 overflow-hidden bg-white">
      <Container>
        {/* Header Skeleton */}
        <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
          <div className="h-8 w-56 sm:w-72 bg-gray-200 rounded-md animate-pulse mb-3" />
          <div className="h-4 w-44 sm:w-60 bg-gray-100 rounded-md animate-pulse" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between h-56"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                    <div>
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-1.5" />
                      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
