const BLOCKED_TERMS = [
  "test123",
  "asdf",
  "qwerty",
  "xxx",
  "lorem ipsum",
  "foo bar",
  "john doe",
];

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function hasMinLetters(field: string, min: number): boolean {
  const letters = field.replace(/[^a-zA-Z]/g, "").length;
  return letters >= min;
}

function digitRatio(field: string): number {
  const digits = field.replace(/[^0-9]/g, "").length;
  return field.length > 0 ? digits / field.length : 0;
}

function symbolRatio(field: string): number {
  const symbols = field.replace(/[a-zA-Z0-9\s.,'-]/g, "").length;
  return field.length > 0 ? symbols / field.length : 0;
}

function isRepeatedChars(field: string): boolean {
  return /^(.)\1{4,}$/.test(field.replace(/\s/g, ""));
}

export function validateScanInput(
  businessName: string,
  businessType: string,
  location: string,
): ValidationResult {
  if (businessName.length < 2 || businessName.length > 80) {
    return { valid: false, error: "Business name must be between 2 and 80 characters" };
  }
  if (businessType.length < 2 || businessType.length > 60) {
    return { valid: false, error: "Business type must be between 2 and 60 characters" };
  }
  if (location.length < 2 || location.length > 60) {
    return { valid: false, error: "Location must be between 2 and 60 characters" };
  }

  const combined = `${businessName} ${businessType} ${location}`.toLowerCase();

  for (const term of BLOCKED_TERMS) {
    if (combined.includes(term)) {
      return { valid: false, error: "Please enter real business information" };
    }
  }

  if (isRepeatedChars(businessName)) {
    return { valid: false, error: "Please enter a valid business name" };
  }
  if (isRepeatedChars(businessType)) {
    return { valid: false, error: "Please enter a valid business type" };
  }
  if (isRepeatedChars(location)) {
    return { valid: false, error: "Please enter a valid location" };
  }

  if (!hasMinLetters(businessName, 2)) {
    return { valid: false, error: "Business name must contain at least 2 letters" };
  }
  if (!hasMinLetters(businessType, 2)) {
    return { valid: false, error: "Business type must contain at least 2 letters" };
  }
  if (!hasMinLetters(location, 2)) {
    return { valid: false, error: "Location must contain at least 2 letters" };
  }

  if (digitRatio(businessName) > 0.5) {
    return { valid: false, error: "Business name contains too many digits" };
  }
  if (digitRatio(businessType) > 0.3) {
    return { valid: false, error: "Business type should describe a service category" };
  }
  if (digitRatio(location) > 0.5) {
    return { valid: false, error: "Location contains too many digits" };
  }

  if (symbolRatio(businessName) > 0.3) {
    return { valid: false, error: "Business name contains too many special characters" };
  }
  if (symbolRatio(businessType) > 0.3) {
    return { valid: false, error: "Business type contains too many special characters" };
  }
  if (symbolRatio(location) > 0.3) {
    return { valid: false, error: "Location contains too many special characters" };
  }

  return { valid: true };
}
