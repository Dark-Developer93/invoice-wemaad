import { useState } from "react";

// For dialogs rendered once per table row: returns false until `open` first
// becomes true, then stays true. Rendering `{mounted && <Dialog open={open} />}`
// skips building N closed dialogs on every server render/hydration, while
// keeping the dialog mounted after first use so its close animation plays.
export function useMountOnFirstOpen(open: boolean): boolean {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  return mounted || open;
}
