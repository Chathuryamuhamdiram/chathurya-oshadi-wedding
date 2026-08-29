# 💍 Chathurya & Oshadi — Wedding Platform

A full-stack wedding management and guest experience platform built with **Next.js**, **Prisma**, and **SQLite**. It includes a luxury public-facing wedding website and a powerful private admin dashboard for managing every aspect of the wedding.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public site.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin dashboard.

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (public)/          # Public wedding website (home page)
│   ├── admin/             # Admin dashboard (protected)
│   │   ├── assets/        # Site asset management
│   │   ├── budget/        # Budget & expense tracking
│   │   ├── calendar/      # Event calendar
│   │   ├── events/        # Wedding event management
│   │   ├── gallery/       # Photo gallery management
│   │   ├── guests/        # Guest list management
│   │   ├── logistics/     # Guest logistics & travel
│   │   ├── seating/       # Seating arrangement
│   │   ├── tasks/         # Task management
│   │   ├── team/          # Team members & roles
│   │   ├── vendors/       # Vendor management
│   │   └── wedding-day/   # Wedding day timeline
│   ├── api/               # API routes
│   ├── invite/[token]/    # Guest invitation page
│   ├── portal/            # Guest self-service portal
│   ├── family/            # Family member portal
│   └── login/             # Authentication
│
├── components/
│   ├── public/            # Public site sections
│   │   ├── Hero.tsx
│   │   ├── Countdown.tsx
│   │   ├── OurStory.tsx
│   │   ├── EventSchedule.tsx
│   │   ├── Gallery.tsx
│   │   ├── Guestbook.tsx
│   │   ├── FloatingNav.tsx
│   │   ├── MusicPlayer.tsx
│   │   └── RSVPModal.tsx
│   ├── invitation/        # Passport-style invitation
│   │   ├── PassportCover.tsx
│   │   └── InvitationClient.tsx
│   ├── admin/             # Admin UI components
│   └── ui/                # Shared UI primitives
│
├── lib/                   # Utilities, Prisma client, auth
├── hooks/                 # Custom React hooks
├── features/              # Feature-specific logic
└── types/                 # TypeScript type definitions
```

---

## 🌐 Public Website (`/`)

The public site is a luxury editorial-style wedding page with the following sections:

| Section | Component | Description |
|---|---|---|
| **Hero** | `Hero.tsx` | Full-screen landing with couple's name & date |
| **Countdown** | `Countdown.tsx` | Live countdown timer to the wedding day |
| **Our Story** | `OurStory.tsx` | Couple's love story timeline |
| **Event Schedule** | `EventSchedule.tsx` | Wedding day events with venue & map links |
| **Gallery** | `Gallery.tsx` | Photo gallery |
| **Guestbook** | `Guestbook.tsx` | Public guestbook / well wishes |

### Design Theme
- **Aesthetic**: Luxury Editorial / Vogue-inspired
- **Color palette**: Warm ivory `#F8F2E8`, deep navy `#10233B`, gold `#D7B56D`
- **Typography**: Serif + tracked sans-serif
- **Animations**: Framer Motion scroll reveals, compass oscillation, parallax effects
- **Decorative assets**: Compass, lighthouse, landscape, leaf ornament, stamps

---

## 🔐 Admin Dashboard (`/admin`)

Protected dashboard for the wedding planning team.

### Modules

| Module | Route | Description |
|---|---|---|
| **Dashboard** | `/admin` | Overview, quick stats, recent activity |
| **Guests** | `/admin/guests` | Guest list, RSVP tracking, invitation status |
| **Events** | `/admin/events` | Wedding events & program items |
| **Seating** | `/admin/seating` | Table assignments & seating plan |
| **Budget** | `/admin/budget` | Budget categories, items & expenses |
| **Vendors** | `/admin/vendors` | Vendor contacts & payments |
| **Tasks** | `/admin/tasks` | Task management with priorities & reminders |
| **Calendar** | `/admin/calendar` | Full calendar view of all events & tasks |
| **Gallery** | `/admin/gallery` | Upload & manage gallery photos |
| **Logistics** | `/admin/logistics` | Guest travel & accommodation tracking |
| **Team** | `/admin/team` | Manage admin users & roles |
| **Assets** | `/admin/assets` | Manage site images (hero, story, etc.) |
| **Wedding Day** | `/admin/wedding-day` | Live wedding day timeline view |

### User Roles

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Full access to everything |
| `ADMIN` | Most admin features |
| `FAMILY_MEMBER` | Limited view, family portal |
| `VIEWER` | Read-only |

---

## 💌 Guest Invitation (`/invite/[token]`)

A unique passport-style digital invitation for each guest. Accessed via a personal invitation link shared over WhatsApp or email.

**Features:**
- Personalized guest name & event details
- RSVP confirmation with guest count
- Google Maps link for each venue
- Unique invitation token per guest

---

## 🗄️ Database Schema (Prisma + SQLite)

### Core Models

| Model | Purpose |
|---|---|
| `User` | Admin/family team members |
| `Guest` | Wedding guests & RSVP info |
| `WeddingEvent` | Events (Poruwa, Reception, etc.) |
| `Venue` | Event venues with map links |
| `EventItem` | Items/checklist per event |
| `SeatingTable` | Tables & seating assignments |
| `GuestLogistics` | Travel & accommodation per guest |
| `BudgetCategory` | Budget groupings |
| `BudgetItem` | Individual budget line items |
| `Expense` | Actual expenses logged |
| `Vendor` | Vendor contacts & payments |
| `Task` | Planning tasks with priorities |
| `TaskComment` | Comments on tasks |
| `TaskReminder` | Scheduled task reminders |
| `GalleryImage` | Public gallery photos |
| `GuestbookEntry` | Public guestbook messages |
| `SiteAsset` | Managed site images (hero, story, etc.) |
| `Notification` | In-app notifications |
| `Permission` | Fine-grained permission system |
| `AuditLog` | Action audit trail |

---

## 🎨 Decorative Assets

All illustrations are stored in `/public/images/illustrations/`:

| File | Usage |
|---|---|
| `compass.png` | Animated oscillating compass (Event Schedule left) |
| `lighthouse_fixed.png` | Lighthouse scene watermark (Event Schedule right) |
| `landscape_building.png` | Landscape silhouette (Event Schedule background left) |
| `leaf_ornament.png` | Header ornament divider |
| `stamp_circle.png` | Decorative stamp element |
| `stamp_rectangle.png` | Decorative stamp element |
| `wavy_lines.png` | Background texture |

> **Note for future images:** PNG files with a real transparent background (checkerboard pattern) can be used directly. Images with a solid black background need the background-removal script to restore transparency before use.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database ORM | Prisma |
| Database | SQLite (`prisma/dev.db`) |
| Animations | Framer Motion |
| Styling | Tailwind CSS |
| Auth | Custom session-based auth |
| Language | TypeScript |

---

## 📅 Wedding Details

- **Date**: 08 October 2026
- **Couple**: Chathurya & Oshadi
- **Location**: Sri Lanka
