import { useEffect, useRef } from "react";
// Trap keyboard focus only while a modal is open; restore it to the trigger.
export default function useDialog(open, onClose) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const element = ref.current;
    const focusable = () =>
      [
        ...(element?.querySelectorAll(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ) || []),
      ].filter((node) => node.getClientRects().length);
    const timer = setTimeout(() => focusable()[0]?.focus(), 0);
    const keydown = (event) => {
      // An inner camera/lightbox handles its own keyboard interaction.
      const dialogs = [...document.querySelectorAll('[role="dialog"]')];
      if (dialogs.at(-1) !== element) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close.current?.();
      }
      if (event.key === "Tab") {
        const items = focusable();
        if (!items.length) return;
        const first = items[0],
          last = items.at(-1);
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !element.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !element.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", keydown);
      previous?.focus?.();
    };
  }, [open]);
  return ref;
}
