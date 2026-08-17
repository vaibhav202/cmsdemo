"use client"

import { LoaderCircle, Send } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const initialValues = {
  businessName: "",
  city: "",
  consent: false,
  email: "",
  message: "",
  name: "",
  phone: "",
  website: "",
}

type FormStatus = "idle" | "submitting" | "success" | "error"
type ErrorCode =
  | "body-too-large"
  | "invalid-body"
  | "origin-invalid"
  | "rate-limited"
  | "unavailable"
  | "validation"

export function PilotInquiryForm() {
  const t = useTranslations("Public")
  const [values, setValues] = useState(initialValues)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)

  function updateValue<Key extends keyof typeof initialValues>(
    key: Key,
    value: (typeof initialValues)[Key]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    if (status !== "idle") {
      setStatus("idle")
      setErrorCode(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")
    setErrorCode(null)

    try {
      const response = await fetch("/api/pilot-inquiry", {
        body: JSON.stringify(values),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
      const result = (await response.json().catch(() => null)) as
        | { errorCode?: ErrorCode; status?: string }
        | null

      if (!response.ok) {
        setErrorCode(result?.errorCode ?? "unavailable")
        setStatus("error")
        return
      }

      setValues(initialValues)
      setStatus("success")
    } catch {
      setErrorCode("unavailable")
      setStatus("error")
    }
  }

  const errorMessage = errorCode
    ? {
        "body-too-large": t("contact.errors.generic"),
        "invalid-body": t("contact.errors.generic"),
        "origin-invalid": t("contact.errors.generic"),
        "rate-limited": t("contact.errors.rateLimited"),
        unavailable: t("contact.errors.unavailable"),
        validation: t("contact.errors.validation"),
      }[errorCode]
    : null

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="sr-only"
        name="website"
        onChange={(event) => updateValue("website", event.target.value)}
        tabIndex={-1}
        value={values.website}
      />
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pilot-name">{t("contact.name")}</FieldLabel>
            <Input
              autoComplete="name"
              id="pilot-name"
              maxLength={80}
              onChange={(event) => updateValue("name", event.target.value)}
              required
              value={values.name}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pilot-email">{t("contact.email")}</FieldLabel>
            <Input
              autoComplete="email"
              id="pilot-email"
              maxLength={254}
              onChange={(event) => updateValue("email", event.target.value)}
              required
              type="email"
              value={values.email}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pilot-business">
              {t("contact.business")}
            </FieldLabel>
            <Input
              autoComplete="organization"
              id="pilot-business"
              maxLength={120}
              onChange={(event) =>
                updateValue("businessName", event.target.value)
              }
              required
              value={values.businessName}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pilot-city">{t("contact.city")}</FieldLabel>
            <Input
              autoComplete="address-level2"
              id="pilot-city"
              maxLength={80}
              onChange={(event) => updateValue("city", event.target.value)}
              value={values.city}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="pilot-phone">{t("contact.phone")}</FieldLabel>
          <Input
            autoComplete="tel"
            id="pilot-phone"
            maxLength={30}
            onChange={(event) => updateValue("phone", event.target.value)}
            type="tel"
            value={values.phone}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="pilot-message">
            {t("contact.message")}
          </FieldLabel>
          <Textarea
            id="pilot-message"
            maxLength={1_000}
            onChange={(event) => updateValue("message", event.target.value)}
            placeholder={t("contact.messagePlaceholder")}
            rows={5}
            value={values.message}
          />
        </Field>
        <Field
          data-invalid={status === "error" && !values.consent}
          orientation="horizontal"
        >
          <input
            aria-invalid={status === "error" && !values.consent}
            className="mt-0.5 size-4 accent-primary"
            id="pilot-consent"
            onChange={(event) => updateValue("consent", event.target.checked)}
            type="checkbox"
            checked={values.consent}
          />
          <FieldLabel htmlFor="pilot-consent">
            {t("contact.consent")}
          </FieldLabel>
        </Field>
        <FieldDescription>
          {t("contact.privacyBefore")} {" "}
          <Link className="underline underline-offset-4" href="/privacy">
            {t("contact.privacyLink")}
          </Link>{" "}
          {t("contact.privacyAfter")}
        </FieldDescription>
      </FieldGroup>

      {status === "success" ? (
        <p aria-live="polite" className="text-sm text-primary">
          {t("contact.success")}
        </p>
      ) : null}
      {status === "error" && errorMessage ? (
        <p aria-live="assertive" className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button disabled={status === "submitting"} type="submit">
        {status === "submitting" ? (
          <LoaderCircle className="animate-spin" data-icon="inline-start" />
        ) : (
          <Send data-icon="inline-start" />
        )}
        {status === "submitting"
          ? t("contact.submitting")
          : t("contact.submit")}
      </Button>
    </form>
  )
}
