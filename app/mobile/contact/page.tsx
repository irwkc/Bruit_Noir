import Link from 'next/link'

export default function MobileContactPage() {
  return (
    <div className="min-h-screen">
      <div className="pb-8">
        {/* Contact Info */}
        <div className="px-4 py-8 space-y-6">
          <h1 className="text-2xl font-bold text-white mb-4">Контакты</h1>
          
          {/* Email */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Email</h3>
                <a 
                  href="mailto:bruitnoirco@gmail.com" 
                  className="text-gray-300 hover:text-white transition"
                >
                  bruitnoirco@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Телефон</h3>
                <a 
                  href="tel:+79206344846" 
                  className="text-gray-300 hover:text-white transition"
                >
                  +7 (920) 634-48-46
                </a>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Время работы</h3>
                <p className="text-gray-300">Пн-Пт: 9:00 - 18:00</p>
                <p className="text-gray-300">Сб-Вс: 10:00 - 16:00</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <h3 className="font-semibold text-white mb-4">Частые вопросы</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-1">Как оформить заказ?</h4>
                <p className="text-sm text-gray-300">
                  Выберите товар, добавьте в корзину и перейдите к оформлению заказа.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Способы доставки</h4>
                <p className="text-sm text-gray-300">
                  Доставка по всей России. Курьерская доставка и пункты выдачи.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Возврат товара</h4>
                <p className="text-sm text-gray-300">
                  Возврат в течение 14 дней без объяснения причин.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-3">
            <Link
              href="/catalog"
              className="block w-full bg-white/10 backdrop-blur-2xl text-white py-3 rounded-full font-semibold border border-white/20 hover:bg-white/20 transition"
            >
              Перейти в каталог
            </Link>
            <Link
              href="/about"
              className="block w-full border border-white/20 bg-white/10 backdrop-blur-2xl text-white py-3 rounded-full font-semibold hover:bg-white/20 transition"
            >
              О бренде
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
