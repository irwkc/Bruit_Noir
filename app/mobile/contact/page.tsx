import Link from 'next/link'

export default function MobileContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-gray-600">
            ← Назад
          </Link>
          <h1 className="text-lg font-semibold">Контакты</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="pb-8">
        {/* Hero Section */}
        <div className="bg-black text-white py-12 px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Свяжитесь с нами</h1>
            <p className="text-lg text-gray-200">
              Мы всегда рады помочь и ответить на ваши вопросы
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="px-4 py-8 space-y-6">
          {/* Email */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <a 
                  href="mailto:bruitnoir@mail.ru" 
                  className="text-gray-600 hover:text-black transition"
                >
                  bruitnoir@mail.ru
                </a>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                <a 
                  href="tel:+79206344846" 
                  className="text-gray-600 hover:text-black transition"
                >
                  +7 (920) 634-48-46
                </a>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Время работы</h3>
                <p className="text-gray-600">Пн-Пт: 9:00 - 18:00</p>
                <p className="text-gray-600">Сб-Вс: 10:00 - 16:00</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Частые вопросы</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Как оформить заказ?</h4>
                <p className="text-sm text-gray-600">
                  Выберите товар, добавьте в корзину и перейдите к оформлению заказа.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Способы доставки</h4>
                <p className="text-sm text-gray-600">
                  Доставка по всей России. Курьерская доставка и пункты выдачи.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Возврат товара</h4>
                <p className="text-sm text-gray-600">
                  Возврат в течение 14 дней без объяснения причин.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-3">
            <Link
              href="/catalog"
              className="block w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Перейти в каталог
            </Link>
            <Link
              href="/about"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              О бренде
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
