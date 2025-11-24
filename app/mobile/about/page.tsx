import Link from 'next/link'

export default function MobileAboutPage() {
  return (
    <div className="min-h-screen">
      <div className="pb-8">
        {/* Content */}
        <div className="px-4 py-8 space-y-6">
          <h1 className="text-2xl font-bold text-white mb-4">О бренде</h1>
          
          {/* Philosophy */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Философия бренда</h2>
            <p className="text-gray-300 leading-relaxed">
              Bruit Noir — это не просто одежда, это образ жизни. Мы создаем вещи для тех, 
              кто не боится выделяться и выражать свою индивидуальность через стиль.
            </p>
          </div>

          {/* Quality */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Качество</h2>
            <p className="text-gray-300 leading-relaxed">
              Каждая вещь проходит строгий контроль качества. Мы используем только 
              отборные материалы и уделяем внимание каждой детали, чтобы наши 
              клиенты получали продукцию высочайшего уровня.
            </p>
          </div>

          {/* Values */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Наши ценности</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">
                  <strong className="text-white">Аутентичность</strong> — мы остаемся верными себе и не следуем трендам ради трендов
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">
                  <strong className="text-white">Качество</strong> — каждая деталь продумана и выполнена на высшем уровне
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300">
                  <strong className="text-white">Индивидуальность</strong> — мы помогаем выразить вашу уникальность
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Свяжитесь с нами</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-300 mb-1">Email</p>
                <a 
                  href="mailto:bruitnoirco@gmail.com" 
                  className="text-white font-medium hover:underline"
                >
                  bruitnoirco@gmail.com
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-300 mb-1">Телефон</p>
                <a 
                  href="tel:+79206344846" 
                  className="text-white font-medium hover:underline"
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
              className="inline-block bg-white/10 backdrop-blur-2xl text-white px-8 py-3 rounded-full font-semibold border border-white/20 hover:bg-white/20 transition"
            >
              Смотреть коллекцию
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
