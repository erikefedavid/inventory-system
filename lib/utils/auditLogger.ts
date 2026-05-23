// lib/utils/auditLogger.ts
import { Types } from "mongoose";
import { AuditLog } from "../models/AuditLog";

interface LogParams {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}

export async function logAction({ userId, action, entity, entityId, before, after }: LogParams) {
  const entry = new AuditLog({
    user: new Types.ObjectId(userId),
    action,
    entity,
    entityId: new Types.ObjectId(entityId),
    before,
    after,
    ipAddress: "",
  });
  await entry.save();
}
