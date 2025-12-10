'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { encryptionService } from '@/utils/encryptionService'
import { 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  Key, 
  Lock,
  AlertTriangle,
  CheckCircle,
  Unlock,
  RefreshCw
} from 'lucide-react'

interface Settings {
  autoBackup: boolean
  encryptionEnabled: boolean
  keyExpiration: number
  maxKeys: number
  backupFrequency: 'daily' | 'weekly' | 'monthly'
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    autoBackup: false,
    encryptionEnabled: encryptionService.isEnabled(),
    keyExpiration: 365,
    maxKeys: 100,
    backupFrequency: 'weekly'
  })

  const [stats, setStats] = useState({
    totalKeys: 0,
    encryptedKeys: 0,
    storageUsed: '0 KB',
    lastBackup: null as string | null
  })

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

  useEffect(() => {
    loadSettings()
    loadStats()
  }, [])

  const loadSettings = () => {
    const saved = localStorage.getItem('api_key_settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/keys')
      if (response.ok) {
        const keys = await response.json()
        const dataSize = new Blob([JSON.stringify(keys)]).size
        const encryptedCount = keys.filter((key: any) => key.encrypted).length
        setStats({
          totalKeys: keys.length,
          encryptedKeys: encryptedCount,
          storageUsed: `${(dataSize / 1024).toFixed(2)} KB`,
          lastBackup: localStorage.getItem('last_backup_date')
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem('api_key_settings', JSON.stringify(newSettings))
  }

  const handleToggleEncryption = () => {
    if (settings.encryptionEnabled) {
      // Disable encryption
      if (confirm('Вимкнути шифрування? Існуючі зашифровані ключі залишаться зашифрованими.')) {
        encryptionService.disableEncryption()
        saveSettings({ ...settings, encryptionEnabled: false })
      }
    } else {
      // Enable encryption
      setShowPasswordModal(true)
    }
  }

  const handleSetupEncryption = (password: string) => {
    encryptionService.setMasterPassword(password)
    saveSettings({ ...settings, encryptionEnabled: true })
    setShowPasswordModal(false)
    loadStats()
  }

  const handleChangePassword = () => {
    setShowChangePasswordModal(true)
  }

  const handlePasswordChange = (newPassword: string) => {
    encryptionService.setMasterPassword(newPassword)
    setShowChangePasswordModal(false)
    alert('Мастер-пароль успішно змінено!')
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/keys')
      if (response.ok) {
        const keys = await response.json()
        const categories = localStorage.getItem('api_key_categories')
        
        const exportData = {
          keys,
          categories: categories ? JSON.parse(categories) : [],
          settings,
          exportDate: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `api-keys-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        localStorage.setItem('last_backup_date', new Date().toISOString())
        loadStats()
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Помилка при експорті даних')
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        
        if (!importData.keys || !Array.isArray(importData.keys)) {
          throw new Error('Невірний формат файлу')
        }

        // Import keys
        for (const key of importData.keys) {
          await fetch('/api/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(key)
          })
        }

        // Import categories
        if (importData.categories) {
          localStorage.setItem('api_key_categories', JSON.stringify(importData.categories))
        }

        // Import settings
        if (importData.settings) {
          saveSettings(importData.settings)
        }

        alert('Дані успішно імпортовано!')
        loadStats()
      } catch (error) {
        console.error('Error importing data:', error)
        alert('Помилка при імпорті даних')
      }
    }
    reader.readAsText(file)
  }

  const handleClearAllData = async () => {
    if (!confirm('Ви впевнені, що хочете видалити всі дані? Цю дію неможливо скасувати!')) return
    if (!confirm('Останнє попередження! Всі API ключі та налаштування будуть видалені назавжди!')) return

    try {
      // Clear all keys
      const response = await fetch('/api/keys')
      if (response.ok) {
        const keys = await response.json()
        for (const key of keys) {
          await fetch(`/api/keys?id=${key.id}`, { method: 'DELETE' })
        }
      }

      // Clear localStorage
      localStorage.removeItem('api_key_categories')
      localStorage.removeItem('api_key_settings')
      localStorage.removeItem('last_backup_date')

      alert('Всі дані видалено!')
      loadStats()
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Помилка при видаленні даних')
    }
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Налаштування</h1>
          <p className="text-gray-600 mt-1">Керування параметрами безпеки та системи</p>
        </div>

        {/* Security Settings */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Безпека
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Шифрування ключів</h3>
                <p className="text-sm text-gray-500">Шифрувати API ключі при зберіганні</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.encryptionEnabled}
                  onChange={handleToggleEncryption}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.encryptionEnabled && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Шифрування активне</p>
                      <p className="text-xs text-green-700">Ваші ключі захищені мастер-паролем</p>
                    </div>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="btn btn-secondary text-sm flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Змінити пароль</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Автоматичне резервне копіювання</h3>
                <p className="text-sm text-gray-500">Автоматично створювати резервні копії</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => saveSettings({ ...settings, autoBackup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Термін дії ключів (днів)
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                value={settings.keyExpiration}
                onChange={(e) => saveSettings({ ...settings, keyExpiration: parseInt(e.target.value) })}
                className="input w-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Максимальна кількість ключів
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={settings.maxKeys}
                onChange={(e) => saveSettings({ ...settings, maxKeys: parseInt(e.target.value) })}
                className="input w-32"
              />
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Статистика системи
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Всього ключів</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalKeys}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Зашифровані ключі</p>
              <p className="text-2xl font-bold text-green-900">{stats.encryptedKeys}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Використано місця</p>
              <p className="text-2xl font-bold text-purple-900">{stats.storageUsed}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Остання резервна копія</p>
              <p className="text-lg font-bold text-orange-900">
                {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString('uk-UA') : 'Немає'}
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Керування даними
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-green-900">Експорт даних</h3>
                  <p className="text-sm text-green-700">Створити резервну копію всіх ключів і налаштувань</p>
                </div>
              </div>
              <button 
                onClick={handleExportData}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Експорт</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Upload className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-900">Імпорт даних</h3>
                  <p className="text-sm text-blue-700">Відновити дані з резервної копії</p>
                </div>
              </div>
              <label className="btn btn-secondary flex items-center space-x-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Імпорт</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <h3 className="font-medium text-red-900">Очистити всі дані</h3>
                  <p className="text-sm text-red-700">Видалити всі ключі, категорії та налаштування</p>
                </div>
              </div>
              <button 
                onClick={handleClearAllData}
                className="btn btn-danger flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Очистити</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Setup Modal */}
      {showPasswordModal && (
        <PasswordSetupModal
          onClose={() => setShowPasswordModal(false)}
          onSetup={handleSetupEncryption}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onConfirm={handlePasswordChange}
        />
      )}
    </Sidebar>
  )
}

function PasswordSetupModal({ 
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let newPassword = ''
    for (let i = 0; i < 16; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }
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
                Збережіть його в безпечному місці!
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
                  <input
                    type="password"
                    placeholder="Мастер-пароль (мін. 8 символів)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    minLength={8}
                    required={!useGenerated}
                  />
                  <input
                    type="password"
                    placeholder="Підтвердіть пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    required={!useGenerated}
                  />
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
                <span className="text-sm font-medium">Згенерувати безпечний пароль</span>
              </label>
              
              {useGenerated && (
                <div className="ml-6 space-y-3">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="btn btn-secondary text-sm"
                  >
                    Згенерувати пароль
                  </button>
                  {generatedPassword && (
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-1">Згенерований пароль:</p>
                      <code className="text-sm bg-white px-2 py-1 rounded border font-mono break-all">
                        {generatedPassword}
                      </code>
                      <p className="text-xs text-red-600 mt-2">⚠️ Збережіть цей пароль!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Скасувати
            </button>
            <button
              type="submit"
              disabled={!useGenerated ? !password || !confirmPassword : !generatedPassword}
              className="btn btn-primary"
            >
              Увімкнути шифрування
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChangePasswordModal({ 
  onClose, 
  onConfirm 
}: { 
  onClose: () => void
  onConfirm: (newPassword: string) => void
}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!encryptionService.verifyMasterPassword(currentPassword)) {
      alert('Невірний поточний пароль')
      return
    }
    
    if (newPassword.length < 8) {
      alert('Новий пароль має містити принаймні 8 символів')
      return
    }
    
    if (newPassword !== confirmPassword) {
      alert('Нові паролі не співпадають')
      return
    }
    
    onConfirm(newPassword)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Зміна мастер-паролю</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поточний пароль
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Новий пароль
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Підтвердіть новий пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Скасувати
            </button>
            <button type="submit" className="btn btn-primary">
              Змінити пароль
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}