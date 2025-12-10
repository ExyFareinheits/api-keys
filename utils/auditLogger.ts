import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string;
  timestamp: string;
  details: Record<string, any>;
}

interface AuditData {
  logs: AuditLog[];
}

const AUDIT_FILE = path.join(process.cwd(), 'data', 'audit.json');

async function readJSON(filePath: string): Promise<AuditData> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { logs: [] };
  }
}

async function writeJSON(filePath: string, data: AuditData): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function logAudit(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  ipAddress: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const data = await readJSON(AUDIT_FILE);
    const logs = data.logs || [];

    logs.push({
      id: uuidv4(),
      userId,
      action,
      resourceType,
      resourceId,
      ipAddress,
      timestamp: new Date().toISOString(),
      details,
    });

    await writeJSON(AUDIT_FILE, { logs });
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}
