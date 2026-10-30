import { forwardRef } from "react";
import {
  closeSnackbar,
  SnackbarContent,
  type CustomContentProps,
} from "notistack";

export const ErrorToast = forwardRef<HTMLDivElement, CustomContentProps>(
  function ErrorToast({ id, message }, ref) {
    return (
      <SnackbarContent
        ref={ref}
        role="alert"
        className="w-full max-w-sm overflow-hidden rounded-md border-2 border-dex-frame-dark bg-white shadow-[0_3px_0_0_rgb(0_0_0/0.2)]"
      >
        <div className="flex w-full items-stretch">
          <span
            aria-hidden="true"
            className="flex w-9 shrink-0 items-center justify-center bg-dex-error text-dex-lg text-white pixel-shadow-accent"
          >
            !
          </span>
          <p className="flex-1 px-3 py-2 text-dex-text">{message}</p>
          <button
            type="button"
            onClick={() => closeSnackbar(id)}
            aria-label="Cerrar aviso"
            title="Cerrar aviso"
            className="m-1 flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-sm text-dex-muted transition hover:bg-dex-cell hover:text-dex-text focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-dex-accent active:bg-dex-panel"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </SnackbarContent>
    );
  },
);
