import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'

function ScoreBar({ score }: { score: number }) {
  const stars = Math.round(score)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{score.toFixed(1)}</span>
    </div>
  )
}

export default async function SuppliersPage() {
  const supabase = await createClient()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('performance_score', { ascending: false })

  const avgScore = suppliers && suppliers.length > 0
    ? (suppliers.reduce((sum, s) => sum + (s.performance_score ?? 0), 0) / suppliers.length).toFixed(2)
    : '0.00'

  const avgLeadTime = suppliers && suppliers.length > 0
    ? Math.round(suppliers.reduce((sum, s) => sum + (s.lead_time_days ?? 0), 0) / suppliers.length)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
        <p className="text-gray-500 text-sm mt-1">Manage and monitor supplier performance.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Suppliers</p>
          <p className="text-2xl font-bold text-gray-900">{suppliers?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Avg. Performance</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-yellow-500">{avgScore}</p>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Avg. Lead Time</p>
          <p className="text-2xl font-bold text-gray-900">{avgLeadTime} <span className="text-sm font-normal text-gray-500">days</span></p>
        </div>
      </div>

      {/* Suppliers table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Payment Terms</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Lead Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Performance</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers?.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{supplier.name}</p>
                  <p className="text-xs text-gray-400">{supplier.country}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{supplier.contact_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{supplier.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{supplier.payment_terms}</td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {supplier.lead_time_days}d
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ScoreBar score={supplier.performance_score ?? 0} />
                </td>
                <td className="px-4 py-3 text-center">
                  {supplier.is_active ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Active</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">Inactive</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
