'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! An error occurred
        </h2>
        <p className="text-gray-600 mb-6">
          Nous sommes désolés, quelque chose s&apos;est mal passé. Veuillez réessayer.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>
            Réessayer
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}
