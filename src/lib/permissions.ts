// src/lib/permissions.ts

// Define the core permissions available in the system
export const PERMISSIONS = {
  GUEST_VIEW: 'guest.view',
  GUEST_CREATE: 'guest.create',
  GUEST_EDIT: 'guest.edit',
  GUEST_DELETE: 'guest.delete',

  INVITATION_VIEW: 'invitation.view',
  INVITATION_MANAGE: 'invitation.manage',

  RSVP_VIEW: 'rsvp.view',
  RSVP_MANAGE: 'rsvp.manage',

  BUDGET_VIEW: 'budget.view',
  BUDGET_CREATE: 'budget.create',
  BUDGET_EDIT: 'budget.edit',
  BUDGET_DELETE: 'budget.delete',

  EXPENSE_VIEW: 'expense.view',
  EXPENSE_CREATE: 'expense.create',
  EXPENSE_EDIT: 'expense.edit',

  CONTRIBUTION_VIEW: 'contribution.view',
  CONTRIBUTION_CREATE: 'contribution.create',
  CONTRIBUTION_EDIT: 'contribution.edit',

  TASK_VIEW: 'task.view', // view all tasks
  TASK_CREATE: 'task.create',
  TASK_EDIT: 'task.edit',
  TASK_ASSIGN: 'task.assign',
  TASK_COMPLETE: 'task.complete', // complete any task

  VENDOR_VIEW: 'vendor.view',
  VENDOR_CREATE: 'vendor.create',
  VENDOR_EDIT: 'vendor.edit',

  CALENDAR_VIEW: 'calendar.view',
  CALENDAR_MANAGE: 'calendar.manage',

  WEDDING_DAY_VIEW: 'wedding_day.view',
  WEDDING_DAY_MANAGE: 'wedding_day.manage',

  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',

  DOCUMENT_VIEW: 'document.view',
  DOCUMENT_UPLOAD: 'document.upload',

  TRANSPORT_VIEW: 'transport.view',
  TRANSPORT_MANAGE: 'transport.manage',

  ACCOMMODATION_VIEW: 'accommodation.view',
  ACCOMMODATION_MANAGE: 'accommodation.manage',

  SEATING_VIEW: 'seating.view',
  SEATING_MANAGE: 'seating.manage',

  USER_VIEW: 'user.view',
  USER_MANAGE: 'user.manage',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',

  AUDIT_VIEW: 'audit.view',

  GUESTBOOK_VIEW: 'guestbook.view',
  GUESTBOOK_MANAGE: 'guestbook.manage',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Basic utility to check if a user context object has a specific permission.
 * In a real-world scenario, you might want to fetch permissions from DB per request,
 * but for Next.js server actions, passing the resolved permissions array from the JWT or DB is standard.
 */
export function hasPermission(
  userRole: string,
  userPermissions: string[], // Granular permissions granted directly to user
  permissionCode: PermissionCode
): boolean {
  if (userRole === "SUPER_ADMIN") {
    return true; // Super admins can do everything
  }

  // If the specific permission code is in their granular list, allow it
  if (userPermissions.includes(permissionCode)) {
    return true;
  }

  // Define broad fallback role behaviors if they haven't been migrated fully to DB yet
  if (userRole === "FAMILY_MEMBER") {
    // Family members inherently only have access to their own tasks and basic views,
    // which shouldn't be governed purely by a global boolean unless specified
    return false;
  }

  if (userRole === "VIEWER") {
    // Viewers cannot do anything except view what they are allowed
    return false; 
  }

  return false;
}
