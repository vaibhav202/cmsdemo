export const platformBrand = {
  name: "CMS Platform",
  tagline: "Restaurant operations, kept in flow.",
  shortDescription: "Orders, kitchen, stock, ledger, and reports in one workspace.",
}

export const vendorAccentOptions = [
  {
    name: "Charcoal",
    swatchClass: "bg-vendor-accent-charcoal",
    value: "#27272a",
  },
  {
    name: "Graphite",
    swatchClass: "bg-vendor-accent-graphite",
    value: "#3f3f46",
  },
  { name: "Slate", swatchClass: "bg-vendor-accent-slate", value: "#334155" },
  { name: "Forest", swatchClass: "bg-vendor-accent-forest", value: "#365846" },
  { name: "Indigo", swatchClass: "bg-vendor-accent-indigo", value: "#4338ca" },
  { name: "Maroon", swatchClass: "bg-vendor-accent-maroon", value: "#7f1d1d" },
] as const

export const headingFontOptions = [
  { name: "Sans", value: "sans" },
  { name: "Serif", value: "serif" },
] as const

export function getHeadingFontValue(font: string | null | undefined) {
  if (font === "serif") {
    return "var(--font-libre-baskerville)"
  }

  return "var(--font-geist-sans)"
}

export function normalizeVendorAccent(color: string | null | undefined) {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) {
    return vendorAccentOptions[0].value
  }

  return color.toLowerCase()
}

export function getVendorAccentForeground(
  color: string | null | undefined
) {
  const normalized = normalizeVendorAccent(color)
  const channels = [1, 3, 5].map((offset) =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255
  )
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  )
  const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722

  return luminance > 0.2 ? "#18181b" : "#ffffff"
}

function toHexByte(value: number) {
  return Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0")
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = Math.min(100, Math.max(0, saturation)) / 100
  const l = Math.min(100, Math.max(0, lightness)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const h = (((hue % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((h % 2) - 1))
  const m = l - c / 2
  const [r, g, b] =
    h < 1
      ? [c, x, 0]
      : h < 2
        ? [x, c, 0]
        : h < 3
          ? [0, c, x]
          : h < 4
            ? [0, x, c]
            : h < 5
              ? [x, 0, c]
              : [c, 0, x]

  return `#${toHexByte((r + m) * 255)}${toHexByte((g + m) * 255)}${toHexByte(
    (b + m) * 255
  )}`
}

function parseColorParts(value: string) {
  return value
    .replace("/", " ")
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function parseVendorAccentColor(input: string | null | undefined) {
  const color = input?.trim().toLowerCase()

  if (!color) return null

  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
  }

  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color
  }

  const rgbMatch = color.match(/^rgba?\((.+)\)$/)
  if (rgbMatch) {
    const [r, g, b] = parseColorParts(rgbMatch[1]).map((part) =>
      part.endsWith("%") ? (Number.parseFloat(part) / 100) * 255 : Number(part)
    )

    if ([r, g, b].every(Number.isFinite)) {
      return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`
    }
  }

  const hslMatch = color.match(/^hsla?\((.+)\)$/)
  if (hslMatch) {
    const [h, s, l] = parseColorParts(hslMatch[1]).map((part, index) => {
      if (index === 0) return Number.parseFloat(part.replace("deg", ""))
      return Number.parseFloat(part.replace("%", ""))
    })

    if ([h, s, l].every(Number.isFinite)) {
      return hslToHex(h, s, l)
    }
  }

  return null
}
