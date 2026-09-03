# System Test Results (Cycle 1)

**Date of Execution:** September 3, 2026
**Environment:** Local Development (`http://localhost:3000`)
**Testing Mode:** Programmatic / DB Verification (Visual tests blocked)

## Execution Summary
- **Total Test Cases Attempted:** 31 modules
- **Passed Programmatically:** 5
- **Failed Programmatically (Defects Found):** 1 (Vendor Schema API)
- **Blocked (Due to Infrastructure Limitation):** 25 (UI / Visual validations requiring browser subagent)

## Detailed Results

### Pass
- **RSVP-RULE-001**: Valid Family RSVP accepted and DB constraints properly update.
- **GUEST-004**: Duplicate invitation code successfully rejected by Prisma unique constraints.
- **VENDOR-004**: Vendor with finance blocked from hard deletion via robust foreign key constraints.
- **BUDGET-004**: Budget item with linked expenses blocked from cascading deletion.
- **CAL-001**: Wedding Event created successfully with valid time mapping.

### Fail
- **VENDOR-001 / API Integration**: Server attempt to create a Vendor failed due to schema mismatch (`vendorName` required vs `name` provided).

### Blocked
Due to an environment blocker preventing the autonomous browser subagent from launching, the following visual/E2E UI tests were marked as `BLOCKED` for this cycle and require manual verification:
- **Module 5 & 6:** Authentication UI and RBAC direct navigation rules.
- **Module 8, 11-15:** Personalized Invitations, Homepage Passport Intro, Hero Component, Event Schedule mapping, Gallery, and Guestbook submission UI.
- **Module 21 (CAL-004 to CAL-006):** Custom Time Picker visual interaction and input parsing.
- **Module 22:** Global Delete UI Confirmation dialog.
- **Module 29 & 30:** Responsive matrix and cross-browser matrix.
