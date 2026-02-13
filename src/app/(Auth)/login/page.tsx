import Login from '@/components/Auth/login/Login'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <Suspense>
      
      <Login/>
    </Suspense>
  )
}
