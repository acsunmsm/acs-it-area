import { copyFile, mkdir } from 'node:fs/promises';

const dest = new URL('../public/horario/vendor/', import.meta.url);
await mkdir(dest, { recursive: true });
for (const [source, name] of [
  ['pdfjs-dist/build/pdf.min.mjs', 'pdf.min.mjs'],
  ['pdfjs-dist/build/pdf.worker.min.mjs', 'pdf.worker.min.mjs'],
  ['dompurify/dist/purify.min.js', 'purify.min.js']
]) {
  await copyFile(new URL('../node_modules/' + source, import.meta.url), new URL(name, dest));
}
