'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { ApiKey, ApiKeyFormData, Category } from '@/types'
import { maskApiKey, copyToClipboard, formatDate, generateApiKey } from '@/utils/apiKeyUtils'
import { encryptionService } from '@/utils/encryptionService'
import { 
  Plus, 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Settings,
  Lock,
  Unlock
} from 'lucide-react'

export default function KeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApiKeys()
    loadCategories()
  }, [])

  useEffect(() => {
    filterKeys()
  }, [apiKeys, searchTerm, categoryFilter])

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

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/keys')
      if (response.ok) {
        const keys = await response.json()
        setApiKeys(keys)
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterKeys = () => {
    let filtered = apiKeys

    if (searchTerm) {
      filtered = filtered.filter(key => 
        key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter) {
      filtered = filtered.filter(key => key.category === categoryFilter)
    }

    setFilteredKeys(filtered)
  }

  const handleCreateKey = async (formData: ApiKeyFormData) => {
    try {
      let keyData = { ...formData };
      
      // If encryption is enabled, encrypt the key before storing
      if (encryptionService.isEnabled()) {
        const rawKey = generateApiKey(formData.keyLength || 32);
        const encryptedKey = encryptionService.encryptApiKey(rawKey);
        keyData = {
          ...formData,
          encryptedKey,
          encrypted: true
        };
      }

      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyData)
      })

      if (response.ok) {
        await loadApiKeys()
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating key:', error)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей ключ?')) return

    try {
      const response = await fetch(`/api/keys?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadApiKeys()
      }
    } catch (error) {
      console.error('Error deleting key:', error)
    }
  }

  const handleUpdateKey = async (formData: ApiKeyFormData) => {
    if (!editingKey) return

    try {
      const response = await fetch('/api/keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingKey.id, ...formData })
      })

      if (response.ok) {
        await loadApiKeys()
        setEditingKey(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Помилка при оновленні ключа')
      }
    } catch (error) {
      console.error('Error updating key:', error)
      alert('Помилка при оновленні ключа')
    }
  }

  const handleToggleActive = async (key: ApiKey) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key.id, isActive: !key.isActive })
      })

      if (response.ok) {
        await loadApiKeys()
      }
    } catch (error) {
      console.error('Error updating key:', error)
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const getDisplayKey = (key: ApiKey): string => {
    if (key.encrypted && encryptionService.isEnabled()) {
      try {
        return encryptionService.decryptApiKey(key.key);
      } catch (error) {
        console.error('Failed to decrypt key:', error);
        return key.key; // Return encrypted version if decryption fails
      }
    }
    return key.key;
  };

  const handleCopyKey = async (key: ApiKey) => {
    const displayKey = getDisplayKey(key);
    const success = await copyToClipboard(displayKey);
    if (success) {
      // Show toast notification
      alert('Ключ скопійовано в буфер обміну!');
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Ключі</h1>
            <p className="text-gray-600 mt-1">Керування вашими API ключами</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Створити ключ</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Пошук ключів..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
              >
                <option value="">Всі категорії</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Keys Table */}
        <div className="card">
          {filteredKeys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Назва
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ключ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Категорія
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Створено
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{key.name}</div>
                          {key.description && (
                            <div className="text-sm text-gray-500">{key.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            {visibleKeys.has(key.id) ? getDisplayKey(key) : maskApiKey(getDisplayKey(key))}
                          </code>
                          {key.encrypted && (
                            <div title="Зашифрований ключ">
                              <Lock className="h-3 w-3 text-green-600" />
                            </div>
                          )}
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyKey(key)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge bg-blue-100 text-blue-800">
                          {key.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(key)}
                          className="flex items-center space-x-1"
                        >
                          {key.isActive ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-700">Активний</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-500">Неактивний</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(key.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => setEditingKey(key)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteKey(key.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Немає API ключів</p>
              <p className="text-gray-400 mt-1">Створіть свій перший ключ для початку роботи</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateKey}
          categories={categories}
        />
      )}

      {/* Edit Key Modal */}
      {editingKey && (
        <EditKeyModal
          key={editingKey.id}
          apiKey={editingKey}
          onClose={() => setEditingKey(null)}
          onSubmit={handleUpdateKey}
          categories={categories}
        />
      )}
    </Sidebar>
  )
}

function CreateKeyModal({ 
  onClose, 
  onSubmit, 
  categories 
}: { 
  onClose: () => void
  onSubmit: (data: ApiKeyFormData) => void
  categories: Category[]
}) {
  const [formData, setFormData] = useState<ApiKeyFormData>({
    name: '',
    description: '',
    category: categories[0]?.name || 'Розробка',
    keyLength: 32
  })

  const [showEncryptionSetup, setShowEncryptionSetup] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if encryption is enabled but no master password is set
    if (encryptionService.isEnabled() && !encryptionService.getMasterPassword()) {
      setShowEncryptionSetup(true)
      return
    }
    
    onSubmit(formData)
  }

  const handleEncryptionSetup = (password: string) => {
    encryptionService.setMasterPassword(password)
    setShowEncryptionSetup(false)
    onSubmit(formData)
  }

  if (showEncryptionSetup) {
    return <EncryptionSetupModal onClose={() => setShowEncryptionSetup(false)} onSetup={handleEncryptionSetup} />
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Створити новий API ключ</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Назва ключа *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Наприклад: Production API"
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
                placeholder="Опис призначення ключа..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категорія
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                {categories.length > 0 ? categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                )) : (
                  <option value="Розробка">Розробка</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Довжина ключа
              </label>
              <select
                value={formData.keyLength}
                onChange={(e) => setFormData({ ...formData, keyLength: parseInt(e.target.value) })}
                className="input"
              >
                <option value={16}>16 символів</option>
                <option value={32}>32 символи</option>
                <option value={64}>64 символи</option>
              </select>
            </div>

            {/* Encryption Status */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                {encryptionService.isEnabled() ? (
                  <>
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Шифрування увімкнено</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-700 font-medium">Шифрування вимкнено</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {encryptionService.isEnabled() 
                  ? 'Ключ буде автоматично зашифрований перед збереженням'
                  : 'Увімкніть шифрування в налаштуваннях для підвищення безпеки'
                }
              </p>
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
              Створити ключ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditKeyModal({ 
  apiKey,
  onClose, 
  onSubmit, 
  categories 
}: { 
  apiKey: ApiKey
  onClose: () => void
  onSubmit: (data: ApiKeyFormData) => void
  categories: Category[]
}) {
  const [formData, setFormData] = useState<ApiKeyFormData>({
    name: apiKey.name,
    description: apiKey.description || '',
    category: apiKey.category,
    permissions: apiKey.permissions || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Редагувати API ключ</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Назва *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Наприклад: Production API Key"
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
                placeholder="Опис призначення ключа (необов'язково)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категорія
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                {categories.length > 0 ? categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                )) : (
                  <option value="Розробка">Розробка</option>
                )}
              </select>
            </div>

            {/* Display Key (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Ключ (не може бути змінений)
              </label>
              <input
                type="text"
                value={maskApiKey(apiKey.key)}
                className="input bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Ключ не може бути змінений після створення з міркувань безпеки
              </p>
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
              Зберегти зміни
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EncryptionSetupModal({ 
  onClose, 
  onSetup 
}: { 
  onClose: () => void
  onSetup: (password: string) => void
}) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [useGenerated, setUseGenerated] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')

  const generatePassword = () => {
    const newPassword = encryptionService.generateNewMasterPassword()
    setGeneratedPassword(newPassword)
    setUseGenerated(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (useGenerated) {
      onSetup(generatedPassword)
      return
    }
    
    if (password.length < 8) {
      alert('Пароль має містити принаймні 8 символів')
      return
    }
    
    if (password !== confirmPassword) {
      alert('Паролі не співпадають')
      return
    }
    
    onSetup(password)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-blue-600" />
            Налаштування шифрування
          </h3>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Важливо:</strong> Мастер-пароль використовується для шифрування всіх ваших API ключів. 
                Збережіть його в безпечному місці - без нього ви не зможете отримати доступ до ваших ключів!
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!useGenerated}
                  onChange={() => setUseGenerated(false)}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium">Створити власний пароль</span>
              </label>
              
              {!useGenerated && (
                <div className="space-y-3 ml-6">
                  <div>
                    <input
                      type="password"
                      placeholder="Введіть мастер-пароль (мін. 8 символів)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input"
                      minLength={8}
                      required={!useGenerated}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Підтвердіть мастер-пароль"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      required={!useGenerated}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={useGenerated}
                  onChange={() => setUseGenerated(true)}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium">Використовувати згенерований пароль</span>
              </label>
              
              {useGenerated && (
                <div className="ml-6 space-y-3">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="btn btn-secondary text-sm"
                  >
                    Згенерувати безпечний пароль
                  </button>
                  {generatedPassword && (
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-1">Згенерований пароль:</p>
                      <code className="text-sm bg-white px-2 py-1 rounded border font-mono break-all">
                        {generatedPassword}
                      </code>
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ Обов'язково збережіть цей пароль в безпечному місці!
                      </p>
                    </div>
                  )}
                </div>
              )}
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
              disabled={!useGenerated ? !password || !confirmPassword : !generatedPassword}
              className="btn btn-primary"
            >
              Налаштувати шифрування
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}