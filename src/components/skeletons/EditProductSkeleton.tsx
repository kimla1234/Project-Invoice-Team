import React from 'react'

export default function EditProductSkeleton() {
  return (
    <div className="flex w-full justify-center p-10 animate-pulse">
      <div className="w-[70%] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Form Card */}
        <div className="rounded-md border bg-white p-7 dark:bg-gray-800 space-y-6">
          {/* Name + Type */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-32 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Buttons */}
          <div className="flex gap-6 pt-6">
            <div className="h-12 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-12 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  )
}
