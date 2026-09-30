export const dynamic = 'force-dynamic'

import { getToysMainCategory, getToySubcategories } from '@/lib/actions/toys'
import ToyManagementClient from './ToyManagementClient'

export default async function ToyManagementPage() {
  const [mainCategory, subcategories] = await Promise.all([
    getToysMainCategory(),
    getToySubcategories(true), // include inactive for admin
  ])

  return (
    <ToyManagementClient
      mainCategory={mainCategory}
      initialSubcategories={subcategories}
    />
  )
}
