'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Search, Eye, Pencil, Trash2, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { deleteProduct } from '@/lib/actions/products'
import ConfirmDelete from '@/components/admin/ConfirmDelete'

interface Props {
  initialProducts: any[]
  categories: any[]
}

export default function ProductsClient({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All categories')

  // Filter products based on search query and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All categories' || product.categories?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  async function handleDelete(id: string) {
    const result = await deleteProduct(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Product deleted')
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#202124] tracking-tight">Products</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Manage the products customers can discover and enquire about.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] bg-white text-[#202124] appearance-none cursor-pointer hidden sm:block"
          >
            <option value="All categories">All categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-sm font-medium text-[#8A8A8A] whitespace-nowrap">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#E52D68] hover:bg-[#D4225A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm flex-shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-white border border-[#ECE8EA] rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <Package size={48} className="mx-auto mb-4 text-[#ECE8EA]" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-[#202124] mb-1">No products yet</h3>
          <p className="text-sm text-[#8A8A8A] mb-6">Add your first product to start building your catalogue.</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#E52D68] hover:bg-[#D4225A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm hover:scale-[1.02]"
          >
            <Plus size={16} /> Add product
          </Link>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white border border-[#ECE8EA] rounded-2xl">
          <Search size={48} className="mx-auto mb-4 text-[#ECE8EA]" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-[#202124] mb-1">No products found</h3>
          <p className="text-sm text-[#8A8A8A]">Try changing your search or category filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#ECE8EA] rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECE8EA] text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider bg-[#FAFAFC]/50">
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Product</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Price</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Category</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-center">Best Seller</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-center">New Arrival</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-center">Featured</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8EA]">
                {filteredProducts.map((product: any) => (
                  <tr key={product.id} className="group hover:bg-[#FAF9FA] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FAF9FA] border border-[#ECE8EA] overflow-hidden flex-shrink-0 relative">
                          {product.product_images?.[0] ? (
                            <Image src={product.product_images[0]} alt={product.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#ECE8EA]">
                              <Package size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-[#202124] leading-snug">{product.title}</div>
                          <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#8A8A8A] hover:text-[#E52D68] transition-colors mt-0.5 inline-block">
                            View customer preview
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-semibold text-[#202124] whitespace-nowrap">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#202124] whitespace-nowrap">
                      {product.categories?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium tracking-wide ${
                        product.status === 'active' 
                          ? 'bg-[#E8F5E9] text-[#2E7D32]' 
                          : 'bg-[#F1F3F4] text-[#5F6368]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-[#2E7D32]' : 'bg-[#5F6368]'}`}></span>
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[13px] font-medium text-[#202124]">
                      {product.best_seller ? 'Yes' : <span className="text-[#8A8A8A]">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center text-[13px] font-medium text-[#202124]">
                      {product.new_arrival ? 'Yes' : <span className="text-[#8A8A8A]">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center text-[13px] font-medium text-[#202124]">
                      {product.featured ? 'Yes' : <span className="text-[#8A8A8A]">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#202124] hover:bg-white border border-transparent hover:border-[#ECE8EA] transition-all" title="View">
                          <Eye size={16} />
                        </a>
                        <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#202124] hover:bg-white border border-transparent hover:border-[#ECE8EA] transition-all" title="Edit">
                          <Pencil size={16} />
                        </Link>
                        <ConfirmDelete 
                          onConfirm={() => handleDelete(product.id)} 
                          itemName={product.title} 
                          className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#E52D68] hover:bg-white border border-transparent hover:border-[#ECE8EA] transition-all"
                          iconSize={16}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
