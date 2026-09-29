import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, Grid, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist on Baby’s Bazaar.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-200">
        <span className="inline-block text-6xl font-black font-roboto-slab text-[#F40436] mb-3">
          404
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-roboto-slab text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 text-sm mb-8 leading-relaxed font-sans">
          We couldn&apos;t find the baby product or page you were looking for. It may have moved or been updated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F40436] hover:bg-[#D9032F] text-white text-sm font-semibold px-5 py-3 rounded-full transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Home size={16} />
            <span>Go to Home</span>
          </Link>

          <Link
            href="/categories"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold px-5 py-3 rounded-full border border-gray-300 transition-all cursor-pointer active:scale-98"
          >
            <Grid size={16} />
            <span>Browse Shop</span>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500">
          Need help?{' '}
          <Link href="/contact" className="text-[#F40436] hover:underline font-medium inline-flex items-center gap-1">
            <Phone size={12} /> Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
