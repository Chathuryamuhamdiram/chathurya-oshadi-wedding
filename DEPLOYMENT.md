# 🚀 Deployment Guide: Next.js + Supabase + Vercel

This document outlines the exact steps to deploy this wedding website for free. The project uses Next.js for the frontend/backend and Prisma to connect to a PostgreSQL database.

---

## Phase 1: Set up the Database (Supabase)

Since this app uses a database for RSVPs, Tasks, Budgeting, etc., we need a live database. We use **Supabase** because it provides an excellent free PostgreSQL database.

1. Go to [Supabase.com](https://supabase.com/) and create a free account.
2. Click **New Project**, select your organization, and give your project a name (e.g., `wedding-site-db`).
3. **Important:** Create a strong Database Password and save it! You will need it in a moment. Click **Create new project**.
4. Once the project is provisioned (takes ~2 minutes), look at the top right of the dashboard and click the **Connect** button.
5. In the pop-up window, click the **ORMs** tab, then select **Prisma**.
6. Copy the connection string provided. It will look like this:
   `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
7. Replace `[YOUR-PASSWORD]` in the string with the password you created in step 3. 
   
> **This final string is your `DATABASE_URL`. Keep it copied to your clipboard for Phase 2.**

---

## Phase 2: Deploy the App (Vercel)

We use **Vercel** to host the actual website because it is built by the creators of Next.js and is incredibly fast and free.

1. Go to [Vercel.com](https://vercel.com/) and create a free account.
2. From the Vercel Dashboard, click the black **Add New...** button in the top right corner and select **Project**.
3. Under "Import Git Repository", click **Continue with GitHub**.
4. Find this repository (`chathurya-oshadi-wedding`) in the list and click **Import**.
5. You are now on the "Configure Project" screen. **Stop here and do not click deploy yet.**

### Configure Build & Environment Settings

While still on the "Configure Project" screen, you must add the following settings so Vercel can talk to Supabase:

#### 1. Update the Build Command
Vercel needs to generate the Prisma client and push the database schema before it builds the site.
- Click to expand the **Build and Output Settings** section.
- Turn on the toggle switch to override the **Build Command**.
- Paste this exact command into the box:
  ```bash
  npx prisma generate && npx prisma migrate deploy && next build
  ```

#### 2. Add the Database URL
- Click to expand the **Environment Variables** section.
- In the **Key** box, type exactly: `DATABASE_URL`
- In the **Value** box, paste your Supabase connection string (the one with your password in it).
- Click the **Add** button.

### Deploy!

Once both settings are added, click the large **Deploy** button. 

Vercel will take about 1 to 2 minutes to build the site, set up the database tables, and make it live. When it's done, you will receive a public URL to view your live wedding website!

---

## Troubleshooting

- **Build Failed:** If Vercel fails during the build step, it is almost always because the `DATABASE_URL` was typed incorrectly, or the password inside the URL was wrong. Double-check your environment variables in Vercel Settings -> Environment Variables.
- **Data Not Saving:** Ensure your `prisma/schema.prisma` file has `provider = "postgresql"` and `url = env("DATABASE_URL")`. (This is already done in the main branch).
