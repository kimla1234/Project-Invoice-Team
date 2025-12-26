export default function StockManageSkeleton() {
  return (
    <div className="flex w-full justify-center p-10 dark:bg-gray-900 animate-pulse">
      <div className="mx-auto max-w-3xl space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Product Info */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 space-y-3">
          <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Action Form */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 space-y-6">
          {/* Type buttons */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Note */}
          <div className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700" />

          {/* Button */}
          <div className="h-12 rounded-lg bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Movement History */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 space-y-4">
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />

          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
