export function sanitizeDocument(doc = '') {
  return String(doc).replace(/\D/g, '')
}

export function validateCPF(cpf = '') {
  const digits = sanitizeDocument(cpf)
  if (!/^\d{11}$/.test(digits)) return { valid: false, error: 'CPF invalido' }
  if (/^(\d)\1{10}$/.test(digits)) return { valid: false, error: 'CPF invalido' }

  const firstDigit = calculateCPFDigit(digits.slice(0, 9), 10)
  const secondDigit = calculateCPFDigit(digits.slice(0, 10), 11)
  const valid = firstDigit === Number(digits[9]) && secondDigit === Number(digits[10])
  return valid ? { valid: true } : { valid: false, error: 'CPF invalido' }
}

export function validateCNPJ(cnpj = '') {
  const digits = sanitizeDocument(cnpj)
  if (!/^\d{14}$/.test(digits)) return { valid: false, error: 'CNPJ invalido' }
  if (/^(\d)\1{13}$/.test(digits)) return { valid: false, error: 'CNPJ invalido' }

  const firstDigit = calculateCNPJDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calculateCNPJDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const valid = firstDigit === Number(digits[12]) && secondDigit === Number(digits[13])
  return valid ? { valid: true } : { valid: false, error: 'CNPJ invalido' }
}

export function formatCPF(cpf = '') {
  const digits = sanitizeDocument(cpf).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatCNPJ(cnpj = '') {
  const digits = sanitizeDocument(cnpj).slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export function formatBirthDate(value = '') {
  const digits = sanitizeDocument(value).slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function brDateToISO(value = '') {
  const [day, month, year] = value.split('/')
  return `${year}-${month}-${day}`
}

export function isAdultBirthDate(value = '') {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false
  const [day, month, year] = value.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false
  const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return age >= 18
}

export function hasFullName(value = '') {
  return value.trim().split(/\s+/).filter(Boolean).length >= 2
}

function calculateCPFDigit(base, initialWeight) {
  const sum = base.split('').reduce((total, digit, index) => total + Number(digit) * (initialWeight - index), 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

function calculateCNPJDigit(base, weights) {
  const sum = base.split('').reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}
