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
                        <div style="display: inline-block; background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%); padding: 20px 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);">
                          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
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

