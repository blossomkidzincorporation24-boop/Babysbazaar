export const dynamic = 'force-dynamic'
import { getPhotos } from '@/lib/actions/photos'
import PhotosClient from './PhotosClient'

export default async function PhotosPage() {
  const photos = await getPhotos()
  return <PhotosClient initialPhotos={photos} />
}

