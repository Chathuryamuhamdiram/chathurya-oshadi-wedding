# Regression Test Plan

**Date:** September 3, 2026
**Target Cycle:** 2

## Objective
To re-test all failed test cases documented in the Cycle 1 `DEFECT_REPORT.md` to ensure they have been resolved, and to verify that the core system functionality remains unaffected by those fixes.

## Scope of Regression

### 1. Fix Verification (Retesting)
The following specific test cases must be re-executed once development deploys the fixes:
- **VENDOR-001**: Verify that a Vendor can be successfully created without throwing a schema mismatch error.

### 2. Core Stability (Sanity Testing)
The following critical paths must be run alongside the fix verification to ensure no regressions were introduced:
- **AUTH-001**: SUPER_ADMIN login success.
- **RSVP-RULE-001**: Valid family RSVP saving.
- **GUEST-004**: Duplicate code creation blocking.
- **BUDGET-004 / VENDOR-004**: Financial dependency cascade deletion safety.

### 3. Blocked UI Modules (Pending Infrastructure)
The visual UI test cases were entirely blocked during Cycle 1 due to the browser automation environment. These must be executed fully as new tests in Cycle 2 once the environment is fixed (or tested manually):
- The `TimePicker` custom component.
- The Passport Animation.
- Mobile responsiveness matrix.
