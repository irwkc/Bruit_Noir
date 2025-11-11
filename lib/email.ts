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

