export interface ApiKey {
  id: string;
  name: string;
  key: string;
  description?: string;
  category: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
  permissions?: string[];
  encrypted?: boolean; // Flag to indicate if key is encrypted
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface ApiKeyFormData {
  name: string;
  description?: string;
  category: string;
  keyLength?: number;
  permissions?: string[];
  encrypted?: boolean;
  encryptedKey?: string;
}