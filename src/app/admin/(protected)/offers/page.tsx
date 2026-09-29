export const dynamic = 'force-dynamic'

import { getOfferBanners } from '@/lib/actions/offers'
import OffersClient from './OffersClient'

export default async function OffersPage() {
  const offers = await getOfferBanners()
  return <OffersClient initialOffers={offers} />
}
