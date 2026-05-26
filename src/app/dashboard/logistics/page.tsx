import { createClient } from '@/lib/supabase/server'
import { Truck } from 'lucide-react'

const statusConfig: Record<string, string> = {
  'In Transit':       'bg-blue-100 text-blue-700',
  'Out for Delivery': 'bg-purple-100 text-purple-700',
  'Delivered':        'bg-green-100 text-green-700',
  'Delayed':          'bg-red-100 text-red-600',
}

export default async function LogisticsPage() {
  const supabase = await createClient()

  const { data: deliveries } = await supabase
    .from('deliveries')
    .select(`
      id,
      tracking_number,
      carrier_name,
      status,
      freight_cost,
      origin_address,
      destination_address,
      estimated_arrival,
      actual_arrival,
      purchase_orders ( po_number ),
      sales_orders ( so_number )
    `)
    .order('id', { ascending: false })

  const inTransit  = deliveries?.filter(d => d.status === 'In Transit').length ?? 0
  const delivered  = deliveries?.filter(d => d.status === 'Delivered').length ?? 0
  const delayed    = deliveries?.filter(d => d.status === 'Delayed').length ?? 0
  const totalFreight = deliveries?.reduce((sum, d) => sum + (d.freight_cost ?? 0), 0) ?? 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Logistics</h2>
        <p className="text-gray-500 text-sm mt-1">Track all inbound and outbound shipments.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Shipments</p>
          <p className="text-2xl font-bold text-gray-900">{deliveries?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">In Transit</p>
          <p className="text-2xl font-bold text-blue-600">{inTransit}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{delivered}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Freight Cost</p>
          <p className="text-2xl font-bold text-gray-900">
            RM {totalFreight.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Deliveries table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {deliveries && deliveries.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tracking No.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Carrier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">From</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">To</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ETA</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Freight (MYR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deliveries.map((d) => {
                const po = (d.purchase_orders as unknown) as { po_number: string } | null
                const so = (d.sales_orders as unknown) as { so_number: string } | null
                const ref = po?.po_number ?? so?.so_number ?? '—'
                const refColor = po ? 'text-blue-600' : 'text-orange-600'
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                      {d.tracking_number}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{d.carrier_name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[d.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-mono font-semibold ${refColor}`}>{ref}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{d.origin_address ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{d.destination_address ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {d.estimated_arrival ? new Date(d.estimated_arrival).toLocaleDateString('en-MY') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {(d.freight_cost ?? 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No deliveries found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
