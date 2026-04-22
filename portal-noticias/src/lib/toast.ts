import { toast as sonnerToast } from "sonner";

/**
 * Standardised toast wrappers.
 * Always use these instead of calling sonner directly.
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, {
      description: description ?? "Tente novamente ou contacte o suporte.",
    }),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    sonnerToast.promise(promise, messages),
};
