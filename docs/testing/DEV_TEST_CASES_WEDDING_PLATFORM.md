# Chathurya & Oshadi Wedding Platform — Developer Test Case Suite

**Purpose:** Developer-level functional, integration, security, UI, and regression testing for the full wedding platform using Antigravity.

**Primary Test Environment:** `http://localhost:3000`  
**Production Reference:** `https://chathurya-oshadi-wedding.vercel.app/`

---

## 1. Antigravity Execution Rules

For every test case record:

- Test Case ID
- Module
- Scenario
- Priority
- Preconditions
- Test Data
- Steps
- Expected Result
- Actual Result
- Status: PASS / FAIL / BLOCKED / NOT APPLICABLE
- Severity: BLOCKER / CRITICAL / HIGH / MEDIUM / LOW
- Evidence
- Route / API / Component
- Database Verification
- Recommended Fix

**Important:** Do not fix defects during the first test cycle. Complete the full cycle, record all failures, then prepare the defect report and regression plan.

---

## 2. Roles

- `SUPER_ADMIN`
- `ADMIN`
- `FAMILY_MEMBER`
- `VIEWER`

There is **no COORDINATOR role**.

---

## 3. Mandatory Business Rules

```text
confirmed_guest_count <= allowed_guest_count
liquor_count <= confirmed_guest_count
```

Additional mandatory rules:

- FAMILY_MEMBER must not access admin financial modules.
- VIEWER must not create, update, delete, approve, assign, or change status.
- ADMIN must not delete financial records unless explicitly granted that permission.
- Server-side authorization is mandatory.
- Invitation codes must resolve only to their own guest/family.
- Unapproved guestbook messages must never appear publicly.

---

## 4. Test Data

Create:

### Guest A — Family
```text
Display Name: Perera Family
Invitation Type: FAMILY
Allowed Guests: 5
WhatsApp Number: 0712345678
```

### Guest B — Individual
```text
Display Name: Test Individual
Invitation Type: INDIVIDUAL
Allowed Guests: 1
WhatsApp Number: 0771234567
```

### Guest C — Multiple Match
Use the same phone number as Guest A.

### Users
```text
SUPER_ADMIN_TEST
ADMIN_TEST
FAMILY_MEMBER_A
FAMILY_MEMBER_B
VIEWER_TEST
```

### Vendor
Create:
1. Vendor without financial records
2. Vendor with linked financial records

### Task
```text
Title: Confirm Flower Arrangements
Assigned To: FAMILY_MEMBER_A
Status: Pending
```

---

# 5. Authentication

## AUTH-001 — Valid SUPER_ADMIN Login
**Priority:** Critical

**Steps**
1. Open login page.
2. Enter valid SUPER_ADMIN credentials.
3. Submit.

**Expected**
- Login succeeds.
- Admin dashboard loads.
- Correct role/session loaded.
- No console error.

## AUTH-002 — Invalid Password
**Expected**
- Login rejected.
- Generic error.
- No session created.
- No account-sensitive data leaked.

## AUTH-003 — Protected Route Without Login
Open:

```text
/admin/guests
```

**Expected:** Redirect to login or secure unauthorized page.

## AUTH-004 — Session Persistence
Login, refresh, navigate across admin modules.

**Expected:** Session remains valid according to configured auth behavior.

---

# 6. RBAC

## RBAC-001 — SUPER_ADMIN Full Access
Verify access to Dashboard, Guests, Invitations, RSVP, Tasks, Vendors, Calendar, Budget, Expenses, Contributions, Reports, Guestbook, Users, Settings, Audit.

## RBAC-002 — FAMILY_MEMBER Budget Direct URL
Open as FAMILY_MEMBER:

```text
/admin/budget
```

**Expected:** 403/equivalent. No budget data leaked.

## RBAC-003 — VIEWER Write Attempt
Attempt create/update/delete through UI and direct API.

**Expected:** Controls unavailable and server returns 403. DB unchanged.

## RBAC-004 — ADMIN Financial Delete
Attempt delete of Budget Item, Expense, Contribution.

**Expected:** Reject unless explicitly granted financial-delete permission.

## RBAC-005 — Family Task Isolation
FAMILY_MEMBER_A attempts to view FAMILY_MEMBER_B-only task.

**Expected:** Access denied and no data leakage.

---

# 7. Guest Management

## GUEST-001 — Create Individual Guest
**Expected:** Guest saved, unique invitation code generated, personalized URL works.

## GUEST-002 — Create Family Guest
Create Perera Family with allowed guest count 5.

**Expected:** Saved correctly.

## GUEST-003 — Edit Guest
Edit display name, phone, allowed guest count.

**Expected:** Changes persist after refresh.

## GUEST-004 — Duplicate Invitation Code
Attempt to reuse an existing code.

**Expected:** Rejected.

## GUEST-005 — Delete Guest Without Dependencies
Delete a test guest, then open old invite URL.

**Expected:** Guest removed, audit created, invite returns safe “Invitation Not Found”, code not reused.

## GUEST-006 — Delete Guest With RSVP
Delete guest with RSVP.

**Expected:** Dependencies handled safely; no raw Prisma/foreign-key error.

---

# 8. Personalized Invitations

## INV-001 — Valid Code
Open:

```text
/invite/<VALID_CODE>
```

**Expected:** Correct guest/family content only.

## INV-002 — Invalid Code
Open:

```text
/invite/INVALIDCODE
```

**Expected:** Safe invalid invitation screen; no other guest data.

## INV-003 — Guest Isolation
Open Guest A then Guest B.

**Expected:** Each code shows only its own invitation.

## INV-004 — Invitation Context Storage
Open valid invite → go to homepage → click RSVP.

**Expected:** Return to same personalized invite.

## INV-005 — Invalid Code Not Stored
Open invalid code and inspect sessionStorage.

**Expected:** Invalid code is not saved as `weddingInvitationCode`.

---

# 9. Smart RSVP Entry

## RSVP-001 — Personalized Link First
Valid invite → homepage → RSVP.

**Expected:** Immediate redirect to same invite.

## RSVP-002 — Homepage First
Clear invitation context → homepage → RSVP.

**Expected:** “Find Your Invitation” modal opens.

## RSVP-003 — Local Phone
Input:

```text
0712345678
```

**Expected:** Correct invite found.

## RSVP-004 — Phone With Spaces
Input:

```text
071 234 5678
```

**Expected:** Normalizes to same guest.

## RSVP-005 — International Phone
Input:

```text
+94712345678
```

**Expected:** Normalizes correctly.

## RSVP-006 — Country Code Without Plus
Input:

```text
94712345678
```

**Expected:** Normalizes correctly.

## RSVP-007 — Invalid Phone
Input:

```text
12345
```

**Expected:** Validation error; no broad DB lookup/data leak.

## RSVP-008 — Multiple Matches
Use a phone linked to two invitations.

**Expected:** Show only minimal `displayName` selection. No guest counts, liquor, notes, admin or financial data.

## RSVP-009 — Manual Valid Code
Use fallback code entry.

**Expected:** Correct personalized invite opens.

## RSVP-010 — Invalid Manual Code
**Expected:** Safe error, no crash.

---

# 10. RSVP Validation

## RSVP-RULE-001 — Valid Family RSVP
```text
Allowed = 5
Confirmed = 4
Liquor = 2
```
**Expected:** Accepted and persisted.

## RSVP-RULE-002 — Confirmed Exceeds Allowed
```text
Allowed = 5
Confirmed = 6
```
**Expected:** Server rejects; DB unchanged.

## RSVP-RULE-003 — Liquor Exceeds Confirmed
```text
Confirmed = 3
Liquor = 4
```
**Expected:** Server rejects.

## RSVP-RULE-004 — Boundary
```text
Allowed = 5
Confirmed = 5
Liquor = 5
```
**Expected:** Accepted if liquor is enabled.

## RSVP-RULE-005 — Negative Count
Submit `confirmedGuestCount = -1`.

**Expected:** Reject.

## RSVP-RULE-006 — Decimal Count
Submit `confirmedGuestCount = 2.5`.

**Expected:** Reject.

---

# 11. Public Wedding Website

## PUBLIC-001 — Homepage Sections
Verify:
1. Wedding Passport Intro
2. Hero
3. Our Story
4. Event Schedule
5. Gallery
6. Guestbook

## PUBLIC-002 — Passport Intro
**Expected:** Intro overlays page, body scroll locked, navigation hidden.

## PUBLIC-003 — Begin Our Journey
Click `BEGIN OUR JOURNEY`.

**Expected:** Animation starts once; duplicate click prevented.

## PUBLIC-004 — Passport Left Page
Verify:
```text
THE WEDDING OF
Chathurya & Oshadi
08 OCTOBER 2026
HIKKADUWA
SRI LANKA
```

## PUBLIC-005 — Passport Right Page
Verify:
```text
A NEW CHAPTER BEGINS

Two hearts,
one journey,
and a lifetime waiting ahead.

Thank you for being part of
the beginning of our forever.
```

**Expected:** No duplicated names/date/location and no Poruwa/Reception details.

## PUBLIC-006 — Forever Begins Stamp
**Expected:** Stamp appears without layout break.

## PUBLIC-007 — Intro Completion
**Expected:** Overlay unmounts, body scroll restored, Hero interactive, floating nav visible.

## PUBLIC-008 — Mobile Intro
Test 320, 375, 390, 430px.

**Expected:** No horizontal overflow, passport readable, CTA visible, animation fits viewport.

---

# 12. Hero

## HERO-001 — Wedding Details
Verify:
```text
Chathurya & Oshadi
08 October 2026
Hikkaduwa, Sri Lanka
```

## HERO-002 — Countdown
Verify countdown targets 08 October 2026 and shows valid values.

## HERO-003 — Responsive Hero
Test mobile/tablet/desktop.

---

# 13. Event Schedule

## EVENT-001 — Poruwa
Verify:
```text
08:50 AM
Hotel River Park
Hikkaduwa, Sri Lanka
```

## EVENT-002 — Reception
Verify:
```text
10:30 AM
Hotel Grand Palace
Hikkaduwa, Sri Lanka
```

## EVENT-003 — Map Links
Both map actions must open correct locations.

---

# 14. Gallery

## GALLERY-001 — Images Load
No 404/broken assets.

## GALLERY-002 — Broken Image Handling
Invalid asset must not break page.

## GALLERY-003 — Mobile Gallery
No overlap/horizontal overflow.

---

# 15. Guestbook

## GB-001 — Submit Valid Wish
Submit valid name/message.

**Expected:** Saved.

## GB-002 — Moderation
New wish must remain hidden publicly until approved.

## GB-003 — Approve Wish
Approve in admin.

**Expected:** Appears publicly.

## GB-004 — Delete Wish
Authorized admin deletes wish.

**Expected:** Removed, audit created.

## GB-005 — XSS
Submit:
```html
<script>alert('xss')</script>
```

**Expected:** Never executes.

---

# 16. Tasks

## TASK-001 — Create Task
Assign FAMILY_MEMBER_A.

**Expected:** Saved.

## TASK-002 — Family Visibility
FAMILY_MEMBER_A sees assigned task.

## TASK-003 — Other Family Hidden
FAMILY_MEMBER_B does not see it.

## TASK-004 — Update Own Status
Allowed member updates task status.

## TASK-005 — Complete Task
Completed task persists and unnecessary reminders stop.

## TASK-006 — Delete Task
Authorized delete → confirmation → removal → audit.

---

# 17. Vendors

## VENDOR-001 — Create Vendor
**Expected:** Saved.

## VENDOR-002 — Edit Vendor
**Expected:** Changes persist.

## VENDOR-003 — Delete Vendor Without Finance
**Expected:** Authorized hard delete works.

## VENDOR-004 — Vendor With Finance
**Expected:** Hard delete blocked; archive offered.

## VENDOR-005 — Archive
**Expected:** `isArchived = true`; historical records retained; excluded from new selection lists.

## VENDOR-006 — Restore
**Expected:** `isArchived = false`; audit RESTORE created.

---

# 18. Budget

## BUDGET-001 — Create Budget Item
**Expected:** Saved.

## BUDGET-002 — Edit Budget Item
**Expected:** Persists.

## BUDGET-003 — Delete Empty Budget Item
SUPER_ADMIN only.

**Expected:** Protected confirmation, successful deletion.

## BUDGET-004 — Budget Item With Expenses
**Expected:** Delete blocked. Expenses must not silently cascade-delete.

---

# 19. Expenses

## EXP-001 — Create Expense
**Expected:** Saved and totals updated.

## EXP-002 — Edit Expense
**Expected:** Totals recalculate correctly.

## EXP-003 — Delete as SUPER_ADMIN
Typed `DELETE` required. Audit created.

## EXP-004 — Delete as ADMIN
**Expected:** 403 unless explicitly permitted.

---

# 20. Contributions

## CONT-001 — Add Contribution
**Expected:** Saved; totals updated.

## CONT-002 — Delete Contribution
SUPER_ADMIN only; typed DELETE; audit created.

---

# 21. Calendar & Time Picker

## CAL-001 — Create Event
**Expected:** Appears on calendar.

## CAL-002 — Edit Event
**Expected:** Date/time changes persist.

## CAL-003 — Delete Event
Authorized delete works and is audited.

## CAL-004 — Custom Time Picker
Verify hour/minute/AM-PM, Apply and Cancel.

## CAL-005 — 12h to 24h Conversion
Select:
```text
10:30 PM
```
Expected backend:
```text
22:30
```

## CAL-006 — Existing Time Load
Stored:
```text
08:50
```
Expected UI:
```text
08:50 AM
```

---

# 22. Global Delete Functionality

## DEL-001 — Reusable Delete Dialog
Verify consistent confirmation UI.

## DEL-002 — Typed Confirmation
High-risk record cannot delete until exact `DELETE` entered.

## DEL-003 — Direct Unauthorized Delete API
FAMILY_MEMBER request.

**Expected:** 403.

## DEL-004 — Audit Entry
Verify actor, action, entity/module, ID, timestamp.

## DEL-005 — Dependency Error Handling
No raw Prisma/SQL error exposed.

---

# 23. User Management

## USER-001 — Deactivate User
SUPER_ADMIN deactivates normal user.

## USER-002 — Reactivate User
User restored.

## USER-003 — Self-Deactivation
SUPER_ADMIN cannot deactivate themselves.

## USER-004 — Last SUPER_ADMIN
Cannot deactivate final active SUPER_ADMIN.

---

# 24. Audit Log

## AUDIT-001 — Guest Delete Logged
## AUDIT-002 — Vendor Archive Logged
## AUDIT-003 — Vendor Restore Logged
## AUDIT-004 — Financial Delete Logged

All must contain correct actor/action/entity/timestamp without unnecessary sensitive data.

---

# 25. WhatsApp Sharing

## WA-001 — Individual Invite
Correct guest and personalized link.

## WA-002 — Family Invite
Correct family wording.

## WA-003 — Number Normalization
Test:
```text
0712345678
+94712345678
94712345678
```

## WA-004 — No Internal Data
No liquor count, admin notes, budget, internal IDs.

---

# 26. Personalized Invitation → Main Website CTA

## CTA-001 — Continue to Wedding Website
From `/invite/<code>`, click:

```text
CONTINUE TO WEDDING WEBSITE →
```

**Expected:** Main homepage opens.

## CTA-002 — Context Preserved
After CTA → click homepage RSVP.

**Expected:** Return to the same personalized invitation.

---

# 27. Performance

## PERF-001 — Homepage
No blocking runtime errors or repeated failed asset requests.

## PERF-002 — Large Guest List
Admin guest list remains usable with larger seeded data.

## PERF-003 — Large Task List
Reasonable interaction/load performance.

---

# 28. API & Security

## SEC-001 — Malformed Guest Lookup
Reject safely.

## SEC-002 — Lookup Data Exposure
Only minimum fields returned.

## SEC-003 — Invitation Enumeration
Random invite codes reveal no unrelated guest information.

## SEC-004 — Injection-Like Inputs
Test suspicious input in phone, invitation code, search, guestbook.

**Expected:** No DB error/query bypass.

## SEC-005 — XSS Across Editable Fields
No script execution.

---

# 29. Responsive Matrix

Test:

```text
320x568
375x667
390x844
430x932
768x1024
1366x768
1920x1080
```

Verify:
- Intro
- Hero
- RSVP modal
- Personalized invitation
- Admin tables
- Time picker
- Delete dialog
- Guestbook
- Gallery
- Event Schedule

---

# 30. Browser Matrix

At minimum:

- Chrome
- Edge
- Mobile Chrome
- Safari/iPhone if available

Focus on:
- time picker
- passport animation
- RSVP modal
- forms
- floating navigation

---

# 31. Critical End-to-End Test

## E2E-001 — Full Guest Journey

1. SUPER_ADMIN creates `Perera Family`, allowed guests 5, phone 0712345678.
2. System creates unique invitation code.
3. Admin uses WhatsApp share.
4. Guest opens personalized invite.
5. Invitation context is stored.
6. Guest opens passport.
7. Guest continues to main wedding website.
8. Guest clicks RSVP.
9. System returns to personalized invitation.
10. Submit:
```text
Confirmed Guests = 4
Liquor Count = 2
```
11. Verify DB.
12. Verify admin RSVP dashboard.
13. Guest submits guestbook wish.
14. Confirm it stays pending.
15. Admin approves.
16. Confirm it appears publicly.
17. Admin assigns task to FAMILY_MEMBER_A.
18. FAMILY_MEMBER_A sees only own task.
19. Member completes task.
20. Admin creates vendor.
21. Add linked financial item.
22. Attempt vendor deletion.
23. Confirm vendor archives instead of destroying financial history.
24. Verify audit log.

**Expected:** Entire journey succeeds without privacy leak, authorization bypass, data corruption, broken routing, or uncaught error.

---

# 32. Critical Negative E2E Tests

## NEG-001
Allowed 5, Confirmed 6 → Reject.

## NEG-002
Confirmed 3, Liquor 4 → Reject.

## NEG-003
FAMILY_MEMBER `/admin/budget` → 403.

## NEG-004
VIEWER direct write API → 403.

## NEG-005
Invalid invite code → Safe invalid page.

## NEG-006
Unapproved guestbook wish → Hidden publicly.

## NEG-007
ADMIN financial delete without permission → 403.

## NEG-008
Family A accesses Family B task → Denied.

---

# 33. Regression Checklist

After fixes rerun:

- Authentication
- RBAC
- Guest CRUD/delete
- Invitation routing
- Smart RSVP lookup
- RSVP validation
- Passport intro
- Personalized invite → homepage CTA
- Guestbook moderation
- Tasks
- Vendor archive/restore
- Financial permissions/delete
- Calendar
- Custom time picker
- Audit logs
- Mobile responsiveness

---

# 34. Go-Live NO-GO Conditions

NO-GO if any of these exist:

- RBAC bypass
- FAMILY_MEMBER/VIEWER can access protected admin/financial data
- RSVP limits bypassable server-side
- Invitation code exposes another guest
- Guest/privacy leak
- Financial corruption
- Budget deletion silently deletes expenses
- Unauthorized delete succeeds
- Guestbook XSS
- Critical authentication failure
- Data loss
- Broken personalized invite routing
- Main public flow unusable on mobile
- Intro overlay blocks site after animation
- Raw DB errors exposed

---

# 35. Test Summary Template

```text
TOTAL TEST CASES:
PASSED:
FAILED:
BLOCKED:
NOT APPLICABLE:

BLOCKER:
CRITICAL:
HIGH:
MEDIUM:
LOW:

OVERALL RESULT:
GO / NO-GO
```

---

# 36. Defect Format

```text
Defect ID:
Title:
Module:
Severity:
Related Test Case:
Environment:
Preconditions:

Steps to Reproduce:
1.
2.
3.

Expected Result:

Actual Result:

Evidence:

Route/API/Component:

Database Impact:

Security Impact:

Recommended Fix:

Regression Areas:
```

---

# 37. Required Antigravity Outputs

After the first full execution cycle create:

```text
docs/testing/SYSTEM_TEST_RESULTS.md
docs/testing/DEFECT_REPORT.md
docs/testing/REGRESSION_TEST_PLAN.md
docs/testing/GO_LIVE_READINESS.md
```

Final execution instruction:

1. Use this file as the test source of truth.
2. Test module-by-module.
3. Do not skip negative/security tests.
4. Validate APIs/server actions directly, not only UI.
5. Verify database persistence with Prisma/database queries where possible.
6. Record evidence for every failure.
7. Do not fix during the first test pass.
8. Complete the defect report.
9. Provide GO / NO-GO recommendation.
