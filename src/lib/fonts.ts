import localFont from "next/font/local"

export const headingSerif = localFont({
  adjustFontFallback: "Times New Roman",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  src: "../assets/fonts/LibreBaskerville-Variable.ttf",
  variable: "--font-libre-baskerville",
  weight: "400 700",
})
