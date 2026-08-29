**CHATHURYA & OSHADI**

**Wedding Digital Platform**

Product Requirements, Functional Specification & Development Roadmap

Wedding Date: 08 October 2026  
Poruwa Ceremony: 08:50 AM  
Hotel River Park, Hikkaduwa  
Main Function: Hotel Grand Palace, Hikkaduwa

Version 1.0 \| 26 August 2026

# Document Control

| Document Title      | Chathurya & Oshadi Wedding Digital Platform - Requirements & Development Specification                                        |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Version             | 1.0                                                                                                                           |
| Prepared Date       | 26 August 2026                                                                                                                |
| Primary Owners      | Chathurya & Oshadi                                                                                                            |
| Target Wedding Date | 08 October 2026                                                                                                               |
| Document Purpose    | Define the complete functional, technical and future-development scope for the wedding website and private planning platform. |

# Table of Contents

1\. Executive Summary

2\. Confirmed Wedding Information

3\. Solution Scope & Product Areas

4\. Public Wedding Website Requirements

5\. Users, Roles & Access Control

6\. Wedding Planning Dashboard

7\. Budget, Expense & Contribution Management

8\. Family Task Management & Timeline

9\. Notifications, Reminders & Escalation

10\. Shared Wedding Calendar

11\. Vendor & Document Management

12\. Guest Management & RSVP Administration

13\. Advanced Guest & Logistics Features

14\. Wedding-Day Operations Mode

15\. Post-Wedding Experience

16\. AI Wedding Assistant - Future Development

17\. Private Honeymoon Planning - Future Optional Module

18\. Reports & Analytics

19\. Security, Privacy & Audit Requirements

20\. UX, Performance & Compatibility

21\. UI / Visual Design Direction

22\. Recommended Technical Architecture

23\. Non-Functional Requirements

24\. Key End-to-End Workflows

25\. Development Roadmap

26\. Recommended Minimum Viable Product (MVP)

27\. Consolidated Feature Backlog

28\. High-Level Acceptance Criteria

29\. Configuration Decisions to Finalize During Design

30\. Final Product Statement

Appendix A - Suggested Navigation

Appendix B - Example Notification Messages

# 1. Executive Summary

This document defines a complete digital wedding platform for Chathurya and Oshadi. The product will combine a premium public wedding invitation website with a secure private planning portal that supports budget control, family task coordination, guest management, vendor management, reminders, notifications, wedding-day operations and future AI-assisted planning.

The solution is intentionally designed as more than a one-time invitation page. It should become the central system used before, during and after the wedding, while keeping public guest content clearly separated from private administrative and financial information.

## 1.1 Product Vision

> **Wedding Invitation + Wedding Planning + Family Coordination + Budget Management + Guest Management + Wedding-Day Operations + Post-Wedding Memories**

## 1.2 Primary Goals

- Provide guests with a beautiful, mobile-first digital wedding invitation.

- Give Chathurya and Oshadi a secure shared administration workspace.

- Plan and monitor the wedding budget, actual expenses, payments and contributions.

- Assign wedding tasks to family members with deadlines, reminders and escalation.

- Manage guests, RSVP responses, personalized invitation links and QR codes.

- Manage vendors, quotations, contracts, payment due dates and wedding-day arrival status.

- Provide an operational wedding-day dashboard with timeline alerts and key contacts.

- Preserve the website after the event as a wedding memories and guest-content platform.

# 2. Confirmed Wedding Information

| Couple               | Chathurya & Oshadi            |
|----------------------|-------------------------------|
| Wedding Date         | 08 October 2026               |
| Poruwa Ceremony Time | 08:50 AM                      |
| Poruwa Venue         | Hotel River Park, Hikkaduwa   |
| Main Function Venue  | Hotel Grand Palace, Hikkaduwa |
| RSVP - Chathurya     | 071 460 9001                  |
| RSVP - Oshadi        | 078 676 1770                  |

# 3. Solution Scope & Product Areas

The system will consist of four connected but permission-separated product areas.

| **Area**                   | **Primary Users**                        | **Purpose**                                                                                           |
|----------------------------|------------------------------------------|-------------------------------------------------------------------------------------------------------|
| A. Public Wedding Website  | Guests                                   | Invitation experience, wedding information, locations, RSVP, gallery, story, guest book and updates.  |
| B. Wedding Planning Portal | Chathurya & Oshadi                       | Private dashboard for budget, expenses, tasks, vendors, documents, guests, reports and settings.      |
| C. Family / Helper Portal  | Authorized family members / coordinators | View assigned tasks, update progress, receive reminders, access relevant timeline items and contacts. |
| D. Wedding-Day Operations  | Admins and selected coordinators         | Live timeline, outstanding tasks, vendor arrival status, emergency contacts and operational alerts.   |

## 3.1 Information Separation

- Public guests must never have access to financial, administrative or internal planning data.

- Family members should only see information relevant to their assigned responsibilities unless additional permission is granted.

- Chathurya and Oshadi act as Super Admins with full access.

- Sensitive information such as budgets, vendor contracts and honeymoon plans must remain private.

# 4. Public Wedding Website Requirements

## 4.1 Welcome / Opening Experience

- Elegant first-screen introduction with names, wedding date and wedding monogram/logo.

- Optional envelope, passport or travel-inspired opening animation.

- A clear “Open Invitation” or “Enter” interaction.

- Optional background music activated only after user interaction.

- Mobile-first animation and fast first load.

## 4.2 Hero Section

- Full-screen couple image or lightweight background video.

- Names: Chathurya & Oshadi.

- Wedding date: 08 October 2026.

- Optional tagline such as “From the first hello to forever.”

- Wedding countdown and scroll indicator.

## 4.3 Wedding Countdown

The site should show a live countdown calculated against the wedding date and ceremony time. When the event starts, the messaging can automatically change to a wedding-day message, and after the event it can transition to a thank-you / memories state.

## 4.4 Our Story

- Timeline-based couple journey.

- Milestones such as First Hello, First Meeting, Engagement and Wedding Day.

- Photos, dates and short descriptions.

- Subtle animated transitions that do not affect performance.

## 4.5 Wedding Events & Schedule

| **Event**             | **Date / Time**        | **Venue**                     | **Guest Actions**                        |
|-----------------------|------------------------|-------------------------------|------------------------------------------|
| Poruwa Ceremony       | 08 Oct 2026 - 08:50 AM | Hotel River Park, Hikkaduwa   | View location, navigate, add to calendar |
| Main Wedding Function | 08 Oct 2026            | Hotel Grand Palace, Hikkaduwa | View location, navigate, add to calendar |

## 4.6 Location & Navigation

- Map preview for each venue.

- Open Google Maps / preferred navigation app.

- Navigation button optimized for mobile.

- Optional wedding-day page with parking instructions, landmarks and route guidance.

## 4.7 RSVP

| **Field**            | **Requirement**                       |
|----------------------|---------------------------------------|
| Guest Name           | Required                              |
| Mobile Number        | Recommended                           |
| Attendance           | Attending / Not Attending / Not Sure  |
| Number of Attendees  | If invitation permits multiple guests |
| Dietary Requirements | Optional                              |
| Special Notes        | Optional                              |

After submission, guests should receive an on-screen confirmation. RSVP entries must immediately appear in the private admin dashboard.

- RSVP must support both individual invitations and whole-family invitations.

- For a family invitation, store the invited guest/family name, primary WhatsApp number, maximum allowed guest count and confirmed guest count.

- Include a Liquor Count field for the family invitation to record how many confirmed attendees are expected to consume liquor/alcoholic beverages.

- Liquor Count must be a numeric value from 0 up to the confirmed guest count and should be editable by the guest during RSVP or by an authorized admin.

- Example: Perera Family - Confirmed Guest Count: 5; Liquor Count: 3.

- The admin dashboard should automatically total confirmed guests and liquor counts across all invitations for catering and beverage planning.

## 4.8 Personalized Invitations & QR Codes

- Generate unique guest/family invitation links.

- Display a personalized greeting when a guest opens the link.

- Generate QR codes for printed cards and WhatsApp sharing.

- Track RSVP against the correct guest or family record.

- Do not expose sensitive guest identifiers in easily guessable URLs.

## 4.9 WhatsApp Digital Invitation Sharing

The first version should use WhatsApp deep-link sharing. This approach opens WhatsApp on the admin’s device with the guest’s WhatsApp number and a pre-filled personalized invitation message. The admin reviews the message and manually presses Send in WhatsApp. This avoids the complexity of WhatsApp Business API automation while still providing a fast, convenient invitation workflow.

1.  Admin selects a guest or family from the guest list.

2.  The system generates or retrieves that guest’s unique personalized invitation link.

3.  Admin selects “Send via WhatsApp”.

4.  The website opens WhatsApp or WhatsApp Web using a deep link with the guest number and prepared invitation message.

5.  Admin reviews the message and manually sends it through WhatsApp.

6.  The system records the invitation as shared, together with the shared date/time where applicable.

- Suggested invitation status values: Not Sent, Shared, RSVP Pending, Confirmed and Declined.

- Provide a “Resend Invitation” action for guests who require another copy of the invitation.

- The invitation message template should be configurable by Chathurya and Oshadi.

- Example message: “Dear \[Guest Name\], we are delighted to invite you to celebrate our wedding with us. Please open your personal invitation here: \[Personalized Invitation Link\]”.

- The personalized link should open the correct guest/family invitation and connect any RSVP response to that guest record.

Future enhancement: automatic WhatsApp sending and reminder messages may be implemented using the WhatsApp Business Platform / Cloud API, subject to Meta setup, approved message templates, permissions and applicable costs.

## 4.10 Gallery, Music & Guest Experience

- Engagement, pre-shoot and wedding galleries with lazy loading.

- Swipe and full-screen gallery on mobile.

- Background music with visible play/pause control.

- Wedding hashtag display and social sharing.

- Dress-code guidance if required.

- Accommodation recommendations for travelling guests.

## 4.11 Guest Book & Guest Photo Upload

- Guests can leave messages for the couple.

- Messages should support moderation before public display.

- Guests may upload wedding-day photographs from phones.

- Uploads should support admin approval and storage limits.

## 4.11 Live Wedding Updates & Weather

- Optional live announcements for parking, schedule or venue instructions.

- Wedding-day weather information can be fetched from a live weather service.

- Time-sensitive content should only appear when relevant.

# 5. Users, Roles & Access Control

| **Role**                         | **Core Permissions**                                                                                                      |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Super Admin - Chathurya / Oshadi | Full access to budget, expenses, tasks, users, guests, vendors, documents, reports, settings and public website content.  |
| Family Member                    | View and update assigned tasks, comments, attachments and relevant timeline items; receive reminders.                     |
| Coordinator / Helper             | Access selected timeline, tasks, vendor contacts and operational checklists. Financial access only if explicitly granted. |
| Guest                            | Public invitation and personal RSVP only.                                                                                 |
| Vendor - Future Optional         | Restricted access to assigned deliverables or confirmations if enabled.                                                   |

## 5.1 Permission Principles

- Role-based access control (RBAC).

- Least-privilege access by default.

- Configurable permissions for sensitive modules.

- Admins can deactivate family/helper accounts at any time.

- Admin actions should be auditable.

# 6. Wedding Planning Dashboard

The admin dashboard should provide an immediate view of wedding readiness and highlight items requiring attention.

| **Dashboard Card** | **Key Information**                                                         |
|--------------------|-----------------------------------------------------------------------------|
| Wedding Countdown  | Days/hours remaining until 08 October 2026                                  |
| Budget Summary     | Total budget, planned, actual, paid, outstanding, remaining                 |
| Task Progress      | Total, completed, in progress, overdue, due this week                       |
| Guest Status       | Invited, confirmed, declined, pending                                       |
| Upcoming Payments  | Vendor and other payments due soon                                          |
| Upcoming Tasks     | Tasks approaching their due dates                                           |
| Risk / Alerts      | Overdue tasks, budget overruns, unpaid vendors, unresolved guest follow-ups |

# 7. Budget, Expense & Contribution Management

## 7.1 Budget Planning

- Create a total wedding budget.

- Create default and custom budget categories.

- Maintain estimated cost, actual cost, paid amount and outstanding amount.

- Link each budget item to a vendor, responsible person and due date.

## 7.2 Recommended Budget Categories

- Venue / Hotel

- Food & Catering

- Wedding Cards

- Photography

- Videography

- Decorations

- Flowers

- Bridal Dressing

- Groom Dressing

- Jewellery

- Entertainment / Music / DJ

- Poruwa

- Transport

- Accommodation

- Liquor / Beverages

- Cake

- Invitations

- Honeymoon

- Gifts

- Miscellaneous

## 7.3 Budget Item Data

| **Field**           | **Description**                                                    |
|---------------------|--------------------------------------------------------------------|
| Category            | Budget category                                                    |
| Item Name           | Specific planned expense                                           |
| Description         | Additional detail                                                  |
| Estimated Cost      | Original planned amount                                            |
| Actual Cost         | Final/known amount                                                 |
| Paid Amount         | Amount already paid                                                |
| Remaining Amount    | Calculated outstanding amount                                      |
| Vendor              | Linked vendor                                                      |
| Payment Due Date    | Next/final due date                                                |
| Payment Status      | Not Started / Advance Paid / Partially Paid / Fully Paid / Overdue |
| Responsible Person  | Owner of follow-up                                                 |
| Notes / Attachments | Receipts, quotations, contracts or supporting notes                |

## 7.4 Budget Calculations

- Total Planned Budget

- Total Estimated Spend

- Total Actual Spend

- Total Paid

- Total Outstanding

- Remaining Available Budget

- Variance by category and by item

## 7.5 Expense Recording

- Expense name, date, amount and category.

- Paid by person.

- Payment method.

- Related vendor and budget item.

- Receipt or payment proof upload.

- Notes and audit history.

## 7.6 Contribution Tracking

The system should optionally record contributions received from family or other contributors, including amount, date, purpose, method and notes. Contribution data should remain private to authorized admins.

## 7.7 Budget Alerts

- Alert when a category exceeds planned budget.

- Alert when a payment due date approaches.

- Highlight unpaid or overdue vendor balances.

- Future AI projection of likely final wedding cost based on current spending.

# 8. Family Task Management & Timeline

## 8.1 Task Creation & Assignment

| **Field**         | **Requirement**                                             |
|-------------------|-------------------------------------------------------------|
| Task Title        | Required                                                    |
| Description       | Detailed instructions                                       |
| Category          | Venue, Cards, Transport, Vendor, Family, etc.               |
| Assigned Person   | One or more authorized users                                |
| Created By        | Admin creating task                                         |
| Start Date        | Optional/planned                                            |
| Due Date          | Required for reminders                                      |
| Priority          | Low / Medium / High / Critical                              |
| Status            | Not Started / In Progress / Waiting / Completed / Cancelled |
| Dependencies      | Optional predecessor tasks                                  |
| Attachments       | Files/photos                                                |
| Comments          | Discussion / progress notes                                 |
| Reminder Settings | Default or custom reminder schedule                         |

## 8.2 Family Member Experience

- Simple mobile dashboard showing “My Tasks”.

- Upcoming, overdue and completed sections.

- One-tap task status update.

- Comments and attachment upload.

- Relevant wedding timeline only.

- Notification inbox.

## 8.3 Wedding Planning Timeline

| **Timing**     | **Example Activities**                                                     |
|----------------|----------------------------------------------------------------------------|
| 60 Days Before | Finalize guest list, confirm photographer, complete invitations            |
| 45 Days Before | Distribute invitations, finalize decorations                               |
| 30 Days Before | Confirm guest count, hotel arrangements, clothing                          |
| 14 Days Before | Final vendor confirmations, verify schedule, confirm transport             |
| 7 Days Before  | Final guest count, vendor payments, wedding-day checklist                  |
| 1 Day Before   | Venue confirmation, transport checks, emergency contacts                   |
| Wedding Day    | Vendor arrival, Poruwa setup, guest coordination, photography coordination |

## 8.4 Dependencies & Escalation

- Allow a task to depend on completion of another task.

- Show blocked tasks visually.

- If overdue, continue reminders until completion or cancellation.

- Escalate overdue tasks to Chathurya and Oshadi after a configurable period.

# 9. Notifications, Reminders & Escalation

## 9.1 Default Reminder Schedule

| **Trigger**    | **Example Notification**                          |
|----------------|---------------------------------------------------|
| 7 Days Before  | Reminder: task is due in 7 days.                  |
| 3 Days Before  | Reminder: task is due in 3 days.                  |
| 1 Day Before   | Important reminder: task is due tomorrow.         |
| Due Date       | Task due today.                                   |
| 1 Day Overdue  | Overdue reminder to assignee.                     |
| 3 Days Overdue | Escalation to assignee plus Chathurya and Oshadi. |

## 9.2 Notification Channels

| **Channel**  | **Release Priority** | **Notes**                                                               |
|--------------|----------------------|-------------------------------------------------------------------------|
| In-App       | Initial              | Core notification center                                                |
| Email        | Initial              | Task/payment/RSVP reminders                                             |
| Browser Push | Phase 2/3            | Useful for mobile reminders                                             |
| WhatsApp     | Future / Integration | Useful for family and guest reminders; depends on approved provider/API |
| SMS          | Future / Integration | Optional fallback for critical reminders                                |

## 9.3 Notification Preferences

- Per-user control for task reminders, timeline reminders and selected updates.

- Admin override for critical operational notifications.

- Read/unread status and links to related records.

- Avoid duplicate notifications for the same trigger.

# 10. Shared Wedding Calendar

- Month, week, day and timeline views.

- Display tasks, vendor appointments, payment deadlines, fittings, photo shoots, meetings, rehearsals and wedding-day events.

- Allow filtering by assignee, category and event type.

- Allow users to add relevant events to Google Calendar, Apple Calendar and Outlook.

- Family members should only receive events relevant to them.

# 11. Vendor & Document Management

## 11.1 Vendor Directory

| **Field**          | **Examples**                                                                                   |
|--------------------|------------------------------------------------------------------------------------------------|
| Vendor Category    | Hotel, Photographer, Videographer, Florist, Decorator, Cake, DJ, Dressing, Transport, Printing |
| Vendor Details     | Name, contact person, phone, WhatsApp, email                                                   |
| Commercial Details | Quotation, final price, advance paid, outstanding                                              |
| Dates              | Booking date, payment due dates, service/event arrival time                                    |
| Documents          | Quotation, contract, invoice, receipt                                                          |
| Notes              | Service scope, special instructions, decisions                                                 |

## 11.2 Vendor Payment Reminders

- 14-day, 7-day, 3-day and due-today reminders.

- Show outstanding amount and linked vendor contact.

- Allow marking payment as paid directly from reminder workflow.

## 11.3 Wedding Document Repository

- Quotations

- Contracts

- Receipts

- Hotel agreements

- Photography agreements

- Wedding card designs

- Guest lists

- Seating plans

- Vendor contacts

- Schedules and checklists

Documents should be searchable and attached to related records where possible.

# 12. Guest Management & RSVP Administration

- Add/edit guest or family records.

- For family invitations, maintain a Family / Invitation Name and one primary contact/WhatsApp number.

- Guest Count / Allowed Attendees: maximum number of people covered by the invitation.

- Confirmed Guest Count: actual number of family members attending based on RSVP.

- Liquor Count: number of confirmed attendees within that family who are expected to consume liquor/alcoholic beverages.

- Validation rule: Liquor Count cannot exceed Confirmed Guest Count.

- Provide admin totals for Invited Guest Count, Confirmed Guest Count and Total Liquor Count.

- Invitation group size / allowed attendees.

- Generate unique invitation link and QR code.

- Track invitation sent status.

- Track RSVP response and attendee count.

- Capture dietary information.

- Search and filter guests.

- Export guest list and RSVP report to Excel/PDF.

## 12.1 Automated Guest Follow-Up

- Identify guests who have not responded.

- Send friendly reminder at configurable milestones such as 30, 14 and 7 days before the wedding.

- Allow admins to disable reminders for individual guests.

# 13. Advanced Guest & Logistics Features

## 13.1 Seating Plan

- Create tables and capacities.

- Drag-and-drop guest assignment.

- Group family members.

- Identify unassigned guests and over-capacity tables.

## 13.2 Meal & Dietary Planning

- Vegetarian / Non-Vegetarian / Vegan / Children’s Meal.

- Allergy and special dietary notes.

- Generate hotel/caterer summary.

## 13.3 Transport Management

- Vehicle and driver list.

- Passenger assignment.

- Pickup time and location.

- Destination and contact information.

- Useful for family, bridal party, selected guests and vendors.

## 13.4 Accommodation Management

- Guest / family member.

- Hotel and room.

- Check-in / check-out.

- Number of occupants.

- Payment status and notes.

# 14. Wedding-Day Operations Mode

On the wedding day, the system should provide a simplified, mobile-optimized operational view that prioritizes immediate actions over planning data.

| **Component**             | **Purpose**                                                      |
|---------------------------|------------------------------------------------------------------|
| Current Time / Next Event | Show what is happening now and next.                             |
| Upcoming Events           | Short operational timeline.                                      |
| Outstanding Tasks         | Only active critical items.                                      |
| Vendor Arrival Status     | Expected time, arrived/pending status.                           |
| Important Contacts        | One-tap call/message.                                            |
| Announcements             | Parking, venue, timing or coordination updates.                  |
| Emergency Contacts        | Hotel, drivers, family coordinators, medical/emergency contacts. |

## 14.1 Vendor Arrival Tracking

| **Vendor**         | **Expected** | **Status**                 |
|--------------------|--------------|----------------------------|
| Photographer       | 07:30 AM     | Example: Pending / Arrived |
| Decorator          | 06:00 AM     | Example: Pending / Arrived |
| Cake               | 09:30 AM     | Example: Pending / Arrived |
| DJ / Entertainment | 10:00 AM     | Example: Pending / Arrived |

## 14.2 Timeline Alerts

Important wedding events can generate reminders to relevant coordinators, for example: “30 minutes until the Poruwa ceremony - please ensure all required items are ready.”

# 15. Post-Wedding Experience

- Transform the public site from invitation mode to wedding memories mode.

- Publish professional wedding photos and video.

- Display approved guest-uploaded photos.

- Preserve digital guest book messages.

- Publish thank-you message to guests.

- Optionally retain selected planning records privately for future reference.

# 16. AI Wedding Assistant - Future Development

A future AI assistant can use data already captured by the platform to answer planning questions, surface risks and propose actions. AI functionality should provide recommendations and summaries; important financial or communication actions should remain under user control.

## 16.1 Example AI Questions

- What tasks are overdue?

- How much budget is remaining?

- Which vendors have outstanding payments?

- What should we complete this week?

- Who has not responded to the invitation?

- What are the biggest wedding planning risks right now?

## 16.2 AI Risk Detection

- Incomplete critical tasks close to the wedding date.

- High-value outstanding vendor payments.

- Large number of pending RSVPs.

- Budget categories exceeding plan.

- Task concentration on one family member.

- Potential schedule conflicts or missing dependencies.

## 16.3 AI Task & Budget Suggestions

- Recommend tasks based on days remaining until the wedding.

- Suggest follow-ups for overdue tasks and pending RSVPs.

- Project final spend based on known commitments and current actuals.

- Identify categories with abnormal variance.

# 17. Private Honeymoon Planning - Future Optional Module

- Destination and itinerary.

- Flights and hotels.

- Activities and bookings.

- Budget and payments.

- Travel documents and booking references.

- Private checklist.

This module must remain visible only to specifically authorized users.

# 18. Reports & Analytics

| **Report Group** | **Outputs**                                                              |
|------------------|--------------------------------------------------------------------------|
| Budget           | Planned vs actual, category spend, outstanding payments, vendor payments |
| Tasks            | Completed, outstanding, overdue, tasks by family member                  |
| Guests           | RSVP summary, confirmed, pending, declined, dietary requirements         |
| Vendors          | Vendor cost, payment status, contact list                                |
| Operations       | Upcoming timeline, outstanding wedding-day actions                       |

- Export to Excel where tabular analysis is useful.

- Export to PDF for sharing/printing.

- Dashboard charts should remain readable on mobile.

# 19. Security, Privacy & Audit Requirements

- HTTPS for all traffic.

- Secure authentication for private portals.

- Role-based authorization on every private API endpoint.

- Server-side validation of user input.

- Rate limiting and spam protection for public forms.

- Secure file upload validation and storage.

- No private information exposed through predictable URLs.

- Password reset / account recovery process.

- Audit history for important admin changes.

- Regular database backup and restore strategy.

- Ability to deactivate accounts and revoke sessions.

## 19.1 Admin Audit History

Changes to important records should capture who changed what and when. Example: “26 Aug 2026 - Chathurya changed Photography budget from LKR 200,000 to LKR 225,000.”

# 20. UX, Performance & Compatibility

## 20.1 Mobile-First Experience

- Primary design target: mobile phones.

- Fast access to RSVP, map, task update, vendor call and receipt upload actions.

- Large touch targets and readable typography.

- Avoid excessive animation.

## 20.2 Performance Targets

- Initial public page should ideally become usable within 2-3 seconds on a normal 4G connection.

- Optimize and resize images.

- Lazy-load galleries and non-critical content.

- Compress videos and avoid heavy autoplay media.

- Use CDN delivery for static assets.

- Minimize JavaScript and third-party scripts.

## 20.3 Browser / Device Support

- Current Google Chrome

- Safari including iPhone Safari

- Microsoft Edge

- Samsung Internet

- Firefox

- Responsive layouts from approximately 320px mobile width upward

# 21. UI / Visual Design Direction

The recommended visual direction is elegant, romantic and premium, with optional travel/passport-inspired elements consistent with the invitation concept.

- Passport stamps and travel motifs used sparingly.

- World-map or route-line patterns as subtle decorative elements.

- Wedding monogram/logo.

- Warm neutral / gold-inspired accents.

- Elegant serif/display headings paired with highly readable body text.

- Floral illustrations where appropriate.

- Smooth, restrained transitions.

- Clear separation between emotional public design and functional admin design.

# 22. Recommended Technical Architecture

| **Layer**      | **Recommended Direction**                                                         |
|----------------|-----------------------------------------------------------------------------------|
| Frontend       | Next.js / React, responsive component architecture                                |
| Public Hosting | Vercel or Cloudflare Pages/Workers                                                |
| Backend/API    | Next.js server functions, Node.js API, or Cloudflare Workers depending deployment |
| Database       | PostgreSQL / Supabase recommended; Firebase is an alternative                     |
| Authentication | Managed authentication or secure session-based auth with RBAC                     |
| File Storage   | Managed object storage for photos, receipts and documents                         |
| Notifications  | Email provider initially; push/WhatsApp/SMS integrations later                    |
| Maps           | Google Maps or equivalent deep links / embed                                      |
| Monitoring     | Error logging, uptime monitoring and basic analytics                              |

## 22.1 Core Data Entities

| **Entity**                 | **Key Relationships**                                     |
|----------------------------|-----------------------------------------------------------|
| Users                      | Roles, task assignments, notifications                    |
| Guests / Invitation Groups | RSVPs, QR/invite links, seating, meals                    |
| Tasks                      | Assignees, dependencies, reminders, comments, attachments |
| Budget Categories / Items  | Expenses, vendors, payments                               |
| Expenses                   | Budget item, payer, receipts                              |
| Contributions              | Contributor and payment data                              |
| Vendors                    | Payments, contracts, tasks, arrival status                |
| Events / Timeline          | Calendar and notifications                                |
| Documents                  | Linked to vendors, budgets, tasks or general categories   |
| Guest Book Messages        | Guest/author, moderation status                           |
| Photo Uploads              | Uploader, moderation status, album                        |
| Notifications              | Recipient, type, trigger, read status                     |
| Audit Logs                 | Actor, action, previous/new values                        |

# 23. Non-Functional Requirements

| **Category**    | **Requirement**                                                                                  |
|-----------------|--------------------------------------------------------------------------------------------------|
| Availability    | Public site should remain reliably available around the event date.                              |
| Scalability     | Comfortably support invited guests accessing the site simultaneously.                            |
| Maintainability | Modular components and clear separation of public/admin functionality.                           |
| Accessibility   | Semantic headings, adequate contrast, alt text and keyboard-accessible controls where practical. |
| Data Integrity  | Transactions/validation for financial and RSVP data.                                             |
| Recoverability  | Database and file backup strategy.                                                               |
| Observability   | Application error logging and operational monitoring.                                            |
| Localization    | Architecture should allow Sinhala/English content in future if desired.                          |

# 24. Key End-to-End Workflows

## 24.1 Guest Invitation Workflow

7.  Admin creates guest/family record.

8.  System generates personalized invitation link and QR code.

9.  For WhatsApp delivery, admin can use “Send via WhatsApp” to open a pre-filled personalized message using a WhatsApp deep link, then manually press Send.

10. Printed cards, QR codes and other supported channels may also be used to distribute the invitation.

11. Guest opens public invitation and views wedding details.

12. Guest submits RSVP.

13. For a family invitation, the RSVP captures the confirmed guest count and liquor count for the family.

14. Admin dashboard updates attendance totals.

15. If no response, reminder workflow may follow up before the configured deadline.

## 24.2 Family Task Workflow

16. Chathurya or Oshadi creates a task and assigns a family member.

17. Assignee receives an in-app/email notification.

18. Task appears in the assignee’s My Tasks view.

19. Reminder notifications are sent as the due date approaches.

20. Assignee updates progress, adds comments or uploads evidence.

21. If overdue, the system escalates based on configured rules.

22. Completion updates the admin dashboard and audit history.

## 24.3 Vendor Payment Workflow

23. Admin records vendor and quotation.

24. Budget item is created and linked to the vendor.

25. Advance payment is recorded with receipt.

26. Remaining payment due date creates future reminders.

27. Admin receives reminder and completes payment.

28. Payment status changes to Fully Paid and budget totals update automatically.

# 25. Development Roadmap

| **Phase**                           | **Scope**                                                                                     | **Priority** |
|-------------------------------------|-----------------------------------------------------------------------------------------------|--------------|
| Phase 1 - Core Invitation Website   | Opening experience, wedding details, countdown, gallery, maps, RSVP, contacts                 | Must Have    |
| Phase 2 - Planning Platform         | Admin auth, dashboard, budget, expenses, users, family tasks, timeline, notifications         | Must Have    |
| Phase 3 - Guest & Vendor Management | Guest DB, personalized links, QR, RSVP dashboard, vendors, payments, documents                | High         |
| Phase 4 - Smart Automation          | Task/payment reminders, escalation, RSVP follow-ups, calendar integration, push notifications | High         |
| Phase 5 - Advanced Planning         | Seating, meals, accommodation, transport, contributions, reporting                            | Medium       |
| Phase 6 - AI Assistant              | Risk detection, planning suggestions, budget insights, natural-language queries               | Future       |
| Phase 7 - Wedding-Day Mode          | Operational dashboard, timeline alerts, vendor arrivals, emergency contacts                   | High         |
| Phase 8 - Post-Wedding              | Memories site, guest photos, wedding video, guest book and thank-you experience               | Post Event   |

# 26. Recommended Minimum Viable Product (MVP)

Given the fixed wedding date, development should prioritize the features that provide the highest value before 08 October 2026. Advanced functionality can be enabled later without blocking the initial launch.

| **MVP Area**        | **Required Before Wedding**                                               |
|---------------------|---------------------------------------------------------------------------|
| Public Site         | Invitation, event details, maps, countdown, gallery, RSVP, contacts       |
| Admin               | Secure login, dashboard, guest management, budget and expense tracking    |
| Family Coordination | Task assignment, due dates, status updates, email/in-app reminders        |
| Vendors             | Vendor directory, payment status and due-date reminders                   |
| Wedding Day         | Timeline, key contacts, outstanding tasks, vendor status                  |
| Data                | Backup, audit of major admin changes, exportable guest/budget information |

# 27. Consolidated Feature Backlog

| **Feature**                         | **Priority** | **Status**         |
|-------------------------------------|--------------|--------------------|
| Digital Invitation                  | Must         | Planned            |
| Responsive Mobile UI                | Must         | Planned            |
| Countdown                           | Must         | Planned            |
| Wedding Details & Maps              | Must         | Planned            |
| RSVP                                | Must         | Planned            |
| Admin Authentication                | Must         | Planned            |
| Planning Dashboard                  | Must         | Planned            |
| Budget Management                   | Must         | Planned            |
| Expense Tracking                    | Must         | Planned            |
| Family Task Management              | Must         | Planned            |
| Task Reminders                      | Must         | Planned            |
| Guest Management                    | High         | Planned            |
| Personalized Invitations            | High         | Proposed           |
| QR Invitations                      | High         | Proposed           |
| Vendor Management                   | High         | Proposed           |
| Vendor Payment Reminders            | High         | Proposed           |
| Wedding-Day Mode                    | High         | Proposed           |
| Gallery                             | High         | Planned            |
| Calendar Integration                | Medium       | Proposed           |
| Guest Book                          | Medium       | Proposed           |
| Guest Photo Upload                  | Medium       | Proposed           |
| Seating Plan                        | Medium       | Future             |
| Meal Management                     | Medium       | Future             |
| Transport                           | Medium       | Future             |
| Accommodation                       | Medium       | Future             |
| Reports / Export                    | Medium       | Proposed           |
| WhatsApp Notifications              | Medium       | Future Integration |
| AI Wedding Assistant                | Future       | Future             |
| AI Budget / Risk Insights           | Future       | Future             |
| Honeymoon Planner                   | Future       | Future             |
| Post-Wedding Memories               | Post Event   | Future             |
| WhatsApp Digital Invitation Sharing | High         | Planned            |

# 28. High-Level Acceptance Criteria

- Guests can open the invitation on a phone without login and access core event information quickly.

- RSVP submissions are stored and visible to authorized admins.

- Family RSVP records store both confirmed guest count and liquor count.

- Liquor count cannot exceed the confirmed guest count.

- Admin reporting displays total confirmed guests and total liquor count across all RSVP records.

- Chathurya and Oshadi can securely log in and see the same current planning data.

- Admins can create budget items, record expenses and see automatically calculated totals/variance.

- Admins can assign tasks to family members with due dates.

- Family members can see and update only the tasks and information they are permitted to access.

- Reminders are generated according to configured rules and overdue tasks can be escalated.

- Vendor records can track quotations, payments, due dates and documents.

- Private financial and planning data cannot be accessed from the public website.

- Core pages work correctly on current iPhone Safari and Android Chrome.

- Admins can export essential guest and financial information for offline use.

- Wedding-day mode exposes critical operational information in a simplified mobile interface.

# 29. Configuration Decisions to Finalize During Design

- Final public visual theme, colors, fonts and animation style.

- Exact public domain and hosting provider.

- Whether guest login is required or personalized links are sufficient.

- Email service provider for reminders.

- Whether WhatsApp integration will be implemented before or after the wedding.

- Final default task reminder and escalation timing.

- Who, in addition to Chathurya and Oshadi, receives coordinator/admin permissions.

- Whether guest-uploaded photos are enabled during the wedding or only afterward.

- Final seating, meal and transport requirements.

- Whether multilingual content is needed.

# 30. Final Product Statement

The proposed solution should be implemented as a modular wedding digital platform rather than a single static invitation website. The public experience should remain elegant and emotionally engaging, while the private experience should prioritize clarity, control, deadlines and operational readiness.

The platform should allow Chathurya and Oshadi to plan the wedding together, control the budget, coordinate family responsibilities, manage guests and vendors, receive timely reminders, operate the wedding day efficiently and preserve the site afterward as a digital collection of wedding memories.

# Appendix A - Suggested Navigation

## Public Website

- Home / Invitation

- Our Story

- Wedding Details

- Schedule

- Locations

- Gallery

- RSVP

- Guest Book

- Accommodation / Information

- Contact

## Admin Portal

- Dashboard

- Budget

- Expenses

- Tasks

- Calendar

- Guests

- Vendors

- Documents

- Notifications

- Reports

- Wedding-Day Mode

- Settings

## Family Portal

- My Tasks

- Timeline

- Notifications

- Relevant Contacts

- Profile / Notification Preferences

# Appendix B - Example Notification Messages

| **Type**         | **Example**                                                                                 |
|------------------|---------------------------------------------------------------------------------------------|
| Task Assigned    | You have been assigned “Confirm Flower Decorations”, due 30 September 2026.                 |
| Task Due Soon    | Reminder: “Confirm Flower Decorations” is due in 3 days.                                    |
| Task Overdue     | “Confirm Flower Decorations” is overdue. Please update the task status.                     |
| Payment Due      | Photography final payment is due in 7 days.                                                 |
| RSVP Received    | A guest has confirmed attendance. Guest totals have been updated.                           |
| Wedding Timeline | Poruwa ceremony begins in 30 minutes. Please ensure all assigned preparations are complete. |
