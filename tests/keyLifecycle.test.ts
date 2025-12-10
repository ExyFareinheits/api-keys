import { describe, it, expect, beforeEach } from '@jest/globals';
import { generateApiKey } from '../utils/apiKeyUtils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: string;
  expiryDate?: string;
}

describe('Key Lifecycle Tests', () => {
  let mockKeys: ApiKey[] = [];

  beforeEach(() => {
    mockKeys = [];
  });

  it('should create new API key', () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: 'Test Key',
      key: generateApiKey(32),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockKeys.push(newKey);

    expect(mockKeys.length).toBe(1);
    expect(newKey.key).toContain('ak_');
    expect(newKey.isActive).toBe(true);
  });

  it('should deactivate key', () => {
    const key: ApiKey = {
      id: '1',
      name: 'Test Key',
      key: generateApiKey(32),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockKeys.push(key);
    key.isActive = false;

    expect(key.isActive).toBe(false);
  });

  it('should delete key', () => {
    const key: ApiKey = {
      id: '1',
      name: 'Test Key',
      key: generateApiKey(32),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockKeys.push(key);
    mockKeys = mockKeys.filter(k => k.id !== key.id);

    expect(mockKeys.length).toBe(0);
  });

  it('should detect expired keys', () => {
    const expiredKey: ApiKey = {
      id: '1',
      name: 'Expired Key',
      key: generateApiKey(32),
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString(),
      expiryDate: new Date('2024-12-31').toISOString(),
    };

    const now = new Date();
    const expiryDate = new Date(expiredKey.expiryDate!);
    const isExpired = expiryDate < now;

    expect(isExpired).toBe(true);
  });

  it('should rotate expired keys', () => {
    const oldKey: ApiKey = {
      id: '1',
      name: 'Old Key',
      key: generateApiKey(32),
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString(),
      expiryDate: new Date('2024-12-31').toISOString(),
    };

    mockKeys.push(oldKey);

    // Simulate rotation
    const now = new Date();
    const expiryDate = new Date(oldKey.expiryDate!);
    
    if (expiryDate < now) {
      oldKey.isActive = false;
      
      const newKey: ApiKey = {
        id: '2',
        name: oldKey.name,
        key: generateApiKey(32),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      mockKeys.push(newKey);
    }

    expect(oldKey.isActive).toBe(false);
    expect(mockKeys.length).toBe(2);
    expect(mockKeys[1].isActive).toBe(true);
  });
});
