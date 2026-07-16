"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import {
  accessibilityCookieMaxAge,
  accessibilityCookieName,
  defaultAccessibilityPreferences,
  getAccessibilityStyle,
  serializeAccessibilityPreferences,
  type AccessibilityPreferences,
  type ColorProfile,
} from "@/lib/accessibility-preferences"

type AccessibilityContextValue = AccessibilityPreferences & {
  resetPreferences: () => void
  setColorProfile: (value: ColorProfile) => void
  setTextSize: (value: number) => void
  setTextWeight: (value: number) => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
)

function applyPreferences(preferences: AccessibilityPreferences) {
  const root = document.documentElement
  const style = getAccessibilityStyle(preferences)

  root.dataset.colorProfile = preferences.colorProfile
  root.style.fontSize = style.fontSize as string
  root.style.setProperty(
    "--font-weight-normal",
    String(style["--font-weight-normal"])
  )
  root.style.setProperty(
    "--font-weight-medium",
    String(style["--font-weight-medium"])
  )
  root.style.setProperty(
    "--font-weight-semibold",
    String(style["--font-weight-semibold"])
  )

  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${accessibilityCookieName}=${serializeAccessibilityPreferences(preferences)}; Path=/; Max-Age=${accessibilityCookieMaxAge}; SameSite=Lax${secure}`
}

export function AccessibilityProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode
  initialPreferences: AccessibilityPreferences
}) {
  const [preferences, setPreferences] =
    useState<AccessibilityPreferences>(initialPreferences)

  const updatePreferences = useCallback(
    (next: AccessibilityPreferences) => {
      setPreferences(next)
      applyPreferences(next)
    },
    []
  )

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      ...preferences,
      resetPreferences: () =>
        updatePreferences(defaultAccessibilityPreferences),
      setColorProfile: (colorProfile) =>
        updatePreferences({ ...preferences, colorProfile }),
      setTextSize: (textSize) =>
        updatePreferences({ ...preferences, textSize }),
      setTextWeight: (textWeight) =>
        updatePreferences({ ...preferences, textWeight }),
    }),
    [preferences, updatePreferences]
  )

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibilityPreferences() {
  const context = useContext(AccessibilityContext)

  if (!context) {
    throw new Error(
      "useAccessibilityPreferences must be used inside AccessibilityProvider"
    )
  }

  return context
}
