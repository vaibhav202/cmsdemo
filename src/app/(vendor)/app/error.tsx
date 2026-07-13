"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type WorkspaceErrorProps = {
  error: Error & { digest?: string }
  retry: () => void
}

export default function WorkspaceError({
  error,
  retry,
}: WorkspaceErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Workspace unavailable</CardTitle>
          <CardDescription>
            The platform could not connect to the workspace database. Check the
            Supabase project status and connection settings, then try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your session is still active. No order or account data was changed.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={retry}>
            <RefreshCw data-icon="inline-start" />
            Try again
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
