import React from 'react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">О бренде Bruit Noir</h1>

        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-xl text-gray-600 leading-relaxed">
            Bruit Noir — это современный бренд уличной моды, который объединяет 
            минимализм, качество и индивидуальность.
          </p>

          <div className="my-12">
            <h2 className="text-3xl font-bold mb-4">Наша философия</h2>
            <p className="text-gray-700">
              Мы создаем одежду для тех, кто ценит комфорт и стиль. Каждая вещь 
              разработана с вниманием к деталям и изготовлена из качественных материалов.
            </p>
          </div>

          <div className="my-12">
            <h2 className="text-3xl font-bold mb-4">Качество превыше всего</h2>
            <p className="text-gray-700">
              Мы используем только проверенные материалы и работаем с надежными 
              производителями. Каждое изделие проходит строгий контроль качества.
            </p>
          </div>

          <div className="my-12">
            <h2 className="text-3xl font-bold mb-4">Устойчивое развитие</h2>
            <p className="text-gray-700">
              Мы заботимся об окружающей среде и стремимся к использованию 
              экологически чистых материалов и этичных производственных процессов.
            </p>
          </div>

          <div className="bg-black text-white p-8 rounded-lg my-12">
            <h2 className="text-3xl font-bold mb-4">Присоединяйтесь к нам</h2>
            <p className="mb-6">
              Станьте частью сообщества Bruit Noir и следите за новыми коллекциями.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">VK</a>
              <a href="#" className="hover:underline">Telegram</a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">О бренде</h1>
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-6 space-y-6">
          <p className="text-base text-gray-600 leading-relaxed">
            Bruit Noir — это современный бренд уличной моды, который объединяет 
            минимализм, качество и индивидуальность.
          </p>

          <div>
            <h2 className="text-xl font-bold mb-3">Наша философия</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Мы создаем одежду для тех, кто ценит комфорт и стиль. Каждая вещь 
              разработана с вниманием к деталям и изготовлена из качественных материалов.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Качество превыше всего</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Мы используем только проверенные материалы и работаем с надежными 
              производителями. Каждое изделие проходит строгий контроль качества.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Устойчивое развитие</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Мы заботимся об окружающей среде и стремимся к использованию 
              экологически чистых материалов и этичных производственных процессов.
            </p>
          </div>

          <div className="bg-black text-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-3">Присоединяйтесь к нам</h2>
            <p className="text-sm mb-4">
              Станьте частью сообщества Bruit Noir и следите за новыми коллекциями.
            </p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:underline">VK</a>
              <a href="#" className="hover:underline">Telegram</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

