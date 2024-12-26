import { useOrganization, useUser } from "@clerk/nextjs"

export function useAdmin() {
  const { user } = useUser()
  const { organization } = useOrganization()

  if (!user || !organization) {
    return false
  }

  const membership = user.organizationMemberships.find(
    (mem) => mem.organization.id === organization.id
  )

  return membership?.role === "admin"
}
