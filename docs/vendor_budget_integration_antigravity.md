# Vendor–Budget Integration & Budget Deletion Enhancement
## Antigravity Implementation Specification

## 1. Objective

Enhance the Wedding Platform by tightly integrating the **Vendor Management** and **Budget Management** modules while preserving clear financial ownership and accounting integrity.

The implementation must also extend the Budget Management module so authorized users can safely delete:

- Budget Items
- Budget Categories
- Expenses
- Contributions

Deletion must respect permissions, dependencies, referential integrity, and audit requirements.

---

# 2. Core Design Principle

Maintain these responsibilities throughout the implementation:

- **Contribution** = money coming into the wedding fund
- **Budget Item** = planned financial commitment
- **Expense** = actual money paid
- **Vendor** = person/business the money is being paid to
- **Budget Category** = grouping of planned wedding costs

The system must avoid duplicate financial ledgers.

The **Expense** table must remain the source of truth for actual payments.

Vendor payment totals must be derived from linked Budget Items and Expenses.

---

# 3. Existing Technology

Use the existing project architecture:

- Next.js App Router
- TypeScript
- Prisma ORM
- Existing database
- Server Components for secure data fetching
- Client Components for interactive UI
- Next.js Server Actions for mutations
- Prisma transactions for financial mutations
- Existing authentication and RBAC system
- Existing:
  - `requirePermission`
  - `checkDeletePermission`
  - `AuditLog`
  - `PERMISSIONS.BUDGET_EDIT`
  - `SUPER_ADMIN`

Do not introduce another state management library unless absolutely required.

---

# 4. Data Model Integration

## 4.1 Vendor

Vendor represents the commercial agreement with a supplier.

Expected fields:

```prisma
model Vendor {
  id               String       @id @default(cuid())
  vendorName       String
  serviceCategory  String?

  contactName      String?
  phone            String?
  whatsappNumber   String?
  email             String?

  quotationAmount  Decimal?
  finalAmount      Decimal?

  nextPaymentDue   DateTime?

  status           VendorStatus @default(POTENTIAL)
  isArchived       Boolean      @default(false)

  budgetItems      BudgetItem[]

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}
```

Recommended status enum:

```prisma
enum VendorStatus {
  POTENTIAL
  SHORTLISTED
  CONFIRMED
  COMPLETED
  CANCELLED
}
```

Do not maintain a manually editable vendor payment balance.

If an existing `advancePaid` field is present:

- Keep temporarily only if required for migration compatibility.
- Stop using it as the source of truth.
- Prefer making it read-only/deprecated in the UI.
- New payments must be stored as `Expense` records.

---

## 4.2 Budget Category

```prisma
model BudgetCategory {
  id          String       @id @default(cuid())
  name        String
  description String?
  sortOrder   Int          @default(0)
  isActive    Boolean      @default(true)

  budgetItems BudgetItem[]

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

---

## 4.3 Budget Item

Each Budget Item may optionally link to one Vendor.

```prisma
model BudgetItem {
  id               String          @id @default(cuid())
  title            String
  estimatedCost    Decimal
  paidAmount       Decimal         @default(0)
  paymentDueDate   DateTime?
  paymentStatus    PaymentStatus   @default(NOT_STARTED)

  categoryId       String
  category         BudgetCategory  @relation(fields: [categoryId], references: [id])

  vendorId         String?
  vendor           Vendor?         @relation(fields: [vendorId], references: [id])

  expenses         Expense[]

  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
}
```

Rule:

- One Vendor may have multiple Budget Items.
- One Budget Item may link to zero or one Vendor.

---

## 4.4 Expense

Expense remains the actual outgoing money transaction.

Recommended enhancement:

```prisma
enum ExpenseType {
  ADVANCE
  INSTALLMENT
  FINAL_PAYMENT
  OTHER
}
```

Example:

```prisma
model Expense {
  id             String      @id @default(cuid())
  expenseName    String
  amount         Decimal
  expenseDate    DateTime
  paymentMethod  String?
  reference      String?
  notes          String?
  expenseType    ExpenseType @default(OTHER)

  budgetItemId   String
  budgetItem     BudgetItem  @relation(fields: [budgetItemId], references: [id])

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}
```

---

## 4.5 Contribution

Contribution remains independent from Vendor and Expense.

```prisma
enum ContributionStatus {
  RECEIVED
  PENDING
  CANCELLED
}
```

Only `RECEIVED` contributions affect cash calculations.

---

# 5. Vendor–Budget Integration

## 5.1 Linking a Vendor to a Budget Item

When creating or editing a Budget Item:

Add a Vendor selector.

Fields:

- Item Title
- Category
- Estimated Cost
- Payment Due Date
- Vendor
- Notes if supported

Vendor selection is optional.

When a Vendor is selected:

Display:

- Vendor name
- Vendor category
- Quotation amount
- Final contract amount
- Current amount paid
- Outstanding vendor balance

If the selected Vendor has a `finalAmount`, optionally show:

> Use vendor contract value as estimated budget?

Button:

`Use LKR X as Budget Estimate`

Do not automatically overwrite the user's estimate without confirmation.

---

## 5.2 Recording Vendor Payments

Vendor payments must be recorded as Expenses.

Add `Record Payment` action to Vendor details.

When clicked:

Navigate or open the Budget payment form with:

```text
/admin/budget?action=payment&vendorId=<vendorId>
```

The system should:

1. Find Budget Items linked to that Vendor.
2. Preselect the Vendor.
3. Allow user to select the linked Budget Item.
4. Enter:
   - Payment amount
   - Expense type
   - Expense date
   - Payment method
   - Reference
   - Notes
5. Create an Expense.
6. Recalculate the linked Budget Item.
7. Recalculate Vendor financial summary automatically.

---

# 6. Financial Calculation Rules

## 6.1 Budget Overview

### Planned Budget

```text
SUM(BudgetItem.estimatedCost)
```

### Total Contributions

```text
SUM(Contribution.amount)
WHERE status = RECEIVED
```

### Total Expenses

Preferred source:

```text
SUM(Expense.amount)
```

### Available Balance

```text
Total Contributions - Total Expenses
```

### Remaining Planned Cost

```text
Planned Budget - Total Expenses
```

### Funding Gap

```text
Planned Budget - Total Contributions
```

### Funding Progress

```text
(Total Contributions / Planned Budget) * 100
```

UI progress bar may visually cap at 100%.

Numerical values may show overfunding above 100%.

### Projected Surplus / Shortfall

```text
Total Contributions - Planned Budget
```

---

# 7. Vendor Financial Calculations

Vendor financial values must be derived.

## Total Paid to Vendor

```text
SUM(
  Expense.amount
  where Expense.BudgetItem.vendorId = Vendor.id
)
```

## Outstanding Vendor Balance

```text
MAX(Vendor.finalAmount - TotalPaidToVendor, 0)
```

## Vendor Payment Progress

```text
(TotalPaidToVendor / Vendor.finalAmount) * 100
```

## Vendor Payment Status

Rules:

```text
If TotalPaid == 0
  NOT_STARTED

If TotalPaid > 0 AND TotalPaid < finalAmount
  PARTIALLY_PAID

If TotalPaid >= finalAmount
  FULLY_PAID

If nextPaymentDue < today AND outstandingBalance > 0
  OVERDUE
```

Do not manually persist this Vendor payment status unless technically required.

Prefer deriving it.

---

# 8. Vendor Dashboard Changes

Add these KPI cards:

1. Active Vendors
2. Total Contract Value
3. Paid to Vendors
4. Outstanding Vendor Balance
5. Upcoming Payments

## Active Vendors

```text
COUNT(Vendor WHERE isArchived = false)
```

## Total Contract Value

```text
SUM(Vendor.finalAmount)
WHERE isArchived = false
```

## Paid to Vendors

Derived from linked Expenses.

## Outstanding Balance

```text
SUM(MAX(finalAmount - vendorTotalPaid, 0))
```

## Upcoming Payments

Include only Vendors where:

```text
isArchived = false
AND status = CONFIRMED
AND outstandingBalance > 0
AND nextPaymentDue >= today
AND nextPaymentDue <= today + 14 days
```

## Overdue

```text
nextPaymentDue < today
AND outstandingBalance > 0
```

Use red styling for overdue payment dates.

---

# 9. Vendor Detail Page

Create or enhance Vendor details screen.

Sections:

## Vendor Header

- Vendor name
- Service category
- Vendor status
- Archive status

## Contact Details

- Contact name
- Phone
- WhatsApp
- Email

## Commercial Details

- Quotation Amount
- Final Contract Amount

## Financial Summary

Display:

```text
Contract Value
Paid
Outstanding
Payment Progress
Next Payment Due
Payment Status
```

Actions:

- Record Payment
- View Budget
- Edit Vendor
- Archive Vendor
- Delete Vendor if permitted

## Linked Budget Items

Display:

- Budget Item
- Category
- Estimated Cost
- Vendor Contract Amount if relevant
- Paid
- Balance
- Payment Status

## Payment History

Show Expenses belonging to Budget Items linked to this Vendor.

Fields:

- Date
- Expense name
- Expense type
- Amount
- Payment method
- Reference

---

# 10. Budget Module UI Changes

Maintain the three tabs:

1. Overview
2. Budget Items
3. Contributions

---

## 10.1 Overview Tab

Show:

- Planned Budget
- Contributions Received
- Total Expenses
- Available Balance
- Remaining Planned Cost
- Funding Gap
- Projected Surplus / Shortfall
- Outstanding Vendor Commitments
- Funding Progress

### Outstanding Vendor Commitments

```text
SUM(
  MAX(Vendor.finalAmount - VendorTotalPaid, 0)
)
WHERE isArchived = false
AND status != CANCELLED
```

Optional additional metric:

### Projected Remaining Cash

```text
Total Contributions
- Total Expenses
- Outstanding Vendor Commitments
```

If negative:

Display in red and label as projected shortfall.

---

# 11. Budget Item Management

Users with `PERMISSIONS.BUDGET_EDIT` can:

- Add Budget Item
- Edit Budget Item
- Link Vendor
- Unlink Vendor
- Record Expense
- Edit Expense

Delete permissions remain controlled by the global delete permission system.

---

# 12. Budget Item Deletion

Add a Delete action for Budget Items.

## Permission

Required:

```text
checkDeletePermission
```

Expected role:

```text
SUPER_ADMIN
```

## Dependency Rule

A Budget Item must NOT be deleted if it has related Expenses.

If expenses exist:

Block deletion.

Display:

```text
This budget item cannot be deleted because it contains recorded expenses.
Delete the related expenses first before deleting this budget item.
```

Do not cascade delete expenses automatically.

This is intentional to protect financial history.

## Vendor Link

If the Budget Item is linked to a Vendor but has no Expenses:

Deletion is allowed.

The Vendor itself must remain unchanged.

## Confirmation

Use the shared Delete Confirmation component.

Recommended confirmation:

Title:

```text
Delete Budget Item
```

Description:

```text
This will permanently delete the selected budget item.
This action cannot be undone.
```

Show the record name.

Typed `DELETE` confirmation is optional for Budget Items but recommended for high-value financial records.

## Audit Log

On successful deletion write:

- User ID
- User name/email if available
- Action: `DELETE`
- Entity type: `BUDGET_ITEM`
- Entity ID
- Record name
- Timestamp
- Snapshot of deleted record if supported
- Reason if your AuditLog supports it

---

# 13. Budget Category Deletion

Add Delete action for Budget Categories.

## Permission

Required:

```text
checkDeletePermission
```

Expected:

```text
SUPER_ADMIN
```

## Critical Dependency Rule

A Budget Category must NOT be deleted if it contains any Budget Items.

Example blocked message:

```text
This category cannot be deleted because it contains 4 budget items.
Move or delete those budget items before deleting this category.
```

Do not automatically cascade delete Budget Items.

## Empty Category

If:

```text
category.budgetItems.length === 0
```

allow deletion.

## Confirmation

Require typed confirmation for categories.

User must type:

```text
DELETE
```

before enabling the confirm button.

Dialog:

```text
Delete Budget Category

Category:
Photography

This category will be permanently deleted.
This action cannot be undone.

Type DELETE to confirm.
```

## Audit

Write AuditLog:

- `DELETE`
- `BUDGET_CATEGORY`
- Category ID
- Category name
- User
- Timestamp

---

# 14. Expense Deletion

Allow authorized deletion.

Deleting an Expense must run inside a Prisma transaction.

Transaction logic:

1. Load Expense.
2. Load parent Budget Item.
3. Delete Expense.
4. Recalculate total remaining Expenses for parent item.
5. Set:

```text
BudgetItem.paidAmount = SUM(remaining expenses)
```

6. Recalculate payment status.
7. Commit.
8. Vendor financial values automatically reflect the new result.
9. Write AuditLog.

Payment status:

```text
paidAmount == 0
  NOT_STARTED

paidAmount > 0 && paidAmount < estimatedCost
  PARTIALLY_PAID

paidAmount >= estimatedCost
  FULLY_PAID
```

If:

```text
paymentDueDate < today
AND paidAmount < estimatedCost
```

then:

```text
OVERDUE
```

---

# 15. Expense Editing

Editing an Expense amount must also recalculate:

- BudgetItem.paidAmount
- BudgetItem.paymentStatus
- Vendor Total Paid
- Vendor Outstanding Balance

Use Prisma transaction.

Never increment/decrement blindly.

Always recalculate from Expense records to prevent drift.

---

# 16. Contribution Deletion

Keep the existing secure contribution deletion behavior.

Required:

- `SUPER_ADMIN`
- Typed `DELETE`
- AuditLog
- Immediate recalculation of:
  - Total Contributions
  - Available Balance
  - Funding Gap
  - Funding Progress
  - Projected Surplus/Shortfall
  - Projected Remaining Cash

Pending or Cancelled Contributions do not affect totals.

---

# 17. Vendor Deletion Rules

Vendor deletion must be protected.

## If Vendor has linked Budget Items

Block hard delete.

Message:

```text
This vendor cannot be deleted because it is linked to budget items.
Unlink or remove the related budget items first, or archive the vendor instead.
```

Prefer Archive as the default option.

## Archive Vendor

Archiving must:

- Keep Budget Items
- Keep Expenses
- Keep payment history
- Exclude Vendor from active Vendor counts
- Preserve audit/history

Financial records must never be deleted by archiving.

---

# 18. UI Actions

## Budget Item Row

Actions:

- Edit
- Record Payment
- View Vendor
- Delete

Delete button:

Visible only when user has delete permission.

Disabled or blocked when Expense dependency exists.

---

## Budget Category Header

Actions:

- Edit Category
- Add Item
- Delete Category

Delete Category:

Visible only for authorized users.

If category contains items, clicking Delete should still explain why deletion is blocked.

---

# 19. Shared Delete Confirmation Component

Use the existing or create:

```text
src/components/admin/DeleteConfirmationDialog.tsx
```

Expected props:

```ts
type DeleteConfirmationDialogProps = {
  title: string
  description: string
  recordName?: string
  loading?: boolean
  requiresTypedConfirmation?: boolean
  confirmationText?: string
  onConfirm: () => void
  onCancel: () => void
}
```

Default:

```text
confirmationText = DELETE
```

Requirements:

- Escape closes dialog when not processing.
- Clicking outside closes dialog when not processing.
- Confirm button disabled while loading.
- Confirm button disabled until typed value matches when required.
- Red destructive styling.
- Accessible keyboard navigation.
- Focus trap.
- Clear warning text.

---

# 20. Server Actions

Recommended actions:

```text
createBudgetCategory
updateBudgetCategory
deleteBudgetCategory

createBudgetItem
updateBudgetItem
deleteBudgetItem

createExpense
updateExpense
deleteExpense

createContribution
updateContribution
deleteContribution

createVendor
updateVendor
archiveVendor
deleteVendor
```

All financial mutations must:

1. Validate authentication.
2. Validate permission.
3. Validate input.
4. Run dependency checks.
5. Use Prisma transaction when multiple records/calculations change.
6. Write AuditLog for deletes.
7. Revalidate relevant routes.

Recommended:

```ts
revalidatePath('/admin/budget')
revalidatePath('/admin/vendors')
```

Where required.

---

# 21. Validation Rules

## Money

- Amount must be greater than 0.
- Use Decimal.
- Do not use floating-point arithmetic for financial calculations.

## Vendor Final Amount

Must be:

```text
>= 0
```

## Estimated Cost

Must be:

```text
> 0
```

## Expense

Must reference a valid Budget Item.

## Contribution

Must have valid status.

## Date Validation

Use normalized dates/timezone-safe comparison.

---

# 22. Important Data Integrity Rules

The implementation must enforce:

1. One financial source of truth for payments = `Expense`.
2. Vendor paid values are derived.
3. Budget Item paidAmount must equal linked Expense sum.
4. Do not cascade delete financial history.
5. Budget Category with items cannot be deleted.
6. Budget Item with expenses cannot be deleted.
7. Vendor with linked Budget Items cannot be hard deleted.
8. Archived Vendors retain full history.
9. Expense edits/deletes trigger full recalculation.
10. Contribution status controls whether it affects cash.
11. All financial hard deletes require authorization.
12. All financial hard deletes generate an AuditLog.
13. UI values and server calculations must use the same formulas.
14. Server-side validation must not rely only on disabled UI buttons.

---

# 23. Recommended UX Flow

## Vendor Booking

```text
Create Vendor
↓
Enter quotation
↓
Confirm Vendor
↓
Enter final agreed amount
↓
Create or link Budget Item
↓
Record advance
↓
Expense created
↓
Budget updated
↓
Vendor paid/outstanding recalculated
```

## Installment

```text
Open Vendor
↓
Record Payment
↓
Choose linked Budget Item
↓
Enter installment
↓
Expense created
↓
BudgetItem recalculated
↓
Vendor financial summary updated
```

## Delete Budget Item

```text
Click Delete
↓
Server checks Expenses
↓
If Expenses exist:
  Block
  Show dependency warning

If no Expenses:
  Confirm
  Delete
  Audit
  Refresh Budget/Vendor views
```

## Delete Budget Category

```text
Click Delete
↓
Server checks Budget Items
↓
If Budget Items exist:
  Block
  Show count

If empty:
  Require typed DELETE
  Delete
  Audit
  Refresh
```

---

# 24. Acceptance Criteria

## Vendor Integration

- [ ] A Budget Item can be linked to a Vendor.
- [ ] Vendor selector is available during Budget Item create/edit.
- [ ] Vendor details show linked Budget Items.
- [ ] Vendor total paid is derived from Expenses.
- [ ] Vendor outstanding balance updates immediately after Expense creation.
- [ ] Vendor outstanding balance updates after Expense edit.
- [ ] Vendor outstanding balance updates after Expense deletion.
- [ ] Vendor payment history shows linked Expenses.
- [ ] Record Payment from Vendor opens Budget payment workflow.
- [ ] A Vendor may have multiple linked Budget Items.
- [ ] Vendor hard delete is blocked when linked Budget Items exist.
- [ ] Vendor archive preserves history.

## Budget Items

- [ ] Users with edit permission can create/edit Budget Items.
- [ ] Authorized delete users can delete Budget Items.
- [ ] Budget Item deletion is blocked when Expenses exist.
- [ ] Budget Item linked to Vendor but without Expenses can be deleted.
- [ ] Budget Item delete creates an AuditLog.
- [ ] Deleted Budget Item disappears immediately after refresh/revalidation.

## Categories

- [ ] Authorized users can delete an empty Budget Category.
- [ ] Category deletion is blocked if Budget Items exist.
- [ ] Blocked message shows the number of linked items.
- [ ] Category delete requires typed `DELETE`.
- [ ] Category deletion creates an AuditLog.

## Expenses

- [ ] Creating Expense recalculates Budget Item paidAmount.
- [ ] Editing Expense recalculates Budget Item paidAmount.
- [ ] Deleting Expense recalculates Budget Item paidAmount.
- [ ] Payment status updates correctly.
- [ ] Vendor totals update correctly.
- [ ] Expense deletion creates AuditLog.

## Contributions

- [ ] Only RECEIVED Contributions affect totals.
- [ ] Contribution deletion uses typed `DELETE`.
- [ ] Contribution deletion creates AuditLog.
- [ ] Dashboard values recalculate correctly.

## Permissions

- [ ] Viewer cannot mutate Budget or Vendor financial data.
- [ ] User with `BUDGET_EDIT` can create/edit permitted records.
- [ ] Unauthorized users cannot hard delete.
- [ ] Server rejects unauthorized delete requests even if manually called.

---

# 25. Test Scenarios

## TC01 – Delete Empty Category

Given:

- Category has 0 Budget Items.
- User is SUPER_ADMIN.

When:

- User types DELETE.
- Confirms deletion.

Expected:

- Category deleted.
- AuditLog created.
- UI updated.

---

## TC02 – Delete Category with Budget Items

Given:

- Category has 3 Budget Items.

When:

- User attempts delete.

Expected:

- Deletion blocked.
- Message indicates 3 linked Budget Items.
- No records deleted.
- No financial records changed.

---

## TC03 – Delete Budget Item Without Expenses

Given:

- Budget Item has no Expenses.

When:

- Authorized user deletes.

Expected:

- Item deleted.
- Vendor remains.
- Category remains.
- AuditLog created.

---

## TC04 – Delete Budget Item With Expenses

Given:

- Budget Item has one or more Expenses.

When:

- User attempts delete.

Expected:

- Deletion blocked.
- User instructed to delete Expenses first.
- No cascade delete.

---

## TC05 – Record Vendor Advance

Given:

- Vendor final amount = 500,000.
- Linked Budget Item exists.

When:

- User records ADVANCE Expense = 100,000.

Expected:

- Expense created.
- Budget Item paidAmount = 100,000.
- Vendor Total Paid = 100,000.
- Vendor Outstanding = 400,000.
- Status = PARTIALLY_PAID.

---

## TC06 – Edit Payment

Given:

- Existing Expense = 100,000.

When:

- Edit Expense to 120,000.

Expected:

- Budget Item paidAmount recalculated from all Expenses.
- Vendor total paid recalculated.
- Vendor outstanding recalculated.

---

## TC07 – Delete Payment

Given:

- Vendor has payments totaling 250,000.

When:

- Delete a 50,000 Expense.

Expected:

- Vendor total paid becomes 200,000.
- Budget Item paidAmount recalculated.
- Payment status recalculated.
- AuditLog created.

---

## TC08 – Fully Paid Vendor

Given:

- Vendor final amount = 400,000.

When:

- Linked Expenses total 400,000.

Expected:

- Outstanding = 0.
- Payment status = FULLY_PAID.
- Vendor excluded from Upcoming Payment warnings.

---

## TC09 – Overdue Vendor

Given:

- Outstanding > 0.
- nextPaymentDue is before today.

Expected:

- Payment status/display indicates overdue.
- Due date shown in red.

---

## TC10 – Contribution Status

Given:

- Received = 500,000.
- Pending = 100,000.
- Cancelled = 50,000.

Expected:

Total Contributions:

```text
500,000
```

Not:

```text
650,000
```

---

# 26. Migration Requirements

Before changing payment behavior:

1. Inspect existing `Vendor.advancePaid` data.
2. Determine whether existing values are represented in Expenses.
3. Do not silently create duplicate Expense records.
4. If migration is necessary:
   - create a one-time migration strategy
   - document how old advances are reconciled
5. Preserve current production data.

Do not delete or reset existing financial data.

---

# 27. Performance Requirements

Avoid N+1 queries.

Prefer fetching Vendor financial details using Prisma relations or grouped aggregation.

For dashboards:

- Aggregate at database level where practical.
- Avoid calculating large datasets entirely in the client.
- Keep tab switching client-side if the required data is already loaded.
- Revalidate only affected routes after mutation.

---

# 28. Security Requirements

Never trust client input for:

- IDs
- Amounts
- Permission
- User role
- Dependency state
- Calculated totals

All delete dependency checks must execute server-side immediately before deletion.

Use transaction-safe server actions.

Financial deletion actions must be auditable.

---

# 29. Expected Deliverables

Antigravity must:

1. Review the existing codebase before modifying.
2. Reuse the existing coding patterns and UI design.
3. Update Prisma schema only where necessary.
4. Add migration if schema changes.
5. Implement Vendor–Budget integration.
6. Add Budget Item deletion.
7. Add Budget Category deletion.
8. Preserve existing Expense/Contribution deletion behavior.
9. Update financial calculations.
10. Add Vendor financial summary.
11. Add linked Budget Items to Vendor.
12. Add payment history.
13. Add server-side validation.
14. Add RBAC checks.
15. Add AuditLog records.
16. Add/update automated tests where the project supports them.
17. Verify existing Budget and Vendor functions do not regress.
18. Provide a summary of modified files and implementation decisions.

---

# 30. Definition of Done

The work is complete only when:

- Vendor and Budget modules behave as one integrated workflow.
- No duplicate payment values need to be manually maintained.
- Budget Items can be safely deleted.
- Budget Categories can be safely deleted.
- Financial dependency rules prevent accidental data loss.
- Vendor financial totals are accurate.
- Budget totals remain accurate after create/edit/delete operations.
- RBAC is enforced server-side.
- Audit logs are written for deletions.
- All key flows are tested.
- Existing data remains intact.
