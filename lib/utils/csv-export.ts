export interface CSVExportOptions {
  filename: string
  headers: string[]
  rows: (string | number)[][]
}

function escapeCSVField(field: any): string {
  const str = String(field)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCSV(options: CSVExportOptions): void {
  const { filename, headers, rows } = options

  const csvContent = [headers, ...rows]
    .map(r => r.map(escapeCSVField).join(','))
    .join('\r\n')

  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csvContent
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

export function formatRupiah(amount: number): string {
  return amount.toLocaleString('id-ID')
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
