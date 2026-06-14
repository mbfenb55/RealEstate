/**
 * Admin erişimi için kullanılacak e-posta adresleri.
 * `ADMIN_EMAILS` env değişkeni virgülle ayrılmış liste bekler.
 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "irfanrsln1@gmail.com";

const parsedAdminEmails = (process.env.ADMIN_EMAILS ?? ADMIN_EMAIL)
  .split(/[,\s;]+/g)
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAILS = Array.from(new Set(parsedAdminEmails.length ? parsedAdminEmails : [ADMIN_EMAIL.toLowerCase()]));

/**
 * Verilen e-posta adresinin admin olup olmadığını kontrol eder.
 */
export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
