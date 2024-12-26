import { auth } from "@clerk/nextjs"

export async function requireAdmin() {
  const { userId, orgId } = auth()

  if (!userId || !orgId) {
    throw new Error("Unauthorized")
  }

  // In this case, all authenticated users in an organization are considered admins
  // You can add more complex admin checks here if needed
  return {
    userId,
    orgId
  }
}
