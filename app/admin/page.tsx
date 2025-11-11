import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminLoginPage from './login/page'
import { authenticateAdminToken } from '@/lib/adminAuth'

export default async function AdminEntry() {
  const token = (await cookies()).get('admin_access_token')?.value

  if (token) {
    try {
      await authenticateAdminToken(token)
      redirect('/admin/dashboard')
    } catch (error) {
      console.warn('Invalid admin cookie:', error)
    }
  }

  return <AdminLoginPage />
}
