/**
 * Mirrors the backend's `@IsStrongPassword` rule (`SignupDto.password`):
 * min 8 characters, at least 1 uppercase letter, at least 1 number.
 * Lowercase and symbols are allowed but not required.
 */
export function passwordStrengthError(password: string): string | null {
  if (password.length < 8) return "Debe tener al menos 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "Debe incluir al menos una mayúscula.";
  if (!/[0-9]/.test(password)) return "Debe incluir al menos un número.";
  return null;
}
