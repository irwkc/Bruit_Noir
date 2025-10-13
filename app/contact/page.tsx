export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">Контакты</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Свяжитесь с нами</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:info@bruitnoir.com" className="text-blue-600 hover:underline">
                  info@bruitnoir.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Телефон</h3>
                <a href="tel:+79991234567" className="text-blue-600 hover:underline">
                  +7 (999) 123-45-67
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Социальные сети</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-blue-600 hover:underline">
                    Instagram
                  </a>
                  <a href="#" className="block text-blue-600 hover:underline">
                    VK
                  </a>
                  <a href="#" className="block text-blue-600 hover:underline">
                    Telegram
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Режим работы</h3>
                <p className="text-gray-600">
                  Понедельник - Пятница: 10:00 - 20:00<br />
                  Суббота - Воскресенье: 11:00 - 19:00
                </p>
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
    </div>
  )
}

