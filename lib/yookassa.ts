import crypto from 'crypto'

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY
const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3'

if (process.env.NODE_ENV === 'development') {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    // eslint-disable-next-line no-console
    console.warn('[yookassa] YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY is not set. Card payments will be unavailable.')
  }
}

export interface YooKassaPayment {
  id: string
  status: string
  paid: boolean
  amount: {
    value: string
    currency: string
  }
  confirmation?: {
    type: string
    confirmation_url?: string
  }
  description?: string
}

interface CreatePaymentParams {
  amount: number
  currency?: string
  description: string
  returnUrl: string
  metadata?: Record<string, unknown>
  customerEmail?: string
  customerPhone?: string
}

export async function createYooKassaPayment(params: CreatePaymentParams): Promise<YooKassaPayment> {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    throw new Error('YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY is not configured')
  }

  const idempotenceKey = crypto.randomUUID()
  const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')

  const value = params.amount.toFixed(2)

  const body: any = {
    amount: {
      value,
      currency: params.currency ?? 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: params.returnUrl,
    },
    description: params.description.slice(0, 128),
    metadata: params.metadata ?? {},
  }

  // Чек отправляем только если есть email покупателя
  // Если чек не нужен для магазина, можно убрать этот блок
  if (params.customerEmail) {
    body.receipt = {
      tax_system_code: 1,
      customer: {
        email: params.customerEmail,
      },
      items: [
        {
          description: params.description.slice(0, 128),
          quantity: '1.00',
          amount: {
            value,
            currency: params.currency ?? 'RUB',
          },
          vat_code: 1,
          payment_subject: 'commodity',
          payment_method: 'full_prepayment',
          payment_mode: 'full_prepayment',
        },
      ],
    }
  }

  const res = await fetch(`${YOOKASSA_API_URL}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Idempotence-Key': idempotenceKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`YooKassa error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as YooKassaPayment
  return data
}


