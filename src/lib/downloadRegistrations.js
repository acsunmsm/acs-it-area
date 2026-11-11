export async function downloadRegistrations(records, title) {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const headings = Object.keys(records[0]);
  const rows = [headings, ...records.map(record => headings.map(key => record[key]))];
  const cells = rows.map(row => row.map(value => ({ type: String, value: String(value ?? '') })));
  const name = (title || 'desconocido').replace(/[^\p{L}\p{N}_.-]+/gu, '_');
  await writeExcelFile(cells).toFile('registros_evento_' + name + '.xlsx');
}
