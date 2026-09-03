# Defect Report

**Date:** September 3, 2026
**Cycle:** 1

## Summary of Defects

| Defect ID | Module | Severity | Title | Status |
|---|---|---|---|---|
| DEF-001 | Vendors | HIGH | Vendor creation API fails due to schema mismatch (`vendorName` vs `name`) | OPEN |
| DEF-002 | UI Tests | BLOCKER | Browser Subagent cannot initialize to verify UI rendering | OPEN |

---

## Detailed Defects

### DEF-001: Vendor Creation API Schema Mismatch
- **Module:** 17. Vendors (VENDOR-001)
- **Severity:** HIGH
- **Description:** When attempting to create a new vendor via backend logic, Prisma throws a `PrismaClientValidationError` because the `name` field is provided, but the schema strictly requires `vendorName`.
- **Expected Result:** The vendor is saved successfully.
- **Actual Result:** Prisma throws: `Argument vendorName is missing.`
- **Recommended Fix:** Ensure the frontend API actions and forms pass the `vendorName` key instead of `name` when creating or updating `Vendor` entities.

### DEF-002: Infrastructure Blocker for UI Automation
- **Module:** UI/E2E
- **Severity:** BLOCKER (Infrastructure)
- **Description:** Playwright dependencies threw a 404 error during autonomous browser initialization, preventing E2E visual verification of the Public Website (Passport Intro, TimePicker).
- **Recommended Fix:** The QA environment requires the correct Playwright binaries. Until resolved, all visual tests must be executed manually.
