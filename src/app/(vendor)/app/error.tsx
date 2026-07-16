"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

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
  const t = useTranslations("WorkspaceError")
  const common = useTranslations("Common.actions")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("unchanged")}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={retry}>
            <RefreshCw data-icon="inline-start" />
            {common("tryAgain")}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
