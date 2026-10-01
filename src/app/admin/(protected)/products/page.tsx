export const dynamic = 'force-dynamic'
import { getProducts } from '@/lib/actions/products'
import { getCategories } from '@/lib/actions/categories'
import ProductsClient from './ProductsClient'

export default async function ProductsPage() {
  const [productsData, categories] = await Promise.all([
    getProducts(1, 1000),
    getCategories(),
  ])
  return <ProductsClient initialProducts={productsData.products} categories={categories} />
}

