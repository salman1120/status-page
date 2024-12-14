# Status Page

A modern, real-time status page application built with Next.js 14, React, and Prisma. Monitor your services, track incidents, and keep your users informed about system status.

## Features

- 🔄 Real-time service status updates
- 📊 Service metrics tracking (uptime & latency)
- 📧 Email notifications for status changes
- 📈 Beautiful metric visualizations
- 🔐 Secure authentication with Clerk
- 🌐 Public status page for each organization
- 📱 Responsive design for all devices

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

3. Set up environment variables:
   ```env
   DATABASE_URL=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=
   PUSHER_APP_ID=
   NEXT_PUBLIC_PUSHER_KEY=
   PUSHER_SECRET=
   RESEND_API_KEY=
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
status-page/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── [orgSlug]/        # Public status pages
├── components/            # React components
│   ├── incidents/        # Incident-related components
│   ├── metrics/         # Metric visualization components
│   └── ui/              # Reusable UI components
├── lib/                   # Utility functions and configurations
├── prisma/               # Database schema and migrations
└── types/                # TypeScript type definitions
```

## API Routes

- `POST /api/services`: Create a new service
- `PATCH /api/services/[id]`: Update service status
- `POST /api/incidents`: Create an incident
- `PATCH /api/incidents/[id]`: Update incident status
- `GET /api/public/[orgSlug]/status`: Get public status page data
- `POST /api/cron/collect-metrics`: Collect service metrics

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT License
