import { requirePermission, getAdminSession } from "@/lib/auth";
import { PERMISSIONS, PermissionCode } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Validates whether the current user has permission to delete a specific module.
 * @param permissionCode The required permission (e.g. 'guest.delete'). If null, strictly requires SUPER_ADMIN.
 * @returns Object containing either the session or an error/status pair.
 */
export async function checkDeletePermission(permissionCode: PermissionCode | null) {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, error: "Unauthorized", status: 401 };
  }

  if (permissionCode) {
    // For operational records (Guests, Tasks, etc)
    try {
      await requirePermission(permissionCode);
    } catch (error) {
      return { session: null, error: "Forbidden", status: 403 };
    }
  } else {
    // For strict financial records (Budget, Expenses, Contributions)
    if (session.role !== "SUPER_ADMIN") {
      return { session: null, error: "Forbidden: Super Admin access required", status: 403 };
    }
  }

  return { session, error: null, status: 200 };
}

/**
 * Creates an audit log entry for destructive admin actions.
 */
export async function createDeleteAuditLog(
  userId: string,
  entity: string,
  entityId: string,
  oldValueInfo: any,
  action: "DELETE" | "ARCHIVE" | "RESTORE" | "DEACTIVATE" | "REACTIVATE" = "DELETE"
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        oldValue: JSON.stringify(oldValueInfo),
      }
    });
  } catch (error) {
    console.error(`Failed to create ${action} audit log for ${entity}:`, error);
  }
}
