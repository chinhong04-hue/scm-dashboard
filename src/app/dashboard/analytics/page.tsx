import { createClient } from '@/lib/supabase/server'
import {
  SpendingBySupplierChart,
  InventoryByCategoryChart,
  TransactionsByTypeChart,
} from '@/components/dashboard/Charts'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // 1. Procurement spending by supplier
  const { data: poData } = await supabase
    .from('purchase_orders')
    .select('total_cost, suppliers(name)')

  const spendingMap: Record<string, number> = {}
  poData?.forEach((po) => {
    const supplier = po.suppliers as { name: string } | null
    const name = supplier?.name ?? 'Unknown'
    spendingMap[name] = (spendingMap[name] ?? 0) + (po.total_cost ?? 0)
  })
  const spendingData = Object.entries(spendingMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)

  // 2. Inventory by category
  const { data: invData } = await supabase
    .from('inventory')
    .select('quantity_on_hand, products(category)')

  const categoryMap: Record<string, number> = {}
  invData?.forEach((inv) => {
    const product = inv.products as { category: string } | null
    const cat = product?.category ?? 'Other'
    categoryMap[cat] = (categoryMap[cat] ?? 0) + inv.quantity_on_hand
  })
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // 3. Warehouse transactions by type
  const { data: txData } = await supabase
    .from('warehouse_transactions')
    .select('transaction_type')

  const txMap: Record<string, number> = {}
  txData?.forEach((t) => {
    txMap[t.transaction_type] = (txMap[t.transaction_type] ?? 0) + 1
  })
  const txChartData = Object.entries(txMap).map(([name, count]) => ({ name, count }))

  // 4. KPI summary numbers
  const totalSpend = spendingData.reduce((s, d) => s + d.total, 0)
  const totalStock = categoryData.reduce((s, d) => s + d.value, 0)
  const { count: supplierCount } = await supabase
    .from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true)
  const { count: deliveredCount } = await supabase
    .from('deliveries').select('*', { count: 'exact', head: true }).eq('status', 'Delivered')
  const { count: totalDeliveries } = await supabase
    .from('deliveries').select('*', { count: 'exact', head: true })
  const onTimeRate = totalDeliveries
    ? Math.round(((deliveredCount ?? 0) / totalDeliveries) * 100)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Business intelligence overview across all modules.</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Procurement Spend</p>
          <p className="text-xl font-bold text-gray-900">
            RM {totalSpend.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Stock Units</p>
          <p className="text-xl font-bold text-gray-900">{totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Active Suppliers</p>
          <p className="text-xl font-bold text-gray-900">{supplierCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">On-Time Delivery Rate</p>
          <p className="text-xl font-bold text-green-600">{onTimeRate}%</p>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Procurement Spending by Supplier (MYR)</h3>
          <SpendingBySupplierChart data={spendingData} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Inventory by Category (Qty on Hand)</h3>
          <InventoryByCategoryChart data={categoryData} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Warehouse Transactions by Type</h3>
          <TransactionsByTypeChart data={txChartData} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Supplier Performance Summary</h3>
          <div className="space-y-3 mt-2">
            {spendingData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{s.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(s.total / totalSpend) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">
                    RM {(s.total / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
