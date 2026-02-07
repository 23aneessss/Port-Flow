/* ═══════════════════════════════════════════════════
   TBMS – Types & constantes d'authentification
   ─────────────────────────────────────────────────
   Rôle de ce fichier :
   • Définit les 3 rôles RBAC du système
   • Centralise la configuration UI par rôle
   • Prépare la structure pour JWT / OAuth
   ═══════════════════════════════════════════════════ */

// ─── Rôles RBAC ────────────────────────────────
export type UserRole = "carrier" | "operator" | "admin";

// ─── Configuration UI par rôle ─────────────────
export interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  icon: string; // emoji en MVP, remplacer par SVG en prod
  canSignup: boolean; // seul le carrier peut s'inscrire
  dashboardPath: string; // redirection post-auth
  loginFields: string[]; // champs requis au login
}

// ─── External platform URLs ────────────────────
// Each role redirects to a separate application
export const PLATFORM_URLS: Record<UserRole, string> = {
  carrier: "http://localhost:3001",   // transporter_platform
  operator: "http://localhost:3002",  // operator_platform
  admin: "http://localhost:3003",     // admin_platform
};

export const ROLES: Record<UserRole, RoleConfig> = {
  carrier: {
    id: "carrier",
    label: "Transporter",
    description: "Manage your bookings, time slots and QR codes",
    icon: "🚛",
    canSignup: true,
    dashboardPath: PLATFORM_URLS.carrier,
    loginFields: ["email", "password"],
  },
  operator: {
    id: "operator",
    label: "Operator",
    description: "Validate bookings and manage capacities",
    icon: "🏗️",
    canSignup: false,
    dashboardPath: PLATFORM_URLS.operator,
    loginFields: ["email", "password"],
  },
  admin: {
    id: "admin",
    label: "Administrator",
    description: "Global configuration, roles and security",
    icon: "🔐",
    canSignup: false,
    dashboardPath: PLATFORM_URLS.admin,
    loginFields: ["email", "password"],
  },
};

// ─── Types Formulaire ──────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  registrationNumber: string; // numéro d'immatriculation transporteur
  acceptTerms: boolean;
}

// ─── Types Réponse API (préparation) ───────────
export interface AuthResponse {
  success: boolean;
  token?: string; // JWT access token
  refreshToken?: string;
  user?: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  error?: string;
  redirectTo?: string;
}

// ─── Messages d'erreur sécurisés ───────────────
// Ne révèlent JAMAIS si l'email existe dans le système
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid credentials. Please try again.",
  ACCOUNT_LOCKED: "Account temporarily locked. Try again in 15 minutes.",
  NETWORK_ERROR: "Connection error. Please check your network.",
  SESSION_EXPIRED: "Session expired. Please sign in again.",
  SIGNUP_FAILED: "Registration failed. Please try again.",
  RATE_LIMITED: "Too many attempts. Please wait before trying again.",
} as const;

// ─── Validation ────────────────────────────────
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
