export const dynamic = 'force-dynamic'

import { getDeliveryFeatures } from '@/lib/actions/delivery'
import DeliveryClient from './DeliveryClient'

export default async function DeliveryPage() {
  const features = await getDeliveryFeatures()
  return <DeliveryClient initialFeatures={features} />
}
