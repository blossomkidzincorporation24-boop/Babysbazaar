export const dynamic = 'force-dynamic'

import { getMediaAssets } from '@/lib/actions/media'
import MediaClient from './MediaClient'

export default async function MediaPage() {
  const assets = await getMediaAssets()
  return <MediaClient initialAssets={assets} />
}
