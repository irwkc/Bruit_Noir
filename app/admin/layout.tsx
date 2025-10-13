import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50">
        <header className="h-14 border-b bg-black text-white flex items-center px-4">
          <Link href="/" className="text-lg font-semibold">Bruit Noir</Link>
        </header>
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </body>
    </html>
  )}


