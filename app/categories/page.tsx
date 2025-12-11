'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Category } from '@/types'
import { 
  Plus, 
  FolderOpen, 
  Edit2, 
  Trash2, 
  Save,
  X
} from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6', description: '' })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadCategories()
        setShowCreateModal(false)
        setFormData({ name: '', color: '#3B82F6', description: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Помилка при створенні категорії')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Помилка при створенні категорії')
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCategory.id, ...formData }),
      })

      if (response.ok) {
        await loadCategories()
        setEditingCategory(null)
        setFormData({ name: '', color: '#3B82F6', description: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Помилка при оновленні категорії')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Помилка при оновленні категорії')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю категорію?')) return

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadCategories()
      } else {
        const error = await response.json()
        alert(error.error || 'Помилка при видаленні категорії')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Помилка при видаленні категорії')
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      description: category.description || '',
    })
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setFormData({ name: '', color: '#3B82F6', description: '' })
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
            onClick={() => {
              setShowCreateModal(true)
              setFormData({ name: '', color: '#3B82F6', description: '' })
            }}
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
              {editingCategory?.id === category.id ? (
                // Edit Mode
                <form onSubmit={handleUpdateCategory} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input text-sm"
                      placeholder="Назва категорії"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input text-sm"
                      placeholder="Опис"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Колір:</label>
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: opt.value })}
                        className={`h-6 w-6 rounded-full border-2 ${
                          formData.color === opt.value ? 'border-gray-900' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: opt.value }}
                      />
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center space-x-1">
                      <Save className="h-4 w-4" />
                      <span>Зберегти</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={cancelEdit}
                      className="btn btn-secondary flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Скасувати</span>
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <>
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
                        onClick={() => startEdit(category)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
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
                </>
              )}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <form onSubmit={handleCreateCategory} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Створити нову категорію
                </h3>
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
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
                    placeholder="Опис категорії (необов'язково)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Колір категорії
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: option.value })}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          formData.color === option.value
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: option.value }}
                        />
                        <span className="text-sm text-gray-700">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Створити
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Sidebar>
  )
}
