# System Test Results

| Test ID | Module | Scenario | Status | Severity if Failed |
|---|---|---|---|---|
| TC-01 | Auth/RBAC | Verify SUPER_ADMIN full access | PASS | HIGH |
| TC-02 | Auth/RBAC | Verify ADMIN restricted access | PASS | HIGH |
| TC-03 | Auth/RBAC | Verify FAMILY_MEMBER restricted access (UI) | PASS | HIGH |
| TC-04 | Auth/RBAC | Verify VIEWER read-only access (UI) | PASS | HIGH |
| TC-05 | Security | Direct URL Access to protected routes (e.g. /admin/budget as FAMILY_MEMBER) | FAIL | CRITICAL |
| TC-06 | Security | API direct access without correct role | PASS (Server Actions check permissions) | CRITICAL |
| TC-07 | Invitation | Generate Family Invitation (allowed_guest_count = 5) | PASS | HIGH |
| TC-08 | Invitation | Personalized URL routing (data leakage check) | PASS | BLOCKER |
| TC-09 | RSVP | Mandatory hard limit: confirmed_guest_count <= allowed_guest_count | PASS (Blocked in actions.ts) | BLOCKER |
| TC-10 | RSVP | Mandatory hard limit: liquor_count <= confirmed_guest_count | PASS (Blocked in actions.ts) | BLOCKER |
| TC-11 | Guestbook | Unapproved message should not be publicly visible | FAIL | HIGH |
| TC-12 | Finance | Budget vs Expense calculation (100k budget, 30k payment) | PASS | CRITICAL |
| TC-13 | Finance | Vendor link updates Budget totals | PASS | HIGH |
| TC-14 | Tasks | Family Member task visibility (Direct API/URL fetch) | FAIL | HIGH |
| TC-15 | UI/UX | Public Landing Page loading and responsive test | PASS | MEDIUM |

## Summary Execution
- UI constraints and backend actions mostly pass.
- Major failure in page-level Server-Side RBAC layout routing.
