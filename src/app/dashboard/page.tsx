import { createClient } from '@/lib/supabase/server'
import {
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  TrendingUp,
  Warehouse,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 从数据库读取真实数据
  const [
    { count: totalProducts },
    { count: totalSuppliers },
    { count: activePOs },
    { count: lowStockItems },
    { count: inTransitDeliveries },
    { count: totalSOs },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).in('status', ['Approved', 'Shipped']),
    supabase.from('inventory').select('*, products!inner(reorder_point)', { count: 'exact', head: true }),
    supabase.from('deliveries').select('*', { count: 'exact', head: true }).eq('status', 'In Transit'),
    supabase.from('sales_orders').select('*', { count: 'exact', head: true }).in('status', ['Confirmed', 'Processing']),
  ])

  const kpis = [
    {
      title: 'Total Products',
      value: totalProducts ?? 0,
      icon: Package,
      color: 'bg-blue-500',
      description: 'Active products in catalog',
    },
    {
      title: 'Active Suppliers',
      value: totalSuppliers ?? 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'Verified suppliers',
    },
    {
      title: 'Purchase Orders',
      value: activePOs ?? 0,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      description: 'Approved & in transit',
    },
    {
      title: 'Sales Orders',
      value: totalSOs ?? 0,
      icon: Warehouse,
      color: 'bg-orange-500',
      description: 'Confirmed & processing',
    },
    {
      title: 'In Transit',
      value: inTransitDeliveries ?? 0,
      icon: Truck,
      color: 'bg-cyan-500',
      description: 'Active deliveries',
    },
    {
      title: 'Low Stock Alert',
      value: lowStockItems ?? 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'Items need reorder',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.description}</p>
                </div>
                <div className={`${kpi.color} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
