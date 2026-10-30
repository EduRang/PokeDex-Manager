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
      <p className="mb-2 border-b-2 border-dex-edge pb-1.5">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {requirements.map(({ label, isMet }) => {
          const met = isMet(value);
          return (
            <li
              key={label}
              className={`flex items-center gap-2 ${met ? "text-green-700" : "text-dex-muted"}`}
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
        <p className="mt-2 border-t-2 border-dex-edge pt-2 text-dex-muted">
          {note}
        </p>
      )}
    </>
  );
}
