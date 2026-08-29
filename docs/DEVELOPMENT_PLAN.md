# Wedding Platform Development Plan

## 1. Objective

Build the complete Wedding Platform incrementally while keeping the public invitation experience stable.

Priority order:
1. Public invitation
2. Admin authentication
3. Guest management
4. Personalized WhatsApp invitation sharing
5. RSVP and guest / liquor counts
6. Budget and expense management
7. Family task management and reminders
8. Vendor management
9. Wedding day operations
10. Advanced and AI features

---

## 2. Phase 0 — Foundation

### Tasks

- Initialize Next.js / TypeScript project
- Configure environment variables
- Set up PostgreSQL / Supabase
- Configure authentication
- Create base layout and design tokens
- Set up error handling
- Set up logging
- Set up protected admin routes
- Add database migration process
- Add linting and formatting
- Add CI checks

### Exit Criteria

- Application builds successfully
- Database is connected
- Admin authentication works
- Public and admin routes are separated

---

## 3. Phase 1 — Public Wedding Website

### Features

- Welcome / opening experience
- Couple details
- Wedding date
- Countdown
- Event information
- Venue information
- Map links
- Gallery
- Contact options
- Mobile responsiveness

### Exit Criteria

- Public website is usable on mobile
- Core wedding details are correct
- Performance is acceptable on mobile networks

---

## 4. Phase 2 — Guest Management & Personalized Invitations

### Features

- Add / edit / deactivate guest invitation
- Individual and family invitations
- Unique invitation code
- Allowed guest count
- Confirmed guest count
- Liquor count
- Invitation status
- RSVP status
- Search and filter
- Personalized invitation page

### Business Rules

- Family invitation can represent multiple guests
- confirmed_guest_count cannot exceed allowed_guest_count
- liquor_count cannot exceed confirmed_guest_count

### Exit Criteria

- Admin can manage guests
- Personalized invitation URLs work
- Guest/family counts are captured correctly

---

## 5. Phase 3 — WhatsApp Deep-Link Invitation Sharing

### Features

- Store guest WhatsApp number
- Generate personalized invitation link
- Build WhatsApp deep link
- Pre-fill invitation message
- `Send via WhatsApp` button
- `Resend Invitation` button
- Record last shared date/time
- Invitation status update

### Version 1 Flow

1. Admin opens guest
2. Clicks `Send via WhatsApp`
3. WhatsApp opens with number and message
4. Admin manually presses Send
5. Admin marks / confirms invitation as shared

### Exit Criteria

- Works on desktop WhatsApp Web and mobile WhatsApp
- Message contains correct guest/family name
- Correct personalized invitation link is included

---

## 6. Phase 4 — RSVP Management

### Features

- RSVP form
- Attending / not attending / not sure
- Confirmed guest count
- Liquor count
- Dietary notes
- RSVP confirmation page
- Admin RSVP dashboard

### Dashboard Metrics

- Invitations created
- Invitations shared
- Pending RSVP
- Confirmed families
- Confirmed guests
- Declined
- Total liquor count

---

## 7. Phase 5 — Budget & Expense Management

### Features

- Budget categories
- Budget items
- Planned amount
- Actual amount
- Paid amount
- Outstanding amount
- Payment status
- Payment due date
- Expense capture
- Receipt upload
- Contribution tracking
- Budget variance dashboard

### Exit Criteria

- Admin can see total budget position
- Budget vs actual is calculated automatically
- Payment deadlines are visible

---

## 8. Phase 6 — Family Task Management

### Features

- Family member accounts
- Create tasks
- Assign tasks
- Start / due dates
- Priority
- Status
- Comments
- Attachments
- Dependencies
- Family `My Tasks` view

### Reminder Defaults

- 7 days before
- 3 days before
- 1 day before
- Due date
- Overdue

### Escalation Example

- 1 day overdue: remind assignee
- 3 days overdue: remind assignee + notify Chathurya and Oshadi

---

## 9. Phase 7 — Notification Engine

### Initial Channels

- In-app
- Email

### Features

- Scheduled reminder worker
- Notification history
- Read / unread
- Retry failed notifications
- User preferences

### Future Channels

- Browser push
- WhatsApp Business API
- SMS

---

## 10. Phase 8 — Vendor Management

### Features

- Vendor profile
- Contact details
- Service category
- Quotation
- Final price
- Advance
- Outstanding amount
- Payment due date
- Contracts
- Vendor payment reminders

---

## 11. Phase 9 — Calendar & Documents

### Features

- Wedding calendar
- Task dates
- Vendor appointments
- Payment deadlines
- Dress fittings
- Meetings
- Document repository
- Search and filtering

---

## 12. Phase 10 — Wedding Day Mode

### Features

- Current time
- Next event
- Upcoming schedule
- Outstanding tasks
- Vendor arrival tracking
- Important contacts
- Emergency contacts
- Announcements
- Timeline alerts

---

## 13. Phase 11 — Advanced Planning Features

### Features

- Seating plan
- Meal / dietary planning
- Accommodation
- Transport
- Wedding checklist templates
- Reports
- PDF / Excel export

---

## 14. Phase 12 — AI Wedding Assistant

### Future Capabilities

- Identify overdue tasks
- Summarize remaining budget
- Highlight unpaid vendors
- Recommend this week's priorities
- Identify RSVP gaps
- Detect planning risks
- Suggest tasks
- Predict budget overruns

AI recommendations should never automatically modify financial or guest data without user confirmation.

---

## 15. Testing Strategy

### Unit Tests

Cover:
- Budget calculations
- Guest count validation
- Liquor count validation
- Invitation status transitions
- Task reminder calculations

### Integration Tests

Cover:
- RSVP submission
- Invitation resolution
- Expense creation
- Notification generation
- Role permissions

### End-to-End Tests

Cover:
- Admin login
- Add family guest
- Share WhatsApp invitation
- Guest opens invitation
- Guest submits RSVP
- Admin sees updated counts
- Create and complete family task
- Add budget item and expense

---

## 16. Definition of Done

A feature is complete when:

- Functional requirement is implemented
- Validation rules are enforced
- Mobile UI is complete
- Permissions are enforced
- Error states are handled
- Tests are added where appropriate
- Documentation is updated
- No regression to existing functions
