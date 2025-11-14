import { NextRequest, NextResponse } from 'next/server'
import { sendContactFormEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Валидация
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Имя должно содержать минимум 2 символа' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный email адрес' },
        { status: 400 }
      )
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Сообщение должно содержать минимум 10 символов' },
        { status: 400 }
      )
    }

    // Отправка email
    const result = await sendContactFormEmail({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Ошибка при отправке сообщения. Попробуйте позже.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Сообщение успешно отправлено!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Ошибка при обработке запроса' },
      { status: 500 }
    )
  }
}

