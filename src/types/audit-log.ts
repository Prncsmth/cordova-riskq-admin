export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  createdAt: string;
}