import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ message: 'No file' }, { status: 400 })
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
