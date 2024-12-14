"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: "Overview",
    href: "/dashboard",
  },
  {
    label: "Services",
    href: "/dashboard/services",
  },
  {
    label: "Incidents",
    href: "/dashboard/incidents",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === route.href
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
