export const metadata = {
  title: 'Политика конфиденциальности | Bruit Noir',
  description: 'Политика конфиденциальности интернет-магазина Bruit Noir',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Политика конфиденциальности</h1>
        
        <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 md:p-8 border border-white/20 space-y-6 text-gray-200">
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              <strong>Дата вступления в силу:</strong> {new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <p className="text-sm text-gray-400">
              <strong>Адрес страницы политики конфиденциальности:</strong>{' '}
              <a href="https://bruitnoir.ru/privacy" className="text-white hover:underline">
                https://bruitnoir.ru/privacy
              </a>
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей интернет-магазина Bruit Noir (далее — «Сайт»), расположенного по адресу: <a href="https://bruitnoir.ru" className="text-white hover:underline">https://bruitnoir.ru</a>.
            </p>
            <p>
              Используя Сайт, вы соглашаетесь с условиями настоящей Политики конфиденциальности. Если вы не согласны с условиями данной Политики, пожалуйста, не используйте Сайт.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Собираемая информация</h2>
            <p>При использовании Сайта мы можем собирать следующую информацию:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Фамилия, имя, отчество</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона</li>
              <li>Адрес доставки</li>
              <li>Информация о заказах и покупках</li>
              <li>Технические данные (IP-адрес, тип браузера, операционная система)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Цели использования информации</h2>
            <p>Собранная информация используется для следующих целей:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Обработка и выполнение заказов</li>
              <li>Связь с клиентами по вопросам заказов</li>
              <li>Отправка уведомлений о статусе заказов</li>
              <li>Улучшение качества обслуживания</li>
              <li>Обеспечение безопасности и предотвращение мошенничества</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Защита персональных данных</h2>
            <p>
              Мы применяем современные технологии и методы защиты для обеспечения безопасности ваших персональных данных. Все данные передаются по защищенному соединению (HTTPS).
            </p>
            <p>
              Мы не передаем ваши персональные данные третьим лицам, за исключением случаев, когда это необходимо для выполнения заказа (например, службам доставки) или требуется по законодательству.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Cookies</h2>
            <p>
              Сайт использует файлы cookie для улучшения пользовательского опыта. Вы можете отключить cookies в настройках вашего браузера, однако это может повлиять на функциональность Сайта.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">6. Права пользователей</h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Получать информацию о ваших персональных данных</li>
              <li>Требовать исправления неточных данных</li>
              <li>Требовать удаления ваших персональных данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">7. Контактная информация</h2>
            <p>
              По всем вопросам, связанным с обработкой персональных данных, вы можете обращаться:
            </p>
            <ul className="list-none space-y-2 ml-4">
              <li>Email: <a href="mailto:bruitnoirco@gmail.com" className="text-white hover:underline">bruitnoirco@gmail.com</a></li>
              <li>Телефон: <a href="tel:+79206344846" className="text-white hover:underline">+7 (920) 634-48-46</a></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">8. Изменения в Политике конфиденциальности</h2>
            <p>
              Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Все изменения вступают в силу с момента их публикации на Сайте. Рекомендуем периодически просматривать данную страницу для ознакомления с актуальной версией Политики.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

