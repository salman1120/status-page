# Status Page Application

## Overview
A comprehensive status page application for monitoring and reporting service statuses in real-time.

## Features
- 🔐 User Authentication & Team Management
- 🏢 Multi-tenant Organization Support
- 🚦 Service Status Management
- ⚡ Real-time Updates
- 🔔 Incident Tracking and Updates
- 📊 Public Status Page
- 📈 Uptime Metrics
- ✉️ Email Notifications
- 🔌 External API Access
- 🎨 Clean, Modern UI

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Prisma (PostgreSQL)
- Clerk (Authentication)
- Pusher (Real-time updates)
- Chart.js (Metrics)
- Resend (Email notifications)
- Tailwind CSS & Shadcn UI
- Vercel (Deployment)

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account (for authentication)
- Pusher account (for real-time updates)
- Resend account (for email notifications)
- Vercel account (for deployment)

## Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/status-page-app.git
cd status-page-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with:
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/statuspage"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Pusher
PUSHER_APP_ID=your_pusher_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

# Email
RESEND_API_KEY=your_resend_api_key

# External API
STATUS_API_KEY=your_generated_api_key
```

4. Initialize the database
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server
```bash
npm run dev
```

## External API Documentation

### Get System Status
```http
GET /api/v1/status?api_key=your_api_key
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-14T01:13:57Z",
  "services": [
    {
      "id": "1",
      "name": "API",
      "status": "OPERATIONAL",
      "updatedAt": "2024-12-14T01:13:57Z"
    }
  ],
  "active_incidents": [
    {
      "id": "1",
      "title": "API Latency Issues",
      "status": "INVESTIGATING",
      "serviceId": "1",
      "startedAt": "2024-12-14T01:10:00Z"
    }
  ]
}
```

## Deployment to Vercel

1. Create a new project on Vercel
   - Connect your GitHub repository
   - Vercel will automatically detect Next.js

2. Configure environment variables
   - Add all environment variables from `.env` to Vercel project settings
   - Ensure all NEXT_PUBLIC_ variables are properly set

3. Configure Vercel PostgreSQL
   - Create a new Postgres database in Vercel
   - Update DATABASE_URL in environment variables
   - Run prisma db push in Vercel deployment settings

4. Deploy
   - Push your changes to GitHub
   - Vercel will automatically deploy your application
   - Your status page will be live at your-project.vercel.app

## Project Structure
```
status-page/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── v1/           # External API endpoints
│   ├── dashboard/         # Dashboard pages
│   └── status/           # Public status page
├── components/            # React components
│   ├── incidents/        # Incident management
│   └── services/         # Service management
├── lib/                   # Utility functions
└── prisma/               # Database schema
```

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.
