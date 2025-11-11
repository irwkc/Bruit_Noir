import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authenticateAdminToken } from '@/lib/adminAuth'

async function ensureAdmin() {
  const token = (await cookies()).get('admin_access_token')?.value
  if (!token) {
    redirect('/admin')
  }

  try {
    await authenticateAdminToken(token)
  } catch (error) {
    console.warn('Admin access denied:', error)
    redirect('/admin')
  }
}

export default async function AdminDashboard() {
  await ensureAdmin()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Админка</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/products/new" className="block rounded-xl border bg-white p-6 hover:shadow">
          <div className="text-xl font-semibold mb-2">Добавить товар</div>
          <div className="text-gray-600 text-sm">Создать новый продукт</div>
        </Link>
        <Link href="/admin/products" className="block rounded-xl border bg-white p-6 hover:shadow">
          <div className="text-xl font-semibold mb-2">Товары</div>
          <div className="text-gray-600 text-sm">Список и редактирование</div>
        </Link>
        <Link href="/admin/orders" className="block rounded-xl border bg-white p-6 hover:shadow">
          <div className="text-xl font-semibold mb-2">Заказы</div>
          <div className="text-gray-600 text-sm">Управление заказами</div>
        </Link>
      </div>
    </div>
  )
}


