export function getGenerateErrorMessage(status: number, error?: string): string {
  if (status === 401) {
    return "Please sign in with Google to generate headcanons."
  }
  if (status === 400 && error) {
    return error
  }
  if (status === 429) {
    return error || "You have reached the hourly generation limit. Please try again later."
  }
  if (status === 500 && error) {
    if (error.includes("SILICONFLOW")) {
      return "AI service is not configured. Please try again later."
    }
    return error
  }
  return error || "Something went wrong. Please try again."
}
