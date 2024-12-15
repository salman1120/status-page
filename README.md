# Status Page

A modern, real-time status page application built with Next.js 14, React, and Prisma. Monitor your services, track incidents, and keep your users informed about system status.

🌐 **Live Demo**: [https://status-page2.vercel.app/](https://status-page2.vercel.app/)

📺 **Demo Video**: [Watch Demo on YouTube](https://youtu.be/demo-video)

![Status Page Demo](https://raw.githubusercontent.com/yourusername/status-page/main/public/demo.png)

## Features

- 🔄 Real-time service status updates
- 📊 Service metrics tracking (uptime & latency)
- 🚨 Incident management with status updates
- 📈 Beautiful metric visualizations
- 🔐 Secure authentication with Clerk
- 🌐 Public status page for each organization
- 📱 Responsive design for all devices
- 🔔 Real-time notifications with Pusher
- 📧 Email notifications via Resend

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **Real-time**: Pusher
- **Email**: Resend

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/statuspage"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_****
   CLERK_SECRET_KEY=****
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Pusher Real-time
   PUSHER_APP_ID=****
   NEXT_PUBLIC_PUSHER_KEY=****
   PUSHER_SECRET=****
   NEXT_PUBLIC_PUSHER_CLUSTER=****

   # Resend Email
   RESEND_API_KEY=re_****
   ```

4. Initialize the database:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate deploy
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

1. Push your code to GitHub

2. Create a new project on Vercel:
   - Connect your GitHub repository
   - Vercel will automatically detect Next.js settings

3. Configure Environment Variables:
   - Add all the environment variables from `.env` to your Vercel project settings
   - Ensure the `DATABASE_URL` points to your production database

4. Deploy Settings:
   - Build Command: `npm run build` (includes Prisma generate and migrations)
   - Output Directory: `.next`
   - Install Command: `npm install`

5. Deploy:
   - Vercel will automatically deploy your application
   - Migrations will run during the build process

## Project Structure

```
status-page/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── status/           # Public status pages
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Key Features Implementation

### Service Monitoring
- Automatic health checks via cron API route
- Uptime and latency tracking
- Historical metrics with Chart.js visualizations

### Incident Management
- Create and update incidents
- Real-time status updates
- Automatic service status sync
- Public incident timeline

### Real-time Updates
- Pusher integration for live updates
- Automatic UI updates on status changes
- Real-time metric updates

### Organization Management
- Multi-organization support
- Team member management
- Custom branding options
- Public status page per organization

## Environment Variables Guide

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key
- `PUSHER_APP_ID`: Pusher app ID
- `NEXT_PUBLIC_PUSHER_KEY`: Pusher public key
- `PUSHER_SECRET`: Pusher secret
- `RESEND_API_KEY`: Resend API key for emails

### Optional Variables
- `NEXT_PUBLIC_PUSHER_CLUSTER`: Pusher cluster (default: 'mt1')
- Clerk redirect URLs (customizable based on your routes)

## Database Migrations

The project uses Prisma for database management. When deploying:
1. Migrations run automatically during build (`npm run build`)
2. Manual migration: `npx prisma migrate deploy`
3. Reset database: `npx prisma migrate reset`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own status page!
