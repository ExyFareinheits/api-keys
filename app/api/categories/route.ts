import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Category } from '@/types';

const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json');

interface CategoriesData {
  categories: Category[];
}

async function ensureDataFile() {
  try {
    await fs.access(CATEGORIES_FILE);
  } catch {
    await fs.mkdir(path.dirname(CATEGORIES_FILE), { recursive: true });
    const defaultCategories: Category[] = [
      { id: '1', name: 'Розробка', color: '#3B82F6', description: 'API ключі для розробки' },
      { id: '2', name: 'Продакшн', color: '#EF4444', description: 'Продакшн API ключі' },
      { id: '3', name: 'Тестування', color: '#10B981', description: 'Тестові API ключі' },
      { id: '4', name: 'Сторонні сервіси', color: '#F59E0B', description: 'Зовнішні API' },
    ];
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify({ categories: defaultCategories }, null, 2));
  }
}

async function readCategories(): Promise<Category[]> {
  await ensureDataFile();
  const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
  const parsed: CategoriesData = JSON.parse(data);
  return parsed.categories || [];
}

async function writeCategories(categories: Category[]): Promise<void> {
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify({ categories }, null, 2));
}

// GET - отримати всі категорії
export async function GET() {
  try {
    const categories = await readCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error reading categories:', error);
    return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
  }
}

// POST - створити нову категорію
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, description } = body;

    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 });
    }

    const categories = await readCategories();

    // Перевірка на дублікати
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
      description,
    };

    categories.push(newCategory);
    await writeCategories(categories);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT - оновити категорію
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, color, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const categories = await readCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);

    if (categoryIndex === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Перевірка на дублікати (якщо змінюється ім'я)
    if (name && name !== categories[categoryIndex].name) {
      if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === name.toLowerCase())) {
        return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
      }
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      ...(name && { name }),
      ...(color && { color }),
      ...(description !== undefined && { description }),
    };

    await writeCategories(categories);
    return NextResponse.json(categories[categoryIndex]);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE - видалити категорію
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const categories = await readCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);

    if (filteredCategories.length === categories.length) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await writeCategories(filteredCategories);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
