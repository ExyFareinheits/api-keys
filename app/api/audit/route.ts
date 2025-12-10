import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { AuditLog } from '@/utils/auditLogger';

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

export async function GET(request: NextRequest) {
  try {
    // In a real app, verify admin role here
    // const user = await verifyToken(request);
    // if (!user || user.role !== 'Admin') {
    //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    // }

    const data = await readJSON(AUDIT_FILE);
    const logs = (data.logs || []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    return NextResponse.json(
      { message: 'Error retrieving audit logs' },
      { status: 500 }
    );
  }
}
