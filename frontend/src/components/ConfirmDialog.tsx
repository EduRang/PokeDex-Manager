import { useEffect, useRef } from "react";
import { Button } from "./Button";
import { Panel } from "./Panel";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  loading = false,
  loadingLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm overflow-visible bg-transparent p-0 backdrop:bg-dex-frame-dark/60"
    >
      <Panel
        contentClassName="p-5"
        header={<h2 id="confirm-dialog-title">{title}</h2>}
      >
        <p>{message}</p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading && loadingLabel ? loadingLabel : confirmLabel}
          </Button>
        </div>
      </Panel>
    </dialog>
  );
}
