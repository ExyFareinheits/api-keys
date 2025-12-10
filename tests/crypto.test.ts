import { describe, it, expect } from '@jest/globals';
import { encryptKey, decryptKey } from '../utils/apiKeyUtils';
import crypto from 'crypto';

describe('Crypto Tests', () => {
  it('should encrypt data correctly', () => {
    const key = 'test-api-key-123';
    const password = 'secure-password';
    
    const encrypted = encryptKey(key, password);
    
    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toBe(key);
  });

  it('should decrypt data correctly', () => {
    const key = 'test-api-key-123';
    const password = 'secure-password';
    
    const encrypted = encryptKey(key, password);
    const decrypted = decryptKey(encrypted, password);
    
    expect(decrypted).toBe(key);
  });

  it('should fail with wrong password', () => {
    const key = 'test-api-key-123';
    const password = 'secure-password';
    const wrongPassword = 'wrong-password';
    
    const encrypted = encryptKey(key, password);
    const decrypted = decryptKey(encrypted, wrongPassword);
    
    expect(decrypted).not.toBe(key);
  });

  it('should generate random encryption key', () => {
    const key1 = crypto.randomBytes(32).toString('hex');
    const key2 = crypto.randomBytes(32).toString('hex');
    
    expect(key1).toBeTruthy();
    expect(key2).toBeTruthy();
    expect(key1).not.toBe(key2);
    expect(key1.length).toBe(64); // 32 bytes in hex = 64 chars
  });

  it('should handle empty string encryption', () => {
    const key = '';
    const password = 'secure-password';
    
    const encrypted = encryptKey(key, password);
    const decrypted = decryptKey(encrypted, password);
    
    expect(decrypted).toBe(key);
  });
});
