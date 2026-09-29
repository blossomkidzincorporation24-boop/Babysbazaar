export const dynamic = 'force-dynamic'
import { getReels } from '@/lib/actions/reels'
import ReelsClient from './ReelsClient'

export default async function ReelsPage() {
  const reels = await getReels()
  return <ReelsClient initialReels={reels} />
}

