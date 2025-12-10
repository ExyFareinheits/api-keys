'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { ApiKey } from '@/types'
import { 
  Key, 
  Plus, 
  TrendingUp, 
  Shield, 
  Clock,
  Activity,
  Settings
} from 'lucide-react'

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recentlyUsed: 0,
    categories: 0
  })

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/keys')
      if (response.ok) {
        const keys = await response.json()
        setApiKeys(keys)
        calculateStats(keys)
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }

  const calculateStats = (keys: ApiKey[]) => {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    setStats({
      total: keys.length,
      active: keys.filter(key => key.isActive).length,
      recentlyUsed: keys.filter(key => 
        key.lastUsed && new Date(key.lastUsed) > dayAgo
      ).length,
      categories: new Set(keys.map(key => key.category)).size
    })
  }

  const recentKeys = apiKeys
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
            <p className="text-gray-600 mt-1">Огляд ваших API ключів та статистики</p>
          </div>
          <button className="btn btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Новий ключ</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всього ключів</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Активні</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Використані сьогодні</p>
                <p className="text-2xl font-bold text-orange-600">{stats.recentlyUsed}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Категорії</p>
                <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Keys */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Останні ключі</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Переглянути всі
            </button>
          </div>
          
          {recentKeys.length > 0 ? (
            <div className="space-y-4">
              {recentKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Key className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{key.name}</p>
                      <p className="text-sm text-gray-500">{key.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {new Date(key.createdAt).toLocaleDateString('uk-UA')}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      key.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {key.isActive ? 'Активний' : 'Неактивний'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Немає API ключів</p>
              <p className="text-sm text-gray-400 mt-1">Створіть свій перший ключ для початку роботи</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <Plus className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Створити ключ</h3>
              <p className="text-sm text-gray-500 mt-1">Згенерувати новий API ключ</p>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Аналітика</h3>
              <p className="text-sm text-gray-500 mt-1">Переглянути статистику використання</p>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <Settings className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Налаштування</h3>
              <p className="text-sm text-gray-500 mt-1">Керування параметрами безпеки</p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}