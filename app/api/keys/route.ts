import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { ApiKey } from '@/types'
import { generateApiKey } from '@/utils/apiKeyUtils'

const DATA_FILE = path.join(process.cwd(), 'data', 'api_keys.json')

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, '[]')
  }
}

async function readKeys(): Promise<ApiKey[]> {
  await ensureDataFile()
  const data = await fs.readFile(DATA_FILE, 'utf-8')
  return JSON.parse(data)
}

async function writeKeys(keys: ApiKey[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(keys, null, 2))
}

export async function GET() {
  try {
    const keys = await readKeys()
    return NextResponse.json(keys)
  } catch (error) {
    console.error('Error reading keys:', error)
    return NextResponse.json({ error: 'Failed to read keys' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, keyLength = 32, permissions = [], encrypted = false, encryptedKey } = body

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 })
    }

    const keys = await readKeys()
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name,
      key: encryptedKey || generateApiKey(keyLength), // Use encrypted key if provided
      description,
      category,
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions,
      encrypted // Add encryption flag
    }

    keys.push(newKey)
    await writeKeys(keys)

    return NextResponse.json(newKey, { status: 201 })
  } catch (error) {
    console.error('Error creating key:', error)
    return NextResponse.json({ error: 'Failed to create key' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const keys = await readKeys()
    const keyIndex = keys.findIndex(key => key.id === id)

    if (keyIndex === -1) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    keys[keyIndex] = { ...keys[keyIndex], ...updates }
    await writeKeys(keys)

    return NextResponse.json(keys[keyIndex])
  } catch (error) {
    console.error('Error updating key:', error)
    return NextResponse.json({ error: 'Failed to update key' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const keys = await readKeys()
    const filteredKeys = keys.filter(key => key.id !== id)

    if (filteredKeys.length === keys.length) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    await writeKeys(filteredKeys)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting key:', error)
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 })
  }
}