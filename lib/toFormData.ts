export function toFormData(data: Record<string, unknown>): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      fd.append(key, String(value));
    }
  });
  return fd;
}
