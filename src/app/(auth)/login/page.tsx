import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"

import { LoginForm } from "@/app/(auth)/login/login-form"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { platformBrand } from "@/lib/brand"
import { workspaceAccounts, workspaceVendor } from "@/lib/workspace-data"
import { getCurrentWorkspaceSession } from "@/lib/workspace-auth"
import { getDefaultRouteForRole } from "@/lib/permissions"

export const metadata: Metadata = {
  title: "Sign in",
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentWorkspaceSession()

  if (session) {
    redirect(getDefaultRouteForRole(session.user.role, session.vendor.slug))
  }

  const { next } = await searchParams

  return (
    <main className="min-h-svh px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-2.5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="flex flex-col gap-7">
          <div className="flex items-center gap-3">
            <Badge
              className="size-10 justify-center rounded-lg"
              variant="default"
            >
              <ShieldCheck />
            </Badge>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {workspaceVendor.name} workspace
              </p>
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {platformBrand.name}
              </h1>
            </div>
          </div>
          <div className="flex max-w-2xl flex-col gap-4">
            <Badge variant="outline">Restaurant operations workspace</Badge>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Run orders, kitchen queue, stock, and accounts from phone or
              computer.
            </h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              {platformBrand.tagline} Separate views keep the counter, kitchen,
              owner, and accounts team focused on their own work.
            </p>
          </div>
          <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              ["Daily counter", "Orders and tokens"],
              ["Kitchen", "Live preparation flow"],
              ["Owner view", "Menu, stock, reports"],
            ].map(([label, value]) => (
              <Card key={label} size="sm">
                <CardHeader>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle>{value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Use your assigned workspace credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm next={next} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace roles</CardTitle>
              <CardDescription>
                Access changes by assigned staff role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaceAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{account.role}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
