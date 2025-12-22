import Link from 'next/link'
import React from 'react'
import { FiSkipBack } from 'react-icons/fi'

export default function StockManage() {
  return (
    <div className="flex h-auto w-full justify-center p-10">
      <div className="w-[70%] space-y-4">
        <div className="flex items-center justify-between">
          <div className="rounded-lg border bg-white p-2 dark:bg-gray-800">
            <h3 className="text-md font-bold text-gray-900 dark:text-gray-300">
              Stock Management 
            </h3>
          </div>
          <Link
            href="/products"
            className="text-md flex items-center rounded-lg border bg-white p-2 font-medium text-primary hover:text-red-400 dark:hover:text-blue-400"
          >
            <FiSkipBack className="mr-2 h-5 w-5" />
            Back to Products
          </Link>
        </div>

        <div className="w-full rounded-md border bg-white p-7 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
          dd
        </div>
      </div>
    </div>
  )
}
