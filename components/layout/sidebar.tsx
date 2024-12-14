"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserButton } from "@clerk/nextjs"
import { 
  LayoutDashboard, 
  Server, 
  AlertTriangle, 
  Settings,
  Activity,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-blue-500",
  },
  {
    label: "Services",
    icon: Server,
    href: "/dashboard/services",
    color: "text-violet-500",
  },
  {
    label: "Incidents",
    icon: AlertTriangle,
    href: "/dashboard/incidents",
    color: "text-amber-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-blue-500" />
          <span className="ml-2 text-lg font-semibold">Status</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white">
          <div className="pt-16 pb-3 px-2">
            <nav className="mt-5 px-2 space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                    pathname === route.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <route.icon
                    className={cn("mr-4 h-6 w-6 flex-shrink-0", route.color)}
                  />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Activity className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold">Status</span>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === route.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <route.icon
                  className={cn("mr-3 h-5 w-5 flex-shrink-0", route.color)}
                />
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <UserButton afterSignOutUrl="/" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
