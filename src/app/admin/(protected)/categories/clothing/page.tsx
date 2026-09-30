export const dynamic = 'force-dynamic'

import {
  getClothingAgeGroups,
  getClothingSizes,
} from '@/lib/actions/clothing'
import ClothingManagementClient from './ClothingManagementClient'

export default async function ClothingManagementPage() {
  const [ageGroups, sizes] = await Promise.all([
    getClothingAgeGroups(),
    getClothingSizes(),
  ])

  return (
    <ClothingManagementClient
      initialAgeGroups={ageGroups}
      initialSizes={sizes}
    />
  )
}
