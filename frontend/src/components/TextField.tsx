import { useState, type InputHTMLAttributes, type ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
};

export function TextField({
  label,
  name,
  error,
  hint,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const showHint = Boolean(hint) && focused;

  const describedBy =
    [error && errorId, showHint && hintId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={`rounded-lg border px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
          error
            ? "border-red-500 bg-red-50 focus:ring-red-200"
            : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}

      {showHint && (
        <div
          id={hintId}
          role="tooltip"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 z-10 mt-2 w-full max-w-xs rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg"
        >
          <span
            aria-hidden="true"
            className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 bg-slate-800"
          />
          <div className="relative">{hint}</div>
        </div>
      )}
    </div>
  );
}
