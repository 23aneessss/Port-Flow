"use client";

import { UserRole, ROLES } from "@/lib/auth.types";

/* ═══════════════════════════════════════════════════
   RoleSelector – Visual role selector
   ─────────────────────────────────────────────────
   • Displays 3 role cards
   • Visual indicator for selected role
   • Badge "Open registration" for Carrier
   ═══════════════════════════════════════════════════ */

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  context: "login" | "signup";
}

export default function RoleSelector({
  selectedRole,
  onRoleChange,
  context,
}: RoleSelectorProps) {
  const roles = context === "signup"
    ? [ROLES.carrier]
    : [ROLES.carrier, ROLES.operator, ROLES.admin];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-port-gray font-body">
        {context === "login" ? "Sign in as" : "Account type"}
      </label>
      <div
        className={`grid gap-3 ${
          context === "login" ? "grid-cols-3" : "grid-cols-1"
        }`}
      >
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onRoleChange(role.id)}
              className={`
                relative flex flex-col items-center gap-2 rounded-xl border-2 p-4
                transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? "border-port-cyan bg-port-cyan/5 shadow-lg shadow-port-cyan/10"
                    : "border-port-dark/10 bg-white hover:border-port-cyan/40 hover:bg-port-cyan/[0.02]"
                }
              `}
              aria-pressed={isSelected}
            >
              {/* Active indicator */}
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-port-cyan">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}

              {/* Icon */}
              <span className="text-2xl" role="img" aria-label={role.label}>
                {role.icon}
              </span>

              {/* Role name */}
              <span
                className={`text-sm font-semibold font-heading ${
                  isSelected ? "text-port-dark" : "text-port-gray"
                }`}
              >
                {role.label}
              </span>

              {/* Short description (login only) */}
              {context === "login" && (
                <span className="text-xs text-port-gray/70 text-center leading-tight hidden sm:block">
                  {role.description}
                </span>
              )}

              {/* Open registration badge */}
              {role.canSignup && context === "login" && (
                <span className="mt-1 inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                  Open registration
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
