/**
 * Generates minimal, valid placeholder PDFs for local development.
 * Replace private/guides/bali-tennis-escape-guide.pdf with the real guide
 * (or upload it to the Supabase private bucket) before launch.
 */
import fs from "node:fs";
import path from "node:path";

function pdf(lines: string[]): Buffer {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const content = ["BT", "/F1 26 Tf", "72 760 Td", `(${esc(lines[0])}) Tj`, "/F1 12 Tf", ...lines.slice(1).flatMap((l) => ["0 -24 Td", `(${esc(l)}) Tj`]), "ET"].join("\n");
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

const dir = path.join(process.cwd(), "private", "guides");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "bali-tennis-escape-guide.pdf"), pdf([
  "COURTSCAPE - Bali Tennis Escape Guide",
  "PLACEHOLDER FILE - the final guide has not been produced yet.",
  "Replace this file (or upload to the Supabase private bucket) before launch.",
]));
fs.writeFileSync(path.join(dir, "test-mode-sample.pdf"), pdf([
  "COURTSCAPE - TEST MODE SAMPLE",
  "This file was delivered by a TEST checkout. No payment was taken.",
  "It is not the paid guide. Real purchases receive the full guide.",
]));
console.log("Wrote placeholder PDFs to", dir);
