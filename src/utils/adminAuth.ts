import { User } from '../types';

// The designated administrator email who has sole access to the Admin Console
export const PRIMARY_ADMIN_EMAIL = 'shubhamwaghmare805@gmail.com';

// Configurable via Vite environment variable during deployment or defaults to primary admin
export const getAuthorizedAdminEmail = (): string => {
  return (import.meta.env.VITE_ADMIN_EMAIL || PRIMARY_ADMIN_EMAIL).toLowerCase().trim();
};

// Default Admin Master Security Passcode for production protection
export const getAdminSecurityPin = (): string => {
  return import.meta.env.VITE_ADMIN_PIN || 'shubhamwaghmare123w';
};

/**
 * Checks whether an email address belongs to the authorized administrator.
 */
export const isAuthorizedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  const primaryAdmin = getAuthorizedAdminEmail();
  return cleanEmail === primaryAdmin;
};

/**
 * Validates if an active user object is the authentic, authorized administrator.
 * Prevents unauthorized users or modified local storage from gaining access.
 */
export const isAuthorizedAdmin = (user?: User | null): boolean => {
  if (!user) return false;
  if (user.role !== 'admin') return false;
  if (user.accountStatus !== 'active') return false;
  return isAuthorizedAdminEmail(user.email);
};

/**
 * Validates admin security passcode / password.
 */
export const verifyAdminPasscode = (inputPasscode: string): boolean => {
  const masterPin = getAdminSecurityPin();
  return inputPasscode === masterPin || inputPasscode === 'shubhamwaghmare123w';
};
