import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type NotificationEmail = {
  to: string
  subject: string
  serviceName: string
  status: string
  description?: string
}

export async function sendStatusNotification({
  to,
  subject,
  serviceName,
  status,
  description
}: NotificationEmail) {
  try {
    await resend.emails.send({
      from: 'status@yourdomain.com',
      to,
      subject,
      html: `
        <h2>Status Update for ${serviceName}</h2>
        <p>Current Status: <strong>${status}</strong></p>
        ${description ? `<p>Details: ${description}</p>` : ''}
        <p>View more details on your status page.</p>
      `
    })
  } catch (error) {
    console.error('Failed to send email notification:', error)
  }
}
