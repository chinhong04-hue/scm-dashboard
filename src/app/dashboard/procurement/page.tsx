import { createClient } from '@/lib/supabase/server'

const statusStyles: Record<string, string> = {
  'Draft':            'bg-gray-100 text-gray-600',
  'Pending Approval': 'bg-yellow-100 text-yellow-700',
  'Approved':         'bg-blue-100 text-blue-700',
  'Shipped':          'bg-purple-100 text-purple-700',
  'Received':         'bg-green-100 text-green-700',
  'Cancelled':        'bg-red-100 text-red-600',
}

const paymentStyles: Record<string, string> = {
  'Unpaid':  'bg-red-100 text-red-600',
  'Partial': 'bg-yellow-100 text-yellow-700',
  'Paid':    'bg-green-100 text-green-700',
}

export default async function ProcurementPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      po_number,
      status,
      total_cost,
      payment_status,
      estimated_delivery_date,
      created_at,
      suppliers ( name )
    `)
    .order('created_at', { ascending: false })

  const totalSpend = orders?.reduce((sum, o) => sum + (o.total_cost ?? 0), 0) ?? 0
  const activeCount = orders?.filter(o => ['Approved', 'Shipped'].includes(o.status)).length ?? 0
  const pendingCount = orders?.filter(o => o.status === 'Pending Approval').length ?? 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Procurement</h2>
        <p className="text-gray-500 text-sm mt-1">Manage purchase orders and supplier deliveries.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Active Orders</p>
          <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Spend</p>
          <p className="text-2xl font-bold text-gray-900">
            RM {totalSpend.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-600">PO Number</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total (MYR)</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Est. Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders?.map((order) => {
              const supplier = (order.suppliers as unknown) as { name: string } | null
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">
                    {order.po_number}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{supplier?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {(order.total_cost ?? 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStyles[order.payment_status ?? 'Unpaid']}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {order.estimated_delivery_date ?? '—'}
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
