import { useState } from "react";

/**
 * Lets a dialog/popover support both controlled (`open`/`onOpenChange` passed
 * by a parent) and uncontrolled (managed internally) usage with one API.
 */
export function useControllableOpenState(
  controlledOpen?: boolean,
  onOpenChange?: (open: boolean) => void
): [boolean, (open: boolean) => void] {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  return [open, setOpen];
}
