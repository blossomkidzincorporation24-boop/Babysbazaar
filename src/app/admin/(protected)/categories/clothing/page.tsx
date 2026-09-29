export const dynamic = 'force-dynamic'

import {
  getClothingSubcategories,
  getClothingAgeGroups,
  getClothingSizes,
} from '@/lib/actions/clothing'
import ClothingManagementClient from './ClothingManagementClient'

export default async function ClothingManagementPage() {
  const [subcategories, ageGroups, sizes] = await Promise.all([
    getClothingSubcategories(),
    getClothingAgeGroups(),
    getClothingSizes(),
  ])

  return (
    <ClothingManagementClient
      initialSubcategories={subcategories}
      initialAgeGroups={ageGroups}
      initialSizes={sizes}
    />
  )
}
