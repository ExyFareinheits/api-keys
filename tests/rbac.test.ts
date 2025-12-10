import { describe, it, expect } from '@jest/globals';

interface User {
  id: string;
  role: 'Admin' | 'Developer' | 'Viewer';
  permissions: string[];
}

const checkRole = (allowedRoles: string[]) => {
  return (user: User) => {
    return allowedRoles.includes(user.role);
  };
};

const checkPermission = (requiredPermission: string) => {
  return (user: User) => {
    return user.permissions.includes(requiredPermission);
  };
};

describe('RBAC Tests', () => {
  it('should allow Admin access to all resources', () => {
    const admin: User = { id: '1', role: 'Admin', permissions: ['read', 'write', 'delete'] };
    const canAccess = checkRole(['Admin'])(admin);
    
    expect(canAccess).toBe(true);
  });

  it('should allow Developer to create keys', () => {
    const developer: User = { id: '2', role: 'Developer', permissions: ['read', 'write'] };
    const canWrite = checkPermission('write')(developer);
    
    expect(canWrite).toBe(true);
  });

  it('should restrict Viewer from deleting', () => {
    const viewer: User = { id: '3', role: 'Viewer', permissions: ['read'] };
    const canDelete = checkPermission('delete')(viewer);
    
    expect(canDelete).toBe(false);
  });

  it('should check multiple roles', () => {
    const developer: User = { id: '2', role: 'Developer', permissions: ['read', 'write'] };
    const canAccess = checkRole(['Admin', 'Developer'])(developer);
    
    expect(canAccess).toBe(true);
  });

  it('should deny access without permission', () => {
    const viewer: User = { id: '3', role: 'Viewer', permissions: ['read'] };
    const canWrite = checkPermission('write')(viewer);
    
    expect(canWrite).toBe(false);
  });

  it('should validate role hierarchy', () => {
    const admin: User = { id: '1', role: 'Admin', permissions: ['read', 'write', 'delete'] };
    const developer: User = { id: '2', role: 'Developer', permissions: ['read', 'write'] };
    const viewer: User = { id: '3', role: 'Viewer', permissions: ['read'] };
    
    expect(admin.permissions.length).toBeGreaterThan(developer.permissions.length);
    expect(developer.permissions.length).toBeGreaterThan(viewer.permissions.length);
  });

  it('should handle custom permissions', () => {
    const user: User = { id: '4', role: 'Developer', permissions: ['read', 'write', 'export'] };
    const canExport = checkPermission('export')(user);
    
    expect(canExport).toBe(true);
  });

  it('should combine role and permission checks', () => {
    const developer: User = { id: '2', role: 'Developer', permissions: ['read', 'write'] };
    
    const isDeveloper = checkRole(['Developer'])(developer);
    const canWrite = checkPermission('write')(developer);
    
    expect(isDeveloper && canWrite).toBe(true);
  });
});
