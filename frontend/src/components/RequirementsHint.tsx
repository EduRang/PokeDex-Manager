import type { Requirement } from "../utils/validation";

interface RequirementsHintProps {
  title: string;
  requirements: Requirement[];
  value: string;
  note?: string;
}

// Lista que marca cada requisito como cumplido mientras el usuario escribe
export function RequirementsHint({
  title,
  requirements,
  value,
  note,
}: RequirementsHintProps) {
  return (
    <>
      <p className="mb-1 font-medium">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {requirements.map(({ label, isMet }) => {
          const met = isMet(value);
          return (
            <li
              key={label}
              className={`flex items-center gap-2 ${met ? "text-emerald-300" : "text-slate-300"}`}
            >
              <span aria-hidden="true">{met ? "✓" : "○"}</span>
              <span>
                {label}
                <span className="sr-only">
                  {met ? " (cumplido)" : " (pendiente)"}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      {note && (
        <p className="mt-2 border-t border-slate-600 pt-2 text-slate-100">
          {note}
        </p>
      )}
    </>
  );
}
