import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminLoginPage from './login/page'

export default async function AdminEntry() {
  const adminToken = (await cookies()).get('admin_token')?.value
  if (adminToken) {
    redirect('/admin/dashboard')
  }
  return <AdminLoginPage />
}
