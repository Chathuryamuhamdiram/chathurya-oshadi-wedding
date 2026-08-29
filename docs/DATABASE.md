# Wedding Platform Database Design

## 1. Purpose

This document defines the initial relational data model for the Wedding Platform.

Recommended database: PostgreSQL.

---

## 2. Core Tables

### users

Stores platform users.

Fields:
- id
- full_name
- email
- phone
- password_hash or external_auth_id
- role
- is_active
- created_at
- updated_at

Roles:
- SUPER_ADMIN
- ADMIN
- FAMILY_MEMBER
- VIEWER

---

### guests

Represents a single invitation record, which can be an individual or a whole family.

Fields:
- id
- invitation_code
- display_name
- primary_contact_name
- whatsapp_number
- email
- invitation_type
- allowed_guest_count
- confirmed_guest_count
- liquor_count
- rsvp_status
- invitation_status
- invitation_sent_at
- invitation_last_shared_at
- notes
- created_at
- updated_at

`invitation_type`:
- INDIVIDUAL
- FAMILY

`rsvp_status`:
- PENDING
- ATTENDING
- NOT_ATTENDING
- NOT_SURE

`invitation_status`:
- NOT_SENT
- SHARED
- RSVP_PENDING
- CONFIRMED
- DECLINED

Business rules:
- confirmed_guest_count >= 0
- confirmed_guest_count <= allowed_guest_count
- liquor_count >= 0
- liquor_count <= confirmed_guest_count

---

### guest_members

Optional detailed family member records.

Fields:
- id
- guest_id
- full_name
- relationship
- attending
- liquor
- dietary_requirement
- notes

Use this table only when individual family-member-level data is required.

---

### rsvp_responses

Stores RSVP history.

Fields:
- id
- guest_id
- response_status
- confirmed_guest_count
- liquor_count
- dietary_notes
- message
- submitted_at
- source

---

### wedding_events

Fields:
- id
- title
- description
- event_date
- start_time
- end_time
- venue_id
- visibility
- sort_order

---

### venues

Fields:
- id
- name
- address
- latitude
- longitude
- google_maps_url
- phone
- notes

---

## 3. Budget Tables

### budget_categories

Fields:
- id
- name
- description
- sort_order
- is_active

---

### budget_items

Fields:
- id
- category_id
- vendor_id
- title
- description
- estimated_cost
- actual_cost
- paid_amount
- payment_due_date
- payment_status
- responsible_user_id
- notes
- created_at
- updated_at

Payment status:
- NOT_STARTED
- ADVANCE_PAID
- PARTIALLY_PAID
- FULLY_PAID
- OVERDUE

---

### expenses

Fields:
- id
- budget_item_id
- category_id
- vendor_id
- expense_name
- expense_date
- amount
- paid_by_user_id
- payment_method
- notes
- created_at

---

### contributions

Fields:
- id
- contributor_name
- amount
- contribution_date
- payment_method
- purpose
- notes
- created_at

---

## 4. Vendor Tables

### vendors

Fields:
- id
- vendor_name
- contact_person
- phone
- whatsapp_number
- email
- service_category
- quotation_amount
- final_amount
- advance_paid
- outstanding_amount
- next_payment_due
- notes
- created_at
- updated_at

---

### vendor_payments

Fields:
- id
- vendor_id
- amount
- payment_date
- payment_method

---

## 5. Role-Based Access Control (RBAC)

### permissions

Defines granular actions that can be performed in the system.

Fields:
- id
- code (e.g. `guest.view`, `budget.edit`)
- module (e.g. `GUESTS`, `BUDGET`)
- description
- created_at
- updated_at

---

### role_permissions

Maps default permissions to a given role.

Fields:
- id
- role (Enum)
- permission_id
- allowed
- created_at
- updated_at

---

### user_permissions

Allows user-specific permission overrides.

Fields:
- id
- user_id
- permission_id
- allowed
- created_at
- updated_at

---

### audit_logs

Tracks critical actions performed by users.

Fields:
- id
- user_id
- action (e.g. `USER_DELETE`, `BUDGET_CREATE`)
- resource_type
- resource_id
- details (JSON)
- created_at
- reference
- notes

---

## 5. Task Management

### tasks

Fields:
- id
- title
- description
- category
- assigned_user_id
- created_by_user_id
- start_date
- due_date
- priority
- status
- reminder_enabled
- escalation_enabled
- completed_at
- notes
- created_at
- updated_at

Priorities:
- LOW
- MEDIUM
- HIGH
- CRITICAL

Statuses:
- NOT_STARTED
- IN_PROGRESS
- WAITING
- COMPLETED
- CANCELLED

---

### task_dependencies

Fields:
- id
- task_id
- depends_on_task_id

---

### task_comments

Fields:
- id
- task_id
- user_id
- comment
- created_at

---

### task_reminders

Fields:
- id
- task_id
- reminder_type
- reminder_at
- channel
- status
- sent_at

---

## 6. Notifications

### notifications

Fields:
- id
- user_id
- type
- title
- message
- related_entity_type
- related_entity_id
- channel
- status
- scheduled_at
- sent_at
- read_at
- created_at

---

### notification_preferences

Fields:
- id
- user_id
- in_app_enabled
- email_enabled
- whatsapp_enabled
- push_enabled
- task_reminders_enabled
- budget_notifications_enabled
- timeline_notifications_enabled

---

## 7. Documents and Attachments

### documents

Fields:
- id
- title
- category
- file_path
- mime_type
- uploaded_by_user_id
- related_entity_type
- related_entity_id
- is_private
- created_at

Categories may include:
- RECEIPT
- QUOTATION
- CONTRACT
- HOTEL_AGREEMENT
- CARD_DESIGN
- GUEST_LIST
- SEATING_PLAN
- OTHER

---

## 8. Guest Book

### guest_book_messages

Fields:
- id
- guest_id
- guest_name
- message
- moderation_status
- created_at
- approved_at

Moderation:
- PENDING
- APPROVED
- REJECTED

---

## 9. Gallery

### gallery_items

Fields:
- id
- title
- file_path
- media_type
- source
- uploaded_by
- moderation_status
- sort_order
- created_at

---

## 10. Wedding Day Operations

### vendor_arrivals

Fields:
- id
- vendor_id
- expected_at
- arrived_at
- status
- notes

---

### emergency_contacts

Fields:
- id
- name
- role
- phone
- whatsapp_number
- priority_order

---

### announcements

Fields:
- id
- title
- message
- visible_from
- visible_until
- audience
- created_by
- created_at

---

## 11. Audit Log

### audit_logs

Fields:
- id
- user_id
- action
- entity_type
- entity_id
- before_data
- after_data
- created_at

Audit important actions:
- Budget changes
- Expense changes
- Payment changes
- Guest count changes
- Liquor count changes
- RSVP changes
- Role changes
- Task status changes
- Invitation status changes

---

## 12. Important Indexes

Recommended indexes:
- guests(invitation_code)
- guests(whatsapp_number)
- guests(rsvp_status)
- tasks(assigned_user_id, due_date)
- tasks(status, due_date)
- notifications(user_id, status)
- notifications(scheduled_at, status)
- budget_items(payment_due_date, payment_status)
- vendors(next_payment_due)
- audit_logs(entity_type, entity_id)

---

## 13. Data Privacy

Sensitive data:
- Guest contact details
- Financial data
- Private documents
- User credentials

Requirements:
- Do not expose internal IDs in public invitation URLs.
- Use secure random invitation codes.
- Enforce role-based access.
- Store uploaded private files in protected storage.
- Avoid logging passwords, tokens, or full secrets.
