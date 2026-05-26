import { createClient } from '@/lib/supabase/server'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertTriangle, PackageCheck, Layers } from 'lucide-react'

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType; sign: string }> = {
  'Goods Receipt':  { label: 'Goods Receipt',  color: 'text-green-600 bg-green-50',  icon: PackageCheck,    sign: '+' },
  'Stock In':       { label: 'Stock In',        color: 'text-blue-600 bg-blue-50',    icon: ArrowDownCircle, sign: '+' },
  'Stock Out':      { label: 'Stock Out',       color: 'text-orange-600 bg-orange-50',icon: ArrowUpCircle,   sign: '-' },
  'Allocation':     { label: 'Allocation',      color: 'text-purple-600 bg-purple-50',icon: Layers,          sign: '' },
  'Adjustment':     { label: 'Adjustment',      color: 'text-gray-600 bg-gray-100',   icon: RefreshCw,       sign: '±' },
  'Damaged':        { label: 'Damaged',         color: 'text-red-600 bg-red-50',      icon: AlertTriangle,   sign: '-' },
}

export default async function WarehousePage() {
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from('warehouse_transactions')
    .select(`
      id,
      transaction_type,
      quantity,
      source_bin,
      destination_bin,
      reference_id,
      created_at,
      products ( sku, name )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Summary counts
  const totalIn  = transactions?.filter(t => ['Goods Receipt','Stock In'].includes(t.transaction_type)).length ?? 0
  const totalOut = transactions?.filter(t => ['Stock Out','Damaged'].includes(t.transaction_type)).length ?? 0
  const totalAdj = transactions?.filter(t => t.transaction_type === 'Adjustment').length ?? 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Warehouse</h2>
        <p className="text-gray-500 text-sm mt-1">Full audit trail of all warehouse movements.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Stock In Transactions</p>
          <p className="text-2xl font-bold text-green-600">{totalIn}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Stock Out Transactions</p>
          <p className="text-2xl font-bold text-orange-500">{totalOut}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Adjustments</p>
          <p className="text-2xl font-bold text-gray-700">{totalAdj}</p>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {transactions && transactions.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Qty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">From</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">To</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((t) => {
                const product = t.products as { sku: string; name: string } | null
                const cfg = typeConfig[t.transaction_type] ?? typeConfig['Adjustment']
                const Icon = cfg.icon
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{product?.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{product?.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {cfg.sign}{Math.abs(t.quantity)}
                    </td>
                    <td className="px-4 py-3">
                      {t.source_bin ? (
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{t.source_bin}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {t.destination_bin ? (
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{t.destination_bin}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.reference_id ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(t.created_at).toLocaleDateString('en-MY')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <PackageCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No warehouse transactions yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
