import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authenticateAdminToken } from '@/lib/adminAuth'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'

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

export default async function AdminAnalyticsPage() {
  await ensureAdmin()

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}

