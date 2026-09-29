export const dynamic = 'force-dynamic'
import { getCategories } from '@/lib/actions/categories'
import ProductForm from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const categories = await getCategories()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add Product</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new product</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}

