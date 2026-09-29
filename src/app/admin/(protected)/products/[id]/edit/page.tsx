export const dynamic = 'force-dynamic'
import { getProduct } from '@/lib/actions/products'
import { getCategories } from '@/lib/actions/categories'
import ProductForm from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params

  let product
  try {
    product = await getProduct(id)
  } catch {
    notFound()
  }

  if (!product) notFound()

  const categories = await getCategories()

  return <ProductForm categories={categories} product={product} />
}
