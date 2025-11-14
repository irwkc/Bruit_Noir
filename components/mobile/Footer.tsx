import Link from 'next/link'

export default function MobileFooter() {
  return (
    <footer className="bg-black text-white md:hidden">
      <div className="px-4 py-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">BRUIT NOIR</h3>
          <p className="text-gray-400 text-sm">
            Современный бренд одежды
          </p>
        </div>

        {/* Links - compact grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-semibold mb-3 text-sm">Магазин</h4>
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
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Информация</h4>
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
            </ul>
          </div>
        </div>

        {/* Contact - prominent for mobile */}
        <div className="text-center mb-6">
          <h4 className="font-semibold mb-3 text-sm">Контакты</h4>
          <div className="space-y-2">
            <a 
              href="mailto:bruitnoir@mail.ru" 
              className="block text-sm text-gray-400 hover:text-white transition"
            >
              bruitnoir@mail.ru
            </a>
            <a 
              href="tel:+79206344846" 
              className="block text-sm text-gray-400 hover:text-white transition"
            >
              +7 (920) 634-48-46
            </a>
          </div>
        </div>

        {/* Copyright - compact */}
        <div className="pt-4 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500 mb-1">
            © {new Date().getFullYear()} Bruit Noir. Все права защищены.
          </p>
          <p className="text-xs text-gray-500">
            ИНН: 623400937804
          </p>
          <p className="text-xs text-gray-500">
            ИП Сергиевская Екатерина Петровна
          </p>
        </div>
      </div>
    </footer>
  )
}
