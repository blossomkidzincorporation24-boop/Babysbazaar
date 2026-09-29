export const dynamic = 'force-dynamic'
import { getBanners } from '@/lib/actions/banners'
import BannersClient from './BannersClient'

export default async function BannersPage() {
  const banners = await getBanners()
  return <BannersClient initialBanners={banners} />
}

