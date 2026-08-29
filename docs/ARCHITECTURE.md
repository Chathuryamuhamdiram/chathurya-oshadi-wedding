# Wedding Platform Architecture

## 1. Purpose

This document defines the recommended technical architecture for the Chathurya & Oshadi Wedding Platform.

The platform consists of four primary experiences:

1. Public Wedding Website
2. Private Wedding Planning Admin Portal
3. Family / Helper Portal
4. Wedding Day Operations Mode

The system should be mobile-first, secure, modular, and easy to extend.

---

## 2. Recommended Technology Stack

### Frontend

Recommended:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Component-based UI architecture

### Backend

Recommended options:
- Next.js server actions / API routes for the first implementation
- Node.js service layer for larger deployments
- Cloudflare Workers for edge/serverless workloads where useful

### Database

Recommended:
- PostgreSQL
- Supabase can be used for hosted PostgreSQL, authentication, storage, and real-time capabilities

### File Storage

Use object storage for:
- Receipts
- Quotations
- Contracts
- Wedding images
- Guest uploads
- Supporting task files

### Hosting

Recommended options:
- Vercel
- Cloudflare Pages / Workers

---

## 3. High-Level Architecture

```text
Guest / Family / Admin Browser
            |
            v
      Next.js Web App
            |
    ---------------------
    |         |         |
    v         v         v
 Auth      API Layer   Static Assets
    |         |
    |         v
    |    Business Services
    |         |
    |   ----------------------
    |   |        |           |
    v   v        v           v
 PostgreSQL   Storage   Notification Service
                         |
                         +-- Email
                         +-- In-app
                         +-- WhatsApp deep-link generation
                         +-- Future push / SMS / WhatsApp API
```

---

## 4. Application Areas

### 4.1 Public Wedding Website

Publicly accessible guest-facing functions:

- Opening / invitation experience
- Wedding details
- Countdown
- Event schedule
- Venues and map links
- Gallery
- Personalized invitation page
- RSVP
- Guest book
- Wedding updates
- Accommodation information
- Share invitation options

### 4.2 Admin Portal

Restricted to Chathurya, Oshadi, and authorized users.

Core modules:
- Dashboard
- Guest management
- Digital invitation management
- Budget
- Expenses
- Contributions
- Tasks
- Family assignments
- Vendors
- Calendar
- Documents
- Notifications
- Reports
- Wedding day operations

### 4.3 Family Portal

Restricted role-based experience.

Family members should only see:
- Tasks assigned to them
- Relevant deadlines
- Relevant timeline events
- Comments
- Attachments
- Notifications
- Limited wedding information needed for their responsibilities

### 4.4 Wedding Day Mode

Optimized mobile interface showing:
- Current timeline
- Next event
- Outstanding tasks
- Vendor arrival status
- Emergency contacts
- Important announcements

---

## 5. Authentication and Authorization

Roles:

- SUPER_ADMIN
- ADMIN
- FAMILY_MEMBER
- VIEWER

Chathurya and Oshadi should be SUPER_ADMIN users.

Authorization should be enforced on the server side using a granular Role-Based Access Control (RBAC) mechanism.

The RBAC system relies on three layers:
1. **Roles**: Groupings of users (e.g. `ADMIN`, `FAMILY_MEMBER`).
2. **Permissions**: Fine-grained capabilities (e.g. `budget.edit`, `guest.view`).
3. **Role & User Assignments**: Permissions are assigned directly to roles, and can be overridden on a per-user basis.

Sensitive modules such as:
- Budget
- Expenses
- Contributions
- Guest personal data
- Admin settings

must be strictly protected on the backend using Edge middleware (`middleware.ts`) for page routing, and Next.js Server Actions checking for specific permission codes using `requirePermission(code)`.

---

## 6. Personalized Invitation Architecture

Each guest or family invitation should have a unique invitation token.

Example:

```text
https://yourdomain.com/invite/ABCD1234
```

The token should resolve to a guest-family record.

Data may include:
- Family / invitee display name
- WhatsApp number
- Allowed guest count
- Confirmed guest count
- Liquor count
- RSVP status
- Invitation sent status

Tokens should not expose internal database IDs.

---

## 7. WhatsApp Invitation Sharing

Version 1 should use WhatsApp deep-link sharing.

Flow:

1. Admin selects a guest/family.
2. System generates the personalized invitation URL.
3. Admin clicks `Send via WhatsApp`.
4. System builds the WhatsApp deep link using:
   - Guest WhatsApp number
   - Personalized message
   - Invitation URL
5. WhatsApp opens.
6. Admin reviews the prepared message.
7. Admin manually presses Send.
8. System records the invitation as shared when the admin confirms the action in the application.

No automatic WhatsApp message sending is required for Version 1.

Future version may integrate WhatsApp Business Platform / Cloud API.

---

## 8. Notification Architecture

Notification types:

- Task due reminder
- Task overdue
- Payment due
- Budget warning
- RSVP received
- Wedding timeline reminder
- Vendor reminder

Initial channels:
- In-app
- Email

Future:
- Browser push
- SMS
- WhatsApp Business API

Notifications should be generated by scheduled background jobs.

Suggested reminder defaults:
- 7 days before
- 3 days before
- 1 day before
- Due date
- Overdue

---

## 9. Task Scheduling

Each task should contain:
- Owner
- Start date
- Due date
- Priority
- Status
- Reminder configuration
- Escalation configuration
- Dependencies

A scheduler should evaluate upcoming and overdue tasks at least daily.

For wedding-day items, a more frequent schedule may be enabled.

---

## 10. Budget Architecture

Budget module entities:
- Budget categories
- Budget items
- Expenses
- Contributions
- Vendors
- Payments
- Attachments

All financial updates should be auditable.

Important calculations:
- Planned total
- Actual total
- Paid total
- Outstanding total
- Remaining budget
- Variance
- Category variance

---

## 11. Security Requirements

- HTTPS only
- Secure passwordless or credential-based authentication
- Server-side authorization
- Input validation
- Rate limiting
- CSRF protection where applicable
- XSS protection
- Secure file upload validation
- Private storage for sensitive documents
- Audit logging
- No sensitive information in public URLs
- Unique unguessable invitation tokens
- Secrets stored only in environment variables

---

## 12. Performance Requirements

Target:
- Mobile-first rendering
- Lazy-load gallery media
- Compress images
- Use responsive images
- Cache public content
- Avoid loading admin modules on guest pages
- Optimize JavaScript bundle size
- Use pagination for guest, expense, task, and audit lists

---

## 13. Recommended Project Structure

```text
src/
  app/
    (public)/
    invite/
    admin/
    family/
    api/
  components/
  features/
    guests/
    invitations/
    budget/
    tasks/
    vendors/
    notifications/
    rsvp/
    reports/
  lib/
    auth/
    db/
    notifications/
    whatsapp/
    validation/
  types/
  hooks/

docs/
  REQUIREMENTS.md
  ARCHITECTURE.md
  DATABASE.md
  DEVELOPMENT_PLAN.md

.agents/
  rules/
    wedding-project.md
```

---

## 14. Engineering Principles

- Preserve existing functionality.
- Prefer reusable modules over page-specific logic.
- Keep public and private application concerns separated.
- Validate all business rules server-side.
- Keep the database schema normalized.
- Record important financial and status changes in audit logs.
- Make admin workflows fast on mobile.
- Build features incrementally according to the development plan.
