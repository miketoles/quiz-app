// Generate a random 6-digit game PIN
export function generateGamePin(): string {
  const min = 100000
  const max = 999999
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

// Format PIN for display (add space in middle for readability)
export function formatGamePin(pin: string): string {
  if (pin.length !== 6) return pin
  return `${pin.slice(0, 3)} ${pin.slice(3)}`
}

// Validate PIN format
export function isValidPin(pin: string): boolean {
  const cleaned = pin.replace(/\s/g, '')
  return /^\d{6}$/.test(cleaned)
}

// Clean PIN (remove spaces and formatting)
export function cleanPin(pin: string): string {
  return pin.replace(/\s/g, '')
}
