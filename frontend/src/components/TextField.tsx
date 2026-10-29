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
      <label htmlFor={name} className="pixel-shadow">
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
        className={`rounded-sm border-2 bg-white px-3 py-2 transition focus:outline-4 focus:outline-offset-1 focus:outline-dex-accent ${
          error ? "border-dex-error bg-red-50" : "border-dex-frame"
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-dex-error">
          {error}
        </p>
      )}

      {showHint && (
        <div
          id={hintId}
          role="tooltip"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 z-10 mt-2 w-full max-w-xs rounded-sm border-2 border-dex-frame bg-white px-3 py-2 shadow-[0_3px_0_0_rgb(0_0_0/0.2)]"
        >
          <span
            aria-hidden="true"
            className="absolute -top-2 left-4 h-3 w-3 rotate-45 border-t-2 border-l-2 border-dex-frame bg-white"
          />
          <div className="relative">{hint}</div>
        </div>
      )}
    </div>
  );
}
