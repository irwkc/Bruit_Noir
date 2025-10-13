import Link from 'next/link'

export default function MobileAboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-gray-600">
            ← Назад
          </Link>
          <h1 className="text-lg font-semibold">О бренде</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="pb-8">
        {/* Hero Section */}
        <div className="bg-black text-white py-12 px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">BRUIT NOIR</h1>
            <p className="text-lg text-gray-200">
              Современный бренд уличной моды
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-8 space-y-8">
          {/* Philosophy */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Философия бренда</h2>
            <p className="text-gray-600 leading-relaxed">
              Bruit Noir — это не просто одежда, это образ жизни. Мы создаем вещи для тех, 
              кто не боится выделяться и выражать свою индивидуальность через стиль.
            </p>
          </div>

          {/* Quality */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Качество</h2>
            <p className="text-gray-600 leading-relaxed">
              Каждая вещь проходит строгий контроль качества. Мы используем только 
              отборные материалы и уделяем внимание каждой детали, чтобы наши 
              клиенты получали продукцию высочайшего уровня.
            </p>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Наши ценности</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-600">
                  <strong>Аутентичность</strong> — мы остаемся верными себе и не следуем трендам ради трендов
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-600">
                  <strong>Качество</strong> — каждая деталь продумана и выполнена на высшем уровне
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-600">
                  <strong>Индивидуальность</strong> — мы помогаем выразить вашу уникальность
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Свяжитесь с нами</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <a 
                  href="mailto:bruitnoir@mail.ru" 
                  className="text-black font-medium hover:underline"
                >
                  bruitnoir@mail.ru
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Телефон</p>
                <a 
                  href="tel:+79206344846" 
                  className="text-black font-medium hover:underline"
                >
                  +7 (920) 634-48-46
                </a>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/catalog"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Смотреть коллекцию
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
