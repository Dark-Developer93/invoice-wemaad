/**
 * Opens a dialog/popover after the dropdown menu that triggered it has
 * finished closing. Opening it while the dropdown's menu/focus layer is
 * still active causes focus and keyboard conflicts inside the dialog
 * (e.g. inputs losing keystrokes or selecting their text on click).
 */
export function openAfterMenuCloses(setOpen: (open: boolean) => void) {
  setTimeout(() => setOpen(true), 0);
}
