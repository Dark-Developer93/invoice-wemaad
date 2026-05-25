import { format } from "date-fns";

export const formatDate = {
  long: (d: Date | string) => format(new Date(d), "MMMM d, yyyy"),
  short: (d: Date | string) => format(new Date(d), "MMM d, yyyy"),
  monthYear: (d: Date | string) => format(new Date(d), "MMM yyyy"),
  full: (d: Date | string) => format(new Date(d), "MMM d, yyyy 'at' h:mm a"),
  picker: (d: Date | string) => format(new Date(d), "PPP"),
};
