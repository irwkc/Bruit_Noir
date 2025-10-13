import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop: Brand takes full width, then 3 columns */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">BRUIT NOIR</h3>
            <p className="text-gray-400 text-sm">
              Современный бренд одежды для тех, кто ценит стиль и качество
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Магазин</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/catalog" className="hover:text-white transition">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=new" className="hover:text-white transition">
                  Новинки
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=sale" className="hover:text-white transition">
                  Распродажа
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition">
                  Доставка
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition">
                  Возврат
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:bruitnoir@mail.ru" className="hover:text-white transition">
                  bruitnoir@mail.ru
                </a>
              </li>
              <li>
                <a href="tel:+79206344846" className="hover:text-white transition">
                  +7 (920) 634-48-46
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Обратная связь
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile: Brand on top, then 3 columns in one row */}
        <div className="md:hidden">
          {/* Brand */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3">BRUIT NOIR</h3>
            <p className="text-gray-400 text-xs">
              Современный бренд одежды для тех, кто ценит стиль и качество
            </p>
          </div>

          {/* 3 columns in one row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Shop */}
            <div>
              <h4 className="font-semibold mb-2 text-xs">Магазин</h4>
              <ul className="space-y-1.5 text-[10px] text-gray-400">
                <li>
                  <Link href="/catalog" className="hover:text-white transition">
                    Каталог
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=new" className="hover:text-white transition">
                    Новинки
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=sale" className="hover:text-white transition">
                    Распродажа
                  </Link>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-semibold mb-2 text-xs">Инфо</h4>
              <ul className="space-y-1.5 text-[10px] text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    О нас
                  </Link>
                </li>
                <li>
                  <Link href="/delivery" className="hover:text-white transition">
                    Доставка
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition">
                    Возврат
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-2 text-xs">Контакты</h4>
              <ul className="space-y-1.5 text-[10px] text-gray-400">
                <li>
                  <a href="mailto:bruitnoir@mail.ru" className="hover:text-white transition break-all leading-tight">
                    bruitnoir@<br/>mail.ru
                  </a>
                </li>
                <li>
                  <a href="tel:+79206344846" className="hover:text-white transition whitespace-nowrap">
                    +7 920 634-48-46
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    Связь
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Bruit Noir. Все права защищены.
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            ИНН: 623410944590
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">
            СЗ Сергиевский Егор Андреевич
          </p>
        </div>
      </div>
    </footer>
  )
}

