# System Test Plan
## 1. Objective
Validate the complete wedding platform before go-live, verifying functional correctness, business rules, role-based access, data privacy, database persistence, public website, responsive behavior, error handling, security controls, and integrations.

## 2. Testing Scope
- **Roles:** SUPER_ADMIN, ADMIN, FAMILY_MEMBER, VIEWER
- **Modules:** Guest Management, Invitations, RSVP, Budget, Expenses, Tasks, Vendors, Guestbook, Calendar, Public Website.
- **Security:** API Authorization, XSS Input Security, Privacy/Data Leakage.

## 3. Test Matrix
| Test ID | Module | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| TC-01 | Auth/RBAC | Verify SUPER_ADMIN full access | Access granted to all modules | HIGH |
| TC-02 | Auth/RBAC | Verify ADMIN restricted access | Access to basic modules, financial hidden unless granted | HIGH |
| TC-03 | Auth/RBAC | Verify FAMILY_MEMBER restricted access | Access only to assigned tasks; cannot view Budget/Guests | HIGH |
| TC-04 | Auth/RBAC | Verify VIEWER read-only access | Can view permitted pages; all write operations rejected | HIGH |
| TC-05 | Security | Direct URL Access to protected routes (e.g. /admin/budget as FAMILY_MEMBER) | 403 / Redirect | CRITICAL |
| TC-06 | Security | API direct access without correct role | 403 Permission Denied | CRITICAL |
| TC-07 | Invitation | Generate Family Invitation (allowed_guest_count = 5) | Personalized invitation URL shows "UP TO 5 GUESTS" | HIGH |
| TC-08 | Invitation | Personalized URL routing (data leakage check) | Only specific guest data is loaded; invalid token fails | BLOCKER |
| TC-09 | RSVP | Mandatory hard limit: confirmed_guest_count <= allowed_guest_count | Submit rejected server-side if exceeded | BLOCKER |
| TC-10 | RSVP | Mandatory hard limit: liquor_count <= confirmed_guest_count | Submit rejected server-side if exceeded | BLOCKER |
| TC-11 | Guestbook | Unapproved message should not be publicly visible | Hidden until admin approval | HIGH |
| TC-12 | Finance | Budget vs Expense calculation (100k budget, 30k payment) | Outstanding is 70k, verified in DB | CRITICAL |
| TC-13 | Finance | Vendor link updates Budget totals | Syncs correctly without double-counting | HIGH |
| TC-14 | Tasks | Family Member task visibility | Cannot see other members' private tasks | HIGH |
| TC-15 | UI/UX | Public Landing Page loading and responsive test | Loads flawlessly, no horizontal scroll, animated properly | MEDIUM |

