// What to show for a user account in admin lists. A Google sign-in stores
// Google's display name, which a Google account may not have -- then the
// name is null and the row used to read blank. The verified email is shown
// in its place (display only; nothing is saved back).
export function userDisplayName(name: string | null | undefined, email: string): string {
  return name?.trim() || email;
}
