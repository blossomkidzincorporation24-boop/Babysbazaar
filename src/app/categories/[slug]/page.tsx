import { redirect } from 'next/navigation'

export default async function CategoriesSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/category/${slug}`)
}
