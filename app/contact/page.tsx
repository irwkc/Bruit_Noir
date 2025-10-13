export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">Контакты</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Свяжитесь с нами</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:bruitnoir@mail.ru" className="text-black hover:text-gray-600 transition">
                  bruitnoir@mail.ru
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Телефон</h3>
                <a href="tel:+79206344846" className="text-black hover:text-gray-600 transition">
                  +7 (920) 634-48-46
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Социальные сети</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-black hover:text-gray-600 transition">
                    VK
                  </a>
                  <a href="#" className="block text-black hover:text-gray-600 transition">
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Напишите нам</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Контакты</h1>
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Contact Info Card */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4">Свяжитесь с нами</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-700">Email</h3>
                <a href="mailto:bruitnoir@mail.ru" className="text-sm text-black hover:text-gray-600 transition">
                  bruitnoir@mail.ru
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-700">Телефон</h3>
                <a href="tel:+79206344846" className="text-sm text-black hover:text-gray-600 transition">
                  +7 (920) 634-48-46
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-700">Социальные сети</h3>
                <div className="space-y-1">
                  <a href="#" className="block text-sm text-black hover:text-gray-600 transition">
                    VK
                  </a>
                  <a href="#" className="block text-sm text-black hover:text-gray-600 transition">
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4">Напишите нам</h2>
            
            <form className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Сообщение
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
              >
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

