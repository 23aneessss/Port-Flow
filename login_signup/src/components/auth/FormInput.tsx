"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════
   FormInput – Champ de formulaire TBMS
   ─────────────────────────────────────────────────
   • Input stylisé selon la charte graphique
   • Support password toggle (show/hide)
   • États : default, focus, error, disabled
   ═══════════════════════════════════════════════════ */

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  hint?: string;
}

export default function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  disabled = false,
  icon,
  hint,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-port-gray font-body"
      >
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </label>

      <div className="relative">
        {/* Icône gauche */}
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-port-gray/60">
            {icon}
          </span>
        )}

        <input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`
            block w-full rounded-lg border px-4 py-3 text-sm font-body
            text-port-dark placeholder-port-gray/40
            transition-all duration-200
            disabled:cursor-not-allowed disabled:opacity-50
            ${icon ? "pl-10" : ""}
            ${isPassword ? "pr-16" : ""}
            ${
              error
                ? "border-error bg-error/5 focus:border-error focus:ring-2 focus:ring-error/20"
                : "border-port-dark/15 bg-white focus:border-port-cyan focus:ring-2 focus:ring-port-cyan/20"
            }
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />

        {/* Toggle password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-port-gray hover:text-port-cyan transition-colors"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {/* Hint */}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-port-gray/60">
          {hint}
        </p>
      )}

      {/* Erreur */}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs text-error" role="alert">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
