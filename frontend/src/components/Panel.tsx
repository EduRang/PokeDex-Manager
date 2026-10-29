import type { HTMLAttributes, ReactNode } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  contentClassName?: string;
}

// Marco oscuro con un recuadro celeste dentro
export function Panel({
  header,
  className = "",
  contentClassName = "",
  children,
  ...props
}: PanelProps) {
  return (
    <div
      className={`rounded-md border-2 border-dex-frame-dark bg-dex-frame p-1.5 shadow-[0_4px_0_0_rgb(0_0_0/0.2)] ${className}`}
      {...props}
    >
      {header && (
        <div className="px-2 pt-0.5 pb-1.5 text-white pixel-shadow-dark">
          {header}
        </div>
      )}
      <div
        className={`rounded-sm border-2 border-dex-edge bg-dex-panel ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
