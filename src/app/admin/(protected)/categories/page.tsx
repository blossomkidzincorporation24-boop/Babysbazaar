export const dynamic = 'force-dynamic'
import { getCategories } from '@/lib/actions/categories'
import CategoriesClient from './CategoriesClient'

export default async function CategoriesPage() {
  const categories = await getCategories()
  return <CategoriesClient initialCategories={categories} />
}

