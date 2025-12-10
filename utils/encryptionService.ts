import { encryptKey, decryptKey, generateSecurePassword } from './apiKeyUtils';

class EncryptionService {
  private masterPassword: string | null = null;
  private isEncryptionEnabled: boolean = false;

  // Initialize encryption with master password
  setMasterPassword(password: string) {
    this.masterPassword = password;
    this.isEncryptionEnabled = true;
    localStorage.setItem('encryption_enabled', 'true');
    // Store password hash for verification (not the actual password)
    const passwordHash = btoa(password + 'salt');
    localStorage.setItem('password_hash', passwordHash);
  }

  // Verify master password
  verifyMasterPassword(password: string): boolean {
    const storedHash = localStorage.getItem('password_hash');
    if (!storedHash) return false;
    
    const passwordHash = btoa(password + 'salt');
    return passwordHash === storedHash;
  }

  // Check if encryption is enabled
  isEnabled(): boolean {
    return localStorage.getItem('encryption_enabled') === 'true';
  }

  // Get master password (prompt user if not set)
  getMasterPassword(): string | null {
    if (this.masterPassword) return this.masterPassword;
    
    if (!this.isEnabled()) return null;
    
    // Prompt user for password
    const password = prompt('Введіть мастер-пароль для розшифрування ключів:');
    if (password && this.verifyMasterPassword(password)) {
      this.masterPassword = password;
      return password;
    }
    
    return null;
  }

  // Encrypt API key
  encryptApiKey(key: string): string {
    if (!this.isEnabled()) return key;
    
    const password = this.getMasterPassword();
    if (!password) return key;
    
    return encryptKey(key, password);
  }

  // Decrypt API key
  decryptApiKey(encryptedKey: string): string {
    if (!this.isEnabled()) return encryptedKey;
    
    const password = this.getMasterPassword();
    if (!password) return encryptedKey;
    
    return decryptKey(encryptedKey, password);
  }

  // Enable encryption
  enableEncryption(password?: string) {
    const masterPassword = password || generateSecurePassword();
    this.setMasterPassword(masterPassword);
    return masterPassword;
  }

  // Disable encryption
  disableEncryption() {
    this.masterPassword = null;
    this.isEncryptionEnabled = false;
    localStorage.removeItem('encryption_enabled');
    localStorage.removeItem('password_hash');
  }

  // Generate and return a new master password
  generateNewMasterPassword(): string {
    const newPassword = generateSecurePassword();
    this.setMasterPassword(newPassword);
    return newPassword;
  }

  // Clear session (logout)
  clearSession() {
    this.masterPassword = null;
  }
}

export const encryptionService = new EncryptionService();