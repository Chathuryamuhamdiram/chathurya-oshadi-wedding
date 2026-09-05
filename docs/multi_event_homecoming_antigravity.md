# Multi-Event Wedding Management Architecture
## Homecoming + Admin Event Context Integration
### Antigravity Implementation Specification

## Objective
Upgrade the current single-event Wedding Platform into a multi-event wedding management system with a persistent Admin Event Context selector.

Supported examples:
- Wedding
- Homecoming
- Poruwa Ceremony
- Engagement
- Pre-shoot
- After Party
- Future event types

The same existing modules must become event-aware instead of creating duplicate Homecoming-specific modules.

## Core UX
Add an Admin event selector:

Active Event
[ Wedding ▼ ]

Options:
- Wedding
- Homecoming
- All Events

When Homecoming is selected, Dashboard, Guests, Budget, Vendors, Tasks, Invitations, Schedule, and Reports must show Homecoming-scoped data.

When Wedding is selected, show Wedding-scoped data.

When All Events is selected, show combined data with clear event labels and no ambiguous record creation.

## Core Architecture
Introduce an Event entity.

Recommended relationships:
Event
- EventGuests
- BudgetItems
- Tasks
- Invitations
- EventSchedules
- Reports

Shared identities such as Guest and Vendor should not be duplicated unnecessarily.

## Recommended Event Model
```prisma
model Event {
  id           String      @id @default(cuid())
  name         String
  eventType    EventType
  eventDate    DateTime?
  startTime    String?
  endTime      String?
  venueName    String?
  venueAddress String?
  description  String?
  status       EventStatus @default(PLANNING)
  isActive     Boolean     @default(true)

  budgetItems  BudgetItem[]
  tasks        Task[]
  invitations  Invitation[]
  schedules    EventSchedule[]
  guestLinks   EventGuest[]

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}
```

Recommended enums:
```prisma
enum EventType {
  WEDDING
  HOMECOMING
  PORUWA
  ENGAGEMENT
  PRE_SHOOT
  AFTER_PARTY
  OTHER
}

enum EventStatus {
  PLANNING
  ACTIVE
  COMPLETED
  CANCELLED
}
```

Adapt names to existing project conventions.

## Initial Data
At minimum create:
- Wedding
- Homecoming

Existing production data must be migrated to Wedding unless there is clear evidence it belongs elsewhere.

Do not invent Homecoming date, venue, guest, vendor, or financial data.

## Event Context Persistence
Persist selected event across:
- page navigation
- browser refresh
- module changes

Preferred implementation:
- URL query param and/or
- server-readable cookie/session preference

Example:
`/admin/budget?event=<eventId>`

Do not keep critical event context only in local client state.

## All Events Rules
All Events is mainly an overview/reporting context.

Examples:
- Budget shows all items with Event column
- Tasks show all tasks with Event badge
- Vendors show event breakdown
- Guests show memberships
- Reports aggregate

If user creates a record while All Events is active, Event selection must be explicitly required.

Never guess an Event.

## Budget Integration
Add `eventId` to BudgetItem.

Existing Wedding Budget Items must be migrated to Wedding.

Filtering:
- Wedding selected -> Wedding BudgetItems only
- Homecoming selected -> Homecoming BudgetItems only
- All Events -> all BudgetItems with Event label

Keep current financial rules:
- Total Amount
- Advance Paid
- Total Paid
- Remaining Balance
- Payment Status
- Payment Due Date
- Vendor
- Category
- Event

Expense remains the single source of truth for actual outgoing payments.

## Contributions
Make Contributions event-aware.

Minimum safe implementation:
Each Contribution belongs to a specific Event.

Only RECEIVED contributions affect that Event's financial calculations.

Do not silently use Wedding contributions for Homecoming.

## Budget Categories
Recommended:
Budget Categories remain globally reusable.

Examples:
- Photography
- Catering
- Decor
- Entertainment

Budget Items remain event-specific.

Deletion dependency checks must consider all Events, not only the currently selected Event.

If Photography has Homecoming BudgetItems, it cannot be deleted from Wedding context.

## Guests
Do not duplicate Guest identity for multiple events.

Recommended:
```prisma
model EventGuest {
  id              String   @id @default(cuid())
  guestId         String
  eventId         String
  invitationCount Int?
  rsvpStatus      String?
  confirmedCount  Int?
  liquorCount     Int?
  tableNumber     String?
  notes           String?

  guest           Guest @relation(fields: [guestId], references: [id])
  event           Event @relation(fields: [eventId], references: [id])

  @@unique([guestId, eventId])
}
```

Each EventGuest can have independent:
- invite count
- RSVP
- confirmed count
- liquor count
- table
- notes

Example:
Nimal Perera
- Wedding: Invited
- Homecoming: Invited

## Invitations
Make Invitations event-aware.

A guest invited only to Homecoming must not see Wedding details.

A guest invited only to Wedding must not see Homecoming details.

If invited to both, public invitation page may show both event sections.

Existing invitation routes/codes must continue to work.

## Vendors
Vendor identity should remain shared/global.

Do not create WeddingVendor and HomecomingVendor.

A Vendor may serve multiple Events through linked BudgetItems or service records.

Vendor financial totals must be event-scoped:
- Wedding selected -> sum Expenses on Wedding BudgetItems
- Homecoming selected -> sum Expenses on Homecoming BudgetItems
- All Events -> combined total with event breakdown

## Tasks
Add eventId to Task.

Wedding selected -> Wedding tasks only.
Homecoming selected -> Homecoming tasks only.
All Events -> all tasks with Event label.

## Event Schedule
Add or adapt an Event Schedule model.

Recommended:
```prisma
model EventSchedule {
  id          String   @id @default(cuid())
  eventId     String
  title       String
  description String?
  startTime   DateTime?
  endTime     DateTime?
  ownerId     String?
  sortOrder   Int      @default(0)

  event       Event    @relation(fields: [eventId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Use actual Homecoming schedule data only when entered by the user.

## Dashboard
Dashboard must be event-aware.

Wedding:
- Wedding guests
- Wedding RSVP
- Wedding budget
- Wedding vendors
- Wedding tasks
- Wedding countdown
- Wedding payments due

Homecoming:
same structure but Homecoming-only data.

All Events:
- event count
- combined financial totals
- event comparison
- cross-event tasks
- guest metrics with clear semantics

Avoid double-counting shared Guest identity when the metric means unique people.

## Reports
Add Event filter:
- Wedding
- Homecoming
- All Events

Reports may include:
- guest count
- RSVP
- budget
- expenses
- contributions
- vendor commitments
- outstanding payments
- tasks
- invitation status

## Admin UI
Always make active Event obvious.

Examples:
- header event selector
- page subtitle/badge

Example:
Budget Management
Homecoming

Prevent accidental data entry into the wrong Event.

## Forms
If a specific Event is active:
- preselect that Event
- preferably lock it unless cross-event editing is intentionally supported

If All Events is active:
- require Event selection before save

## Unsaved Changes
Do not silently switch Event while a form/modal has unsaved changes.

Either:
- disable switcher while dirty
or
- show a warning/confirmation

## Event Management
Add a SUPER_ADMIN Event Management area.

Actions:
- Create Event
- Edit Event
- Archive/deactivate Event

Fields:
- Name
- Type
- Date
- Start Time
- End Time
- Venue
- Address
- Description
- Status

Hard delete must be blocked if dependent records exist.

Prefer archive/deactivate.

## Default Event
After migration:
- default to Wedding

If stored Event is inactive/unavailable:
- fall back safely to Wedding or first active Event

## Security
Event scoping must be enforced server-side.

Never trust client eventId blindly.

Server must validate:
- Event exists
- user has permission
- related record belongs to the specified Event
- mutation is allowed

Existing RBAC must remain intact.

## Audit Logging
Where possible, include Event context in AuditLog:
- Event ID
- Event Name

If schema does not support direct fields, use metadata/details JSON.

## Backward Compatibility
Existing routes must continue to work:
- /admin/budget
- /admin/vendors
- /admin/guests
- /admin/tasks

Do not create mandatory duplicated routes such as:
`/admin/homecoming/budget`

Existing personalized invitation URLs must remain valid.

## Performance
Do not load all Event data for a specific Event view.

Use server-side filters:
`WHERE eventId = activeEventId`

Avoid N+1 queries.

Use Prisma select/include/groupBy/aggregate appropriately.

## Acceptance Criteria
- [ ] Admin Event selector exists
- [ ] Wedding selectable
- [ ] Homecoming selectable
- [ ] All Events selectable
- [ ] Selection persists across navigation and refresh
- [ ] Active Event visibly shown
- [ ] Existing routes unchanged
- [ ] Dashboard event-aware
- [ ] Budget event-aware
- [ ] Contributions event-aware
- [ ] Guests use shared identity + event membership
- [ ] Vendors remain shared and calculations are event-scoped
- [ ] Tasks event-aware
- [ ] Invitations enforce event visibility
- [ ] Reports support Event filter
- [ ] Existing production data migrated to Wedding
- [ ] Existing invitation links still work
- [ ] Server validates event associations
- [ ] Existing RBAC remains enforced
- [ ] All Events creation requires explicit Event
- [ ] Budget category dependency checks consider all Events

## Test Scenarios
### TC01 Switch to Homecoming
Expected:
- Dashboard, Budget, Guests, Vendors, Tasks switch to Homecoming
- selection persists during navigation

### TC02 Switch back to Wedding
Expected:
- existing Wedding data remains unchanged
- no Homecoming records appear

### TC03 Create Homecoming Budget Item
Expected:
- BudgetItem.eventId = Homecoming.id
- does not appear in Wedding view

### TC04 All Events Budget
Expected:
- Wedding + Homecoming items visible
- Event label shown
- totals correct

### TC05 Existing Data Migration
Expected:
- existing BudgetItems assigned to Wedding
- existing Tasks assigned to Wedding
- existing Guest/Invitation relationships preserved
- current invitation codes still work

### TC06 Guest in Both Events
Expected:
- one Guest identity
- two EventGuest memberships
- independent RSVP data

### TC07 Vendor in Both Events
Expected:
- one Vendor identity
- event-specific BudgetItems/payments
- Wedding, Homecoming, and All Events totals correct

### TC08 Add Record from All Events
Expected:
- Event selection required
- save blocked until Event chosen

### TC09 Budget Category Dependency Across Events
Expected:
- category deletion blocked if referenced by Homecoming even while viewing Wedding

### TC10 Security
Attempt to mutate a Homecoming record using a Wedding context/record mismatch.
Expected:
- server rejects
- no cross-event corruption

## Antigravity Implementation Direction
Before coding:
1. Inspect current Prisma schema
2. Identify models requiring event scoping
3. Inspect Admin layout/header
4. Inspect current routes
5. Inspect server actions
6. Inspect Guest and Invitation relationships
7. Inspect Vendor-Budget integration
8. Inspect permissions and AuditLog
9. Identify migration/backward compatibility risks

Then provide a short implementation plan covering:
- models to change
- migration strategy
- event context approach
- pages affected
- server actions affected
- UI components affected
- security
- risks

Then proceed with implementation. Do not stop after planning.

## Post-Implementation
Run:
1. Prisma validation
2. Migration review
3. TypeScript checks
4. Lint
5. Build
6. Automated tests if available
7. Manual Wedding context test
8. Manual Homecoming context test
9. All Events test
10. Refresh/navigation persistence test
11. Guest multi-event test
12. Vendor financial scoping test
13. Budget create/edit/delete test
14. Permission test
15. Existing invitation URL test
16. Mobile event switcher test

Fix implementation issues before marking complete.

## Final Report
Provide:
- files created
- files modified
- Prisma changes
- migration created
- data migration behavior
- event selector implementation
- modules made event-aware
- Homecoming behavior
- All Events behavior
- RBAC/security changes
- Audit changes
- tests performed
- known limitations
- manual deployment steps if any

## Definition of Done
The task is complete only when:
- Wedding and Homecoming are managed from the same Admin application
- switching Active Event changes all relevant module data context
- existing Wedding production data remains intact
- Homecoming has independent Guests, Budget, Tasks, Invitations, and Schedule
- shared Guest and Vendor identities work safely across Events
- financial data stays separated correctly
- All Events provides useful combined reporting
- existing routes and invitation links remain functional
- event scoping is enforced server-side
- no duplicate Homecoming-specific module architecture is introduced
