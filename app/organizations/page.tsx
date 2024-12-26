"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useOrganizationList, useUser, CreateOrganization } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Plus } from "lucide-react"

export default function OrganizationsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  const handleOrganizationSelect = async (orgId: string) => {
    try {
      setLoading(true)
      await setActive({ organization: orgId })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error switching organization:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4">
            <CreateOrganization
              afterCreateOrganizationUrl="/dashboard"
              appearance={{
                elements: {
                  card: "shadow-none",
                }
              }}
            />
          </div>
        </div>
      )}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-600">Select an organization to continue or create a new one.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Create New Organization Card */}
          <Card className="relative group hover:shadow-lg transition-shadow">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full h-full text-left"
              disabled={loading}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Organization
                </CardTitle>
                <CardDescription>
                  Set up a new organization for your status page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Start fresh with a new organization and customize it to your needs.
                </div>
              </CardContent>
            </button>
          </Card>

          {/* Existing Organizations */}
          {userMemberships.data?.map((membership) => (
            <Card
              key={membership.organization.id}
              className="relative group hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => handleOrganizationSelect(membership.organization.id)}
                className="w-full h-full text-left"
                disabled={loading}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {membership.organization.name}
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>
                    {membership.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {membership.organization.membersCount} members
                  </div>
                </CardContent>
              </button>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
