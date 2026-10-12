import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import {
  accessibilityCookieName,
  getAccessibilityStyle,
  parseAccessibilityPreferences,
} from "@/lib/accessibility-preferences";
import { platformBrand } from "@/features/vendors/brand";
import { getLocaleSansFont, localeFontVariables } from "@/lib/fonts";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: {
      default: t("title"),
      template: `%s | ${platformBrand.name}`,
    },
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages, cookieStore] = await Promise.all([
    getLocale(),
    getMessages(),
    cookies(),
  ]);
  const accessibilityPreferences = parseAccessibilityPreferences(
    cookieStore.get(accessibilityCookieName)?.value
  );
  const localeSans = getLocaleSansFont(locale);
  const localeStyle = {
    "--font-ui-sans": localeSans,
    "--heading-font-family": localeSans,
    ...getAccessibilityStyle(accessibilityPreferences),
  } as CSSProperties;

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      data-color-profile={accessibilityPreferences.colorProfile}
      className={`${geistSans.variable} ${geistMono.variable} ${localeFontVariables} h-full antialiased`}
      style={localeStyle}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground"
      >
        <NextIntlClientProvider messages={messages}>
          <AccessibilityProvider initialPreferences={accessibilityPreferences}>
            <ThemeProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </AccessibilityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
