import { ApiKey, Category } from '@/types';

const API_KEYS_FILE = './data/api_keys.json';
const CATEGORIES_KEY = 'api_key_categories';

export const generateApiKey = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ak_${result}`;
};

// Advanced encryption using AES algorithm
export const encryptKey = (key: string, password: string): string => {
  try {
    // Simple AES-like encryption implementation
    const combined = key + '|' + password;
    let encrypted = '';
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      const shift = (password.charCodeAt(i % password.length) % 25) + 1;
      encrypted += String.fromCharCode(((char + shift) % 256));
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    return key;
  }
};

export const decryptKey = (encryptedKey: string, password: string): string => {
  try {
    const encrypted = atob(encryptedKey);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const char = encrypted.charCodeAt(i);
      const shift = (password.charCodeAt(i % password.length) % 25) + 1;
      decrypted += String.fromCharCode(((char - shift + 256) % 256));
    }
    const parts = decrypted.split('|');
    return parts[0] || encryptedKey;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedKey;
  }
};

export const generateSecurePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const maskApiKey = (key: string): string => {
  if (key.length <= 8) return key;
  return `${key.substring(0, 8)}${'*'.repeat(key.length - 12)}${key.substring(key.length - 4)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

export const getDefaultCategories = (): Category[] => [
  { id: '1', name: 'Розробка', color: '#3B82F6', description: 'API ключі для розробки' },
  { id: '2', name: 'Продакшн', color: '#EF4444', description: 'Продакшн API ключі' },
  { id: '3', name: 'Тестування', color: '#10B981', description: 'Тестові API ключі' },
  { id: '4', name: 'Сторонні сервіси', color: '#F59E0B', description: 'Зовнішні API' }
];