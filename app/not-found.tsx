import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center"
    >
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 p-4">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-3 text-lg text-gray-600">This page could not be found.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/character-headcanon">Create Headcanon</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/explore">Explore Community</Link>
        </Button>
      </div>
    </main>
  )
}
