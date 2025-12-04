import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_PREFIX = 'image/'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ message: 'No file' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: 'Файл слишком большой. Максимальный размер — 10 МБ.' },
      { status: 413 }
    )
  }

  if (file.type && !file.type.startsWith(ALLOWED_MIME_PREFIX)) {
    return NextResponse.json(
      { message: 'Можно загружать только изображения.' },
      { status: 400 }
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadsDir, { recursive: true })

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_/]/g, '')}`
  const filePath = path.join(uploadsDir, safeName)
  await fs.writeFile(filePath, buffer)

  const url = `/uploads/${safeName}`
  return NextResponse.json({ url })
}
