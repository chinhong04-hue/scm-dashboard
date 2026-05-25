import { createClient } from '@/lib/supabase/server'

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: inventory } = await supabase
    .from('inventory')
    .select(`
      id,
      bin_location,
      batch_number,
      warehouse_name,
      quantity_on_hand,
      allocated_quantity,
      products (
        sku,
        name,
        category,
        unit_of_measure,
        reorder_point,
        safety_stock
      )
    `)
    .order('id')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
        <p className="text-gray-500 text-sm mt-1">Current stock levels across all products.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">On Hand</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Allocated</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Available</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Reorder Pt</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inventory?.map((item) => {
              const product = item.products as {
                sku: string; name: string; category: string;
                unit_of_measure: string; reorder_point: number; safety_stock: number
              }
              const available = item.quantity_on_hand - item.allocated_quantity
              const isLow = item.quantity_on_hand <= (product?.reorder_point ?? 0)
              const isOut = item.quantity_on_hand === 0

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{product?.sku}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{product?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{product?.category}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                      {item.bin_location}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">{item.quantity_on_hand}</td>
                  <td className="px-4 py-3 text-right text-orange-500">{item.allocated_quantity}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{available}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{product?.reorder_point}</td>
                  <td className="px-4 py-3 text-center">
                    {isOut ? (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">Out of Stock</span>
                    ) : isLow ? (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">OK</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
