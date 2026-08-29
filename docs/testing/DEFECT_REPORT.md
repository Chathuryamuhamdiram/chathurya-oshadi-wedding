# Defect Report

## Open Defects

| Defect ID | Module | Severity | Priority | Steps to Reproduce | Expected | Actual |
|---|---|---|---|---|---|---|
| BUG-001 | RBAC / Auth | CRITICAL | HIGH | 1. Log in as FAMILY_MEMBER.<br>2. Manually change URL to /admin/budget or /admin/guests. | Access should be denied (403 or redirect). | Page renders successfully, exposing all financial data and guest lists. (Server actions are protected, but read access is not). |
| BUG-002 | RBAC / Tasks | HIGH | HIGH | 1. Log in as FAMILY_MEMBER.<br>2. Navigate to /admin/tasks. | Only tasks assigned to the current user should be visible. | All tasks across the entire system are visible, bypassing privacy. |
| BUG-003 | Guestbook | HIGH | HIGH | 1. Submit a Guestbook entry via the public UI. | Entry should require admin approval before becoming visible. | isPublic defaults to 	rue in the database schema, meaning all submissions are instantly public. |

## Data Impact & Security
**BUG-001** and **BUG-002** are severe data privacy leaks that violate the business rules of the platform by allowing unauthorized roles to read highly sensitive financial and task data.
