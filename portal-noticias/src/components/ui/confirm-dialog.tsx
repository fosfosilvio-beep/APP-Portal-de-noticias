"use client";

import { useRef, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

let globalConfirm: ConfirmFn | null = null;

export function useConfirm(): ConfirmFn {
  return useCallback(
    (options?: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        if (globalConfirm) {
          // Handled by ConfirmDialog provider
        }
        // Fallback (should not happen if ConfirmDialogProvider is in the tree)
        resolve(window.confirm(options?.description ?? "Tem certeza?"));
      }),
    []
  );
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolve: (v: boolean) => void;
}

/**
 * Place <ConfirmDialogProvider /> once in the admin layout.
 * Then call useConfirm() anywhere inside.
 */
export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm: ConfirmFn = useCallback((options = {}) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  // Register globally so useConfirm() can reach it
  globalConfirm = confirm;

  const handleResponse = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  return (
    <>
      {children}
      {state && (
        <AlertDialog open={state.open} onOpenChange={(o) => !o && handleResponse(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {state.options.title ?? "Tem certeza?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {state.options.description ?? "Esta ação não pode ser desfeita."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleResponse(false)}>
                {state.options.cancelLabel ?? "Cancelar"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleResponse(true)}
                className={
                  state.options.destructive
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    : ""
                }
              >
                {state.options.confirmLabel ?? "Confirmar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
