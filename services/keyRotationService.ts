import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import { ApiKey } from '@/types';

interface KeysData {
  keys: ApiKey[];
}

const KEYS_FILE = path.join(process.cwd(), 'data', 'api_keys.json');

async function readJSON(filePath: string): Promise<KeysData> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    // Handle both array and object format
    if (Array.isArray(parsed)) {
      return { keys: parsed };
    }
    return parsed;
  } catch (error) {
    return { keys: [] };
  }
}

async function writeJSON(filePath: string, data: KeysData): Promise<void> {
  // Keep the array format if that's what's currently used
  const currentData = await fs.readFile(filePath, 'utf-8').catch(() => '[]');
  const isArrayFormat = currentData.trim().startsWith('[');
  
  const output = isArrayFormat ? data.keys : data;
  await fs.writeFile(filePath, JSON.stringify(output, null, 2), 'utf-8');
}

export async function checkExpiringKeys(): Promise<void> {
  try {
    const data = await readJSON(KEYS_FILE);
    const keys = data.keys || [];

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let hasChanges = false;

    for (const key of keys) {
      if (!key.expiryDate || !key.isActive) continue;

      const expiryDate = new Date(key.expiryDate);

      if (expiryDate < now) {
        key.isActive = false;
        hasChanges = true;
        console.log(`Key ${key.name} expired and deactivated`);
      } else if (expiryDate < sevenDaysLater) {
        console.log(`Warning: Key ${key.name} expires in 7 days`);
      }
    }

    if (hasChanges) {
      await writeJSON(KEYS_FILE, { keys });
    }
  } catch (error) {
    console.error('Error checking expiring keys:', error);
  }
}

// Schedule daily check at 9 AM
let scheduledTask: cron.ScheduledTask | null = null;

export function startKeyRotationService(): void {
  if (scheduledTask) {
    console.log('Key rotation service already running');
    return;
  }

  scheduledTask = cron.schedule('0 9 * * *', () => {
    console.log('Running daily key expiration check...');
    checkExpiringKeys();
  });

  console.log('Key rotation service started - checking daily at 9 AM');
}

export function stopKeyRotationService(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('Key rotation service stopped');
  }
}
