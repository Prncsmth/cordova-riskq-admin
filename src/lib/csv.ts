// A cell starting with =, +, -, or @ is read as a formula by Excel/Sheets
// (CSV/formula injection) -- since exported rows include citizen-controlled
// free text (reporter names, incident location labels), prefix a single
// quote to force it to be read as plain text. Both apps treat a leading
// quote used this way as a text marker and don't display it.
const RISKY_FORMULA_PREFIX = /^[=+\-@]/;

function escapeCsvValue(value: string | number): string {
  let str = String(value);
  if (RISKY_FORMULA_PREFIX.test(str)) {
    str = `'${str}`;
  }
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(","));
  const csv = lines.join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
