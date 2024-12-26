"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Shield, Globe } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export default function Home() {
  const { user } = useUser()

  // If user is signed in, they'll be redirected to /organizations by the middleware
  const getStartedUrl = user ? "/organizations" : "/sign-in"

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 via-white to-blue-100/50 dark:from-violet-950/50 dark:via-gray-900 dark:to-blue-950/50" />
            <div className="absolute right-0 top-0 -mt-24 h-96 w-96 rounded-full bg-gradient-to-b from-violet-100 to-violet-50 blur-3xl dark:from-violet-950 dark:to-violet-900" />
            <div className="absolute left-0 bottom-0 -mb-24 h-96 w-96 rounded-full bg-gradient-to-t from-blue-100 to-blue-50 blur-3xl dark:from-blue-950 dark:to-blue-900" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/80 to-white/50 dark:from-gray-900/50 dark:via-gray-900/80 dark:to-gray-900/50" />
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary to-gray-600 dark:from-white dark:via-primary dark:to-gray-300 pb-2">
                  Status Page Dashboard
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
                  Monitor your services in real-time and keep your users informed with a beautiful status page.
                </p>
              </div>
              <div>
                <Link href={getStartedUrl}>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-violet-600 hover:to-violet-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/25 hover:shadow-violet-500/25">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950" />
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />
          <div className="container relative px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/25 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex flex-col items-center space-y-4 text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Real-time Monitoring</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Monitor your services in real-time with automatic updates and notifications.
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/25 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex flex-col items-center space-y-4 text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Secure & Reliable</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Built with security in mind, ensuring your data is safe and your status page is always available.
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/25 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex flex-col items-center space-y-4 text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-full">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Global Status</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Keep your users informed with a beautiful, customizable status page that works globally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
