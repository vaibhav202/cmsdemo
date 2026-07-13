export class DataServiceError extends Error {
  constructor(context: string, message: string) {
    super(`${context}: ${message}`)
    this.name = "DataServiceError"
  }
}

export class VendorNotFoundError extends Error {
  constructor(slug: string) {
    super(`Vendor not found: ${slug}`)
    this.name = "VendorNotFoundError"
  }
}
