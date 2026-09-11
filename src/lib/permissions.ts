// src/lib/permissions.ts

// Define the core permissions available in the system
export const PERMISSIONS = {
  GUEST_VIEW: 'guest.view',
  GUEST_CREATE: 'guest.create',
  GUEST_EDIT: 'guest.edit',
  GUEST_DELETE: 'guest.delete',
  GUEST_IMPORT: 'guest.import',

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
  TASK_DELETE: 'task.delete',
  TASK_ASSIGN: 'task.assign',
  TASK_COMPLETE: 'task.complete', // complete any task

  VENDOR_VIEW: 'vendor.view',
  VENDOR_CREATE: 'vendor.create',
  VENDOR_EDIT: 'vendor.edit',
  VENDOR_DELETE: 'vendor.delete',

  CALENDAR_VIEW: 'calendar.view',
  CALENDAR_MANAGE: 'calendar.manage',
  CALENDAR_DELETE: 'calendar.delete',

  EVENT_EDIT: 'calendar.manage',
  EVENT_DELETE: 'calendar.delete',

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
  GUESTBOOK_DELETE: 'guestbook.delete',

  GALLERY_MANAGE: 'gallery.manage',
  GALLERY_DELETE: 'gallery.delete',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// The default permissions granted to an ADMIN if they have no granular database rows configured yet.
// Includes view/create/edit for operational modules. Excludes delete and financial/system modules.
export const ADMIN_DEFAULT_PERMISSIONS: string[] = [
  PERMISSIONS.GUEST_VIEW,
  PERMISSIONS.GUEST_CREATE,
  PERMISSIONS.GUEST_EDIT,
  PERMISSIONS.GUEST_IMPORT,
  PERMISSIONS.INVITATION_VIEW,
  PERMISSIONS.INVITATION_MANAGE,
  PERMISSIONS.RSVP_VIEW,
  PERMISSIONS.RSVP_MANAGE,
  PERMISSIONS.TASK_VIEW,
  PERMISSIONS.TASK_CREATE,
  PERMISSIONS.TASK_EDIT,
  PERMISSIONS.TASK_ASSIGN,
  PERMISSIONS.TASK_COMPLETE,
  PERMISSIONS.VENDOR_VIEW,
  PERMISSIONS.VENDOR_CREATE,
  PERMISSIONS.VENDOR_EDIT,
  PERMISSIONS.CALENDAR_VIEW,
  PERMISSIONS.CALENDAR_MANAGE,
  PERMISSIONS.EVENT_EDIT,
  PERMISSIONS.WEDDING_DAY_VIEW,
  PERMISSIONS.WEDDING_DAY_MANAGE,
  PERMISSIONS.REPORT_VIEW,
  PERMISSIONS.REPORT_EXPORT,
  PERMISSIONS.DOCUMENT_VIEW,
  PERMISSIONS.DOCUMENT_UPLOAD,
  PERMISSIONS.TRANSPORT_VIEW,
  PERMISSIONS.TRANSPORT_MANAGE,
  PERMISSIONS.ACCOMMODATION_VIEW,
  PERMISSIONS.ACCOMMODATION_MANAGE,
  PERMISSIONS.SEATING_VIEW,
  PERMISSIONS.SEATING_MANAGE,
  PERMISSIONS.GUESTBOOK_VIEW,
  PERMISSIONS.GUESTBOOK_MANAGE,
  PERMISSIONS.GALLERY_MANAGE,
];

// For the UI to render the permission matrix logically grouped
export const PERMISSION_MODULES = [
  {
    name: "Guests & RSVPs",
    permissions: [
      { code: PERMISSIONS.GUEST_VIEW, label: "View" },
      { code: PERMISSIONS.GUEST_CREATE, label: "Create" },
      { code: PERMISSIONS.GUEST_EDIT, label: "Edit" },
      { code: PERMISSIONS.GUEST_DELETE, label: "Delete" },
      { code: PERMISSIONS.GUEST_IMPORT, label: "Import" },
    ]
  },
  {
    name: "Tasks",
    permissions: [
      { code: PERMISSIONS.TASK_VIEW, label: "View" },
      { code: PERMISSIONS.TASK_CREATE, label: "Create" },
      { code: PERMISSIONS.TASK_EDIT, label: "Edit" },
      { code: PERMISSIONS.TASK_DELETE, label: "Delete" },
    ]
  },
  {
    name: "Vendors",
    permissions: [
      { code: PERMISSIONS.VENDOR_VIEW, label: "View" },
      { code: PERMISSIONS.VENDOR_CREATE, label: "Create" },
      { code: PERMISSIONS.VENDOR_EDIT, label: "Edit" },
      { code: PERMISSIONS.VENDOR_DELETE, label: "Delete" },
    ]
  },
  {
    name: "Calendar & Events",
    permissions: [
      { code: PERMISSIONS.CALENDAR_VIEW, label: "View" },
      { code: PERMISSIONS.CALENDAR_MANAGE, label: "Manage" },
      { code: PERMISSIONS.CALENDAR_DELETE, label: "Delete" },
    ]
  },
  {
    name: "Guestbook",
    permissions: [
      { code: PERMISSIONS.GUESTBOOK_VIEW, label: "View" },
      { code: PERMISSIONS.GUESTBOOK_MANAGE, label: "Manage" },
      { code: PERMISSIONS.GUESTBOOK_DELETE, label: "Delete" },
    ]
  },
  {
    name: "Logistics (Transport/Seating)",
    permissions: [
      { code: PERMISSIONS.TRANSPORT_VIEW, label: "View Transport" },
      { code: PERMISSIONS.TRANSPORT_MANAGE, label: "Manage Transport" },
      { code: PERMISSIONS.SEATING_VIEW, label: "View Seating" },
      { code: PERMISSIONS.SEATING_MANAGE, label: "Manage Seating" },
    ]
  },
  {
    name: "Budget (Financial)",
    permissions: [
      { code: PERMISSIONS.BUDGET_VIEW, label: "View" },
      { code: PERMISSIONS.BUDGET_CREATE, label: "Create" },
      { code: PERMISSIONS.BUDGET_EDIT, label: "Edit" },
      { code: PERMISSIONS.BUDGET_DELETE, label: "Delete" },
    ]
  },
  {
    name: "Expenses (Financial)",
    permissions: [
      { code: PERMISSIONS.EXPENSE_VIEW, label: "View" },
      { code: PERMISSIONS.EXPENSE_CREATE, label: "Create" },
      { code: PERMISSIONS.EXPENSE_EDIT, label: "Edit" },
    ]
  },
  {
    name: "Contributions (Financial)",
    permissions: [
      { code: PERMISSIONS.CONTRIBUTION_VIEW, label: "View" },
      { code: PERMISSIONS.CONTRIBUTION_CREATE, label: "Create" },
      { code: PERMISSIONS.CONTRIBUTION_EDIT, label: "Edit" },
    ]
  },
  {
    name: "System & Settings",
    permissions: [
      { code: PERMISSIONS.USER_VIEW, label: "View Team" },
      { code: PERMISSIONS.USER_MANAGE, label: "Manage Roles" },
      { code: PERMISSIONS.SETTINGS_VIEW, label: "View Settings" },
      { code: PERMISSIONS.SETTINGS_MANAGE, label: "Manage Settings" },
      { code: PERMISSIONS.AUDIT_VIEW, label: "View Audit Logs" },
    ]
  }
];

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
    // Family members inherently only have access to their own tasks
    if (permissionCode === PERMISSIONS.TASK_VIEW) return true;
    return false;
  }

  if (userRole === "VIEWER") {
    // Viewers cannot do anything except view what they are allowed
    return false; 
  }

  return false;
}
