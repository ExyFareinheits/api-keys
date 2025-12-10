'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Category } from '@/types'
import { getDefaultCategories } from '@/utils/apiKeyUtils'
import { 
  Plus, 
  FolderOpen, 
  Edit2, 
  Trash2, 
  Palette
} from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = () => {
    const saved = localStorage.getItem('api_key_categories')
    if (saved) {
      setCategories(JSON.parse(saved))
    } else {
      const defaultCategories = getDefaultCategories()
      setCategories(defaultCategories)
      localStorage.setItem('api_key_categories', JSON.stringify(defaultCategories))
    }
  }

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories)
    localStorage.setItem('api_key_categories', JSON.stringify(newCategories))
  }

  const handleCreateCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString()
    }
    saveCategories([...categories, newCategory])
    setShowCreateModal(false)
  }

  const handleUpdateCategory = (categoryData: Omit<Category, 'id'>) => {
    if (!editingCategory) return
    
    const updatedCategories = categories.map(cat => 
      cat.id === editingCategory.id ? { ...categoryData, id: editingCategory.id } : cat
    )
    saveCategories(updatedCategories)
    setEditingCategory(null)
  }

  const handleDeleteCategory = (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю категорію?')) return
    
    const filteredCategories = categories.filter(cat => cat.id !== id)
    saveCategories(filteredCategories)
  }

  const colorOptions = [
    { value: '#3B82F6', name: 'Синій' },
    { value: '#10B981', name: 'Зелений' },
    { value: '#EF4444', name: 'Червоний' },
    { value: '#F59E0B', name: 'Жовтий' },
    { value: '#8B5CF6', name: 'Фіолетовий' },
    { value: '#EC4899', name: 'Рожевий' },
    { value: '#6B7280', name: 'Сірий' },
  ]

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Категорії</h1>
            <p className="text-gray-600 mt-1">Керування категоріями для організації ваших API ключів</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Додати категорію</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-500 mb-4">{category.description}</p>
              )}
              
              <div className="flex items-center text-sm text-gray-400">
                <FolderOpen className="h-4 w-4 mr-1" />
                <span>ID: {category.id}</span>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Немає категорій</p>
            <p className="text-gray-400 mt-1">Створіть категорію для організації ваших API ключів</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCategory) && (
        <CategoryModal
          category={editingCategory}
          colorOptions={colorOptions}
          onClose={() => {
            setShowCreateModal(false)
            setEditingCategory(null)
          }}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        />
      )}
    </Sidebar>
  )
}

function CategoryModal({ 
  category, 
  colorOptions,
  onClose, 
  onSubmit 
}: { 
  category: Category | null
  colorOptions: { value: string; name: string }[]
  onClose: () => void
  onSubmit: (data: Omit<Category, 'id'>) => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || colorOptions[0].value
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {category ? 'Редагувати категорію' : 'Створити нову категорію'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Назва категорії *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Наприклад: Продакшн"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Опис
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Опис категорії..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Колір
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`h-10 w-full rounded-lg border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-gray-900 scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {category ? 'Оновити' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}