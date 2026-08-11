export function getFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

export function getRequiredFormString(
  formData: FormData,
  key: string,
  errorMessage: string
) {
  const value = getFormString(formData, key)

  if (!value) {
    throw new Error(errorMessage)
  }

  return value
}
