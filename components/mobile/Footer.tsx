import Link from 'next/link'
import Image from 'next/image'

export default function MobileFooter() {
  return (
    <footer className="bg-black text-white md:hidden">
      <div className="px-4 py-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="mb-2 flex justify-center">
            <Image
              src="/logo.png"
              alt="Bruit Noir"
              width={150}
              height={33}
              className="h-6 w-auto"
            />
          </div>
          <p className="text-gray-400 text-sm">
            Современный бренд одежды
          </p>
        </div>

        {/* Links and Contact - side by side */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Information */}
          <div className="text-center">
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

          {/* Contact */}
          <div className="text-center">
            <h4 className="font-semibold mb-3 text-sm">Контакты</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a 
                href="mailto:bruitnoirco@gmail.com" 
                className="block hover:text-white transition"
              >
                bruitnoirco@gmail.com
              </a>
              <a 
                href="tel:+79206344846" 
                className="block hover:text-white transition"
              >
                +7 (920) 634-48-46
              </a>
              <Link 
                href="/contact" 
                className="block hover:text-white transition"
              >
                Обратная связь
              </Link>
            </div>
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
