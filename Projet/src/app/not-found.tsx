import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page not found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  )
}
