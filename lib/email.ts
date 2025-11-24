import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'bruitnoir_info@mail.ru',
    pass: process.env.EMAIL_PASSWORD || 'yKqlar79cRZUjwYTzodF',
  },
})

export async function sendVerificationEmail(email: string, code: string, name?: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Подтверждение email - Bruit Noir</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #000000; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);">
                  <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">
                    BRUIT NOIR
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px; background-color: #000000;">
                  ${name ? `<p style="margin: 0 0 20px; font-size: 18px; color: #ffffff;">Привет, ${name}!</p>` : ''}
                  
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                    Спасибо за регистрацию на Bruit Noir. Для завершения регистрации введите код подтверждения:
                  </p>
                  
                  <!-- Verification Code -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <div style="display: inline-block; background: #ffffff; padding: 20px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border: 2px solid #000000;">
                          <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace; text-shadow: none;">
                            ${code}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                    Код действителен в течение <strong style="color: #ffffff;">10 минут</strong>. Если вы не регистрировались на Bruit Noir, просто проигнорируйте это письмо.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #0a0a0a; border-top: 1px solid #1a1a1a;">
                  <p style="margin: 0 0 10px; font-size: 12px; color: #666666; text-align: center;">
                    © ${new Date().getFullYear()} Bruit Noir. Все права защищены.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #666666; text-align: center;">
                    Современный бренд одежды для тех, кто ценит стиль и качество
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
Привет${name ? `, ${name}` : ''}!

Спасибо за регистрацию на Bruit Noir.

Ваш код подтверждения: ${code}

Код действителен в течение 10 минут.

Если вы не регистрировались на Bruit Noir, просто проигнорируйте это письмо.

---
© ${new Date().getFullYear()} Bruit Noir
Современный бренд одежды для тех, кто ценит стиль и качество
  `

  try {
    await transporter.sendMail({
      from: '"Bruit Noir" <bruitnoir_info@mail.ru>',
      to: email,
      subject: 'Подтверждение email - Bruit Noir',
      text: textContent,
      html: htmlContent,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendContactFormEmail(data: {
  name: string
  email: string
  message: string
}) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Новое сообщение с формы обратной связи - Bruit Noir</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #000000; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);">
                  <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">
                    BRUIT NOIR
                  </h1>
                  <p style="margin: 10px 0 0; font-size: 16px; color: #cccccc;">
                    Новое сообщение с формы обратной связи
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px; background-color: #000000;">
                  <div style="margin-bottom: 30px;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #999999;">Имя:</p>
                    <p style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 600;">${data.name}</p>
                  </div>
                  
                  <div style="margin-bottom: 30px;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #999999;">Email:</p>
                    <p style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 600;">
                      <a href="mailto:${data.email}" style="color: #ffffff; text-decoration: none;">${data.email}</a>
                    </p>
                  </div>
                  
                  <div style="margin-bottom: 30px;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #999999;">Сообщение:</p>
                    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 3px solid #ffffff;">
                      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #cccccc; white-space: pre-wrap;">${data.message}</p>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #0a0a0a; border-top: 1px solid #1a1a1a;">
                  <p style="margin: 0 0 10px; font-size: 12px; color: #666666; text-align: center;">
                    © ${new Date().getFullYear()} Bruit Noir. Все права защищены.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #666666; text-align: center;">
                    Это автоматическое уведомление с сайта Bruit Noir
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
Новое сообщение с формы обратной связи - Bruit Noir

Имя: ${data.name}
Email: ${data.email}

Сообщение:
${data.message}

---
© ${new Date().getFullYear()} Bruit Noir
Это автоматическое уведомление с сайта Bruit Noir
  `

  try {
    await transporter.sendMail({
      from: '"Bruit Noir" <bruitnoir_info@mail.ru>',
      to: 'bruitnoirco@gmail.com',
      replyTo: data.email,
      subject: `Новое сообщение с формы обратной связи от ${data.name}`,
      text: textContent,
      html: htmlContent,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending contact form email:', error)
    return { success: false, error }
  }
}

export async function sendNewOrderNotification(to: string, order: {
  id: string
  total: number
  customerName: string
  customerEmail: string
  customerPhone: string
  createdAt: Date
  items: { name: string; quantity: number; price: number; size: string; color: string }[]
}) {
  const formatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
  const orderTotal = formatter.format(order.total)
  const createdAt = order.createdAt.toLocaleString('ru-RU')

  const itemsTable = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #111;"><strong>${item.name}</strong><br><span style="color:#666; font-size:12px;">Размер: ${item.size} · Цвет: ${item.color}</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #111; text-align:center;">${item.quantity} шт.</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #111; text-align:right;">${formatter.format(item.price)}</td>
        </tr>`
    )
    .join('')

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f4f4f4; padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.12);">
        <div style="background:#000;padding:32px 28px; color:#fff;">
          <h1 style="margin:0;font-size:24px;letter-spacing:4px;">BRUIT NOIR</h1>
          <p style="margin-top:12px;color:#d1d1d1;font-size:14px;">Новый заказ #${order.id.slice(0, 8)}</p>
        </div>
        <div style="padding:28px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#111;">Детали заказа</h2>
          <p style="margin:0 0 8px;color:#444;font-size:14px;">Сумма заказа: <strong>${orderTotal}</strong></p>
          <p style="margin:0 0 8px;color:#444;font-size:14px;">Оформлен: ${createdAt}</p>
          <p style="margin:0 0 16px;color:#444;font-size:14px;">Клиент: ${order.customerName} · ${order.customerEmail} · ${order.customerPhone}</p>

          <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:12px;overflow:hidden;font-size:14px;">
            <thead>
              <tr style="background:#f7f7f7;text-align:left;">
                <th style="padding:10px 12px;color:#555;font-weight:600;">Товар</th>
                <th style="padding:10px 12px;color:#555;font-weight:600;text-align:center;">Количество</th>
                <th style="padding:10px 12px;color:#555;font-weight:600;text-align:right;">Цена</th>
              </tr>
            </thead>
            <tbody>${itemsTable}</tbody>
          </table>
        </div>
        <div style="background:#fafafa;padding:20px 28px;color:#777;font-size:12px;text-align:center;">
          <p style="margin:0;">Это автоматическое уведомление. Ответ на него не требуется.</p>
          <p style="margin:8px 0 0;">© ${new Date().getFullYear()} Bruit Noir</p>
        </div>
      </div>
    </div>
  `

  const textContent = [
    `Новый заказ #${order.id}`,
    `Сумма: ${orderTotal}`,
    `Дата: ${createdAt}`,
    `Клиент: ${order.customerName} (${order.customerEmail}, ${order.customerPhone})`,
    '',
    'Товары:',
    ...order.items.map(
      (item) => `- ${item.name} · ${item.quantity} шт. · ${formatter.format(item.price)} · Размер ${item.size} · Цвет ${item.color}`
    ),
  ].join('\n')

  try {
    await transporter.sendMail({
      from: 'Bruit Noir <bruitnoir_info@mail.ru>',
      to,
      subject: `Новый заказ #${order.id.slice(0, 8)} на сумму ${orderTotal}`,
      text: textContent,
      html: htmlContent,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending order notification:', error)
    return { success: false, error }
  }
}

export async function sendOrderShippedNotification(
  to: string,
  order: {
    id: string
    customerName: string
    items: { name: string; quantity: number; price: number; size: string; color: string }[]
    total: number
    deliveryPoint: { name: string; address: string; city: string; phone?: string | null } | null
  }
) {
  const formatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
  const orderTotal = formatter.format(order.total)

  const itemsTable = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; color: #111;">
            <strong>${item.name}</strong><br>
            <span style="color:#666; font-size:12px;">Размер: ${item.size} · Цвет: ${item.color}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; color: #111; text-align:center;">${item.quantity} шт.</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; color: #111; text-align:right;">${formatter.format(item.price)}</td>
        </tr>`
    )
    .join('')

  const deliveryInfo = order.deliveryPoint
    ? `
      <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px; font-size: 16px; color: #111;">Пункт выдачи:</h3>
        <p style="margin: 0 0 8px; color: #444; font-size: 14px;"><strong>${order.deliveryPoint.name}</strong></p>
        <p style="margin: 0 0 8px; color: #444; font-size: 14px;">${order.deliveryPoint.address}</p>
        <p style="margin: 0 0 8px; color: #444; font-size: 14px;">${order.deliveryPoint.city}</p>
        ${order.deliveryPoint.phone ? `<p style="margin: 8px 0 0; color: #444; font-size: 14px;">Телефон: ${order.deliveryPoint.phone}</p>` : ''}
      </div>
    `
    : ''

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ваш заказ отправлен - Bruit Noir</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #000000; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);">
                  <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">
                    BRUIT NOIR
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px; background-color: #000000;">
                  <p style="margin: 0 0 20px; font-size: 18px; color: #ffffff;">
                    Здравствуйте, ${order.customerName}!
                  </p>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                    Ваш заказ <strong style="color: #ffffff;">#${order.id.slice(0, 8)}</strong> был отправлен и скоро поступит в пункт выдачи.
                  </p>

                  <div style="background-color: #1a1a1a; padding: 24px; border-radius: 8px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 20px; font-size: 20px; color: #ffffff;">Детали заказа</h2>
                    
                    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                      <thead>
                        <tr style="border-bottom: 1px solid #333;">
                          <th style="padding: 10px 0; color: #999; font-weight: 600; text-align: left;">Товар</th>
                          <th style="padding: 10px 0; color: #999; font-weight: 600; text-align: center;">Кол-во</th>
                          <th style="padding: 10px 0; color: #999; font-weight: 600; text-align: right;">Цена</th>
                        </tr>
                      </thead>
                      <tbody>${itemsTable}</tbody>
                    </table>

                    <div style="border-top: 1px solid #333; padding-top: 16px; margin-top: 16px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 18px; color: #ffffff; font-weight: 600;">Итого:</span>
                        <span style="font-size: 20px; color: #ffffff; font-weight: bold;">${orderTotal}</span>
                      </div>
                    </div>
                  </div>

                  ${deliveryInfo}

                  <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                    Вы получите уведомление, когда заказ поступит в пункт выдачи. Спасибо за покупку!
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #0a0a0a; border-top: 1px solid #1a1a1a;">
                  <p style="margin: 0 0 10px; font-size: 12px; color: #666666; text-align: center;">
                    © ${new Date().getFullYear()} Bruit Noir. Все права защищены.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #666666; text-align: center;">
                    Современный бренд одежды для тех, кто ценит стиль и качество
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
Здравствуйте, ${order.customerName}!

Ваш заказ #${order.id.slice(0, 8)} был отправлен и скоро поступит в пункт выдачи.

Детали заказа:
${order.items.map((item) => `- ${item.name} · ${item.quantity} шт. · ${formatter.format(item.price)} · Размер ${item.size} · Цвет ${item.color}`).join('\n')}

Итого: ${orderTotal}

${order.deliveryPoint ? `Пункт выдачи:\n${order.deliveryPoint.name}\n${order.deliveryPoint.address}\n${order.deliveryPoint.city}${order.deliveryPoint.phone ? `\nТелефон: ${order.deliveryPoint.phone}` : ''}` : ''}

Вы получите уведомление, когда заказ поступит в пункт выдачи. Спасибо за покупку!

---
© ${new Date().getFullYear()} Bruit Noir
Современный бренд одежды для тех, кто ценит стиль и качество
  `

  try {
    await transporter.sendMail({
      from: '"Bruit Noir" <bruitnoir_info@mail.ru>',
      to,
      subject: `Ваш заказ #${order.id.slice(0, 8)} отправлен - Bruit Noir`,
      text: textContent,
      html: htmlContent,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending order shipped notification:', error)
    return { success: false, error }
  }
}

