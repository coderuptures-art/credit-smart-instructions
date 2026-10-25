/** RFC 4180-style CSV with correct quoting/escaping. */
export function toCsv(headers: string[], rows: (string | number | undefined)[][]): string {
  const esc = (v: string | number | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

/** Triggers a client-side download. Only call from browser event handlers. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
