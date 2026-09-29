import { getGoogleReviews } from '@/lib/google/google-reviews'
import GoogleReviewsSlider from './GoogleReviewsSlider'

export default async function GoogleReviews() {
  const data = await getGoogleReviews()

  if (!data || !data.reviews || data.reviews.length === 0) {
    return null
  }

  return <GoogleReviewsSlider data={data} />
}
