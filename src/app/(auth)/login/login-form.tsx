"use client"

import { useActionState } from "react"
import { KeyRound, LogIn, Mail } from "lucide-react"
import { useTranslations } from "next-intl"

import { loginAction, type LoginState } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

type LoginFormProps = {
  next?: string
}

const initialState: LoginState = {}

export function LoginForm({ next }: LoginFormProps) {
  const [state, action, pending] = useActionState(loginAction, initialState)
  const t = useTranslations("Auth.form")

  return (
    <form action={action} className="flex flex-col gap-5">
      <input name="next" type="hidden" value={next ?? ""} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupAddon>
              <Mail />
            </InputGroupAddon>
            <InputGroupInput
              autoComplete="email"
              defaultValue={state.email}
              id="email"
              name="email"
              placeholder={t("emailPlaceholder")}
              type="email"
            />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupAddon>
              <KeyRound />
            </InputGroupAddon>
            <InputGroupInput
              autoComplete="current-password"
              id="password"
              name="password"
              placeholder={t("passwordPlaceholder")}
              type="password"
            />
          </InputGroup>
        </Field>
      </FieldGroup>
      {state.error ? <FieldError>{state.error}</FieldError> : null}
      <Button className="h-10 w-full" disabled={pending} type="submit">
        <LogIn data-icon="inline-start" />
        {pending ? t("pending") : t("submit")}
      </Button>
    </form>
  )
}
