import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col space-y-6">
        <h1 className="text-4xl font-bold text-center mb-4">
          Status Page Dashboard
        </h1>
        
        <div className="flex space-x-4 justify-center">
          <Link href="/dashboard">
            <Button variant="default">
              Dashboard
            </Button>
          </Link>
          <Link href="/status">
            <Button variant="outline">
              Public Status
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
