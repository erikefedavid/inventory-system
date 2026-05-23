'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Upload, X, Check, FileSpreadsheet, AlertTriangle, HelpCircle } from 'lucide-react';

interface CSVImportProps {
  onClose: () => void;
}

interface ParsedProduct {
  name: string;
  sku?: string;
  categoryName: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  description?: string;
  reorderPoint?: number;
}

interface RowError {
  row: number;
  errors: string[];
}

export function CSVImport({ onClose }: CSVImportProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedProduct[]>([]);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setRowErrors([]);
    setParsedItems([]);
    setSuccess(false);

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file (.csv)');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('File is empty');

        // Split text by lines, handling \r\n
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length <= 1) {
          setError('CSV must contain a header row and at least one product row');
          return;
        }

        // Header mapping
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
        const nameIdx = headers.indexOf('name');
        const skuIdx = headers.indexOf('sku');
        const categoryIdx = headers.indexOf('category');
        const unitIdx = headers.indexOf('unit');
        const costIdx = headers.indexOf('cost price') !== -1 ? headers.indexOf('cost price') : headers.indexOf('cost');
        const sellingIdx = headers.indexOf('selling price') !== -1 ? headers.indexOf('selling price') : headers.indexOf('selling');
        const descIdx = headers.indexOf('description');
        const reorderIdx = headers.indexOf('reorder point') !== -1 ? headers.indexOf('reorder point') : headers.indexOf('reorder');

        if (nameIdx === -1 || categoryIdx === -1 || unitIdx === -1 || costIdx === -1 || sellingIdx === -1) {
          setError('CSV headers are missing critical columns. Required columns: Name, Category, Unit, Cost Price, Selling Price');
          return;
        }

        const items: ParsedProduct[] = [];
        const errors: RowError[] = [];

        // Parse each row (1-indexed for sheets row number)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          
          // Split by comma but respect double quotes (standard CSV escaping)
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          const fields = matches.map((f) => f.trim().replace(/^"|"$/g, ''));

          if (fields.length < 5) continue; // Skip blank rows

          const rowNum = i + 1;
          const rowErrs: string[] = [];

          const name = fields[nameIdx];
          const sku = skuIdx !== -1 ? fields[skuIdx] : undefined;
          const categoryName = fields[categoryIdx];
          const unit = fields[unitIdx];
          const costStr = fields[costIdx];
          const sellingStr = fields[sellingIdx];
          const description = descIdx !== -1 ? fields[descIdx] : '';
          const reorderStr = reorderIdx !== -1 ? fields[reorderIdx] : '10';

          if (!name) rowErrs.push('Missing product name');
          if (!categoryName) rowErrs.push('Missing category');
          if (!unit) rowErrs.push('Missing unit');

          const costPrice = parseFloat(costStr);
          if (isNaN(costPrice) || costPrice < 0) {
            rowErrs.push(`Invalid cost price: "${costStr}" (must be positive number)`);
          }

          const sellingPrice = parseFloat(sellingStr);
          if (isNaN(sellingPrice) || sellingPrice < 0) {
            rowErrs.push(`Invalid selling price: "${sellingStr}" (must be positive number)`);
          }

          const reorderPoint = parseInt(reorderStr);
          if (isNaN(reorderPoint) || reorderPoint < 0) {
            rowErrs.push(`Invalid reorder point: "${reorderStr}"`);
          }

          if (rowErrs.length > 0) {
            errors.push({ row: rowNum, errors: rowErrs });
          } else {
            items.push({
              name,
              sku: sku || undefined,
              categoryName,
              unit,
              costPrice,
              sellingPrice,
              description: description || undefined,
              reorderPoint: isNaN(reorderPoint) ? undefined : reorderPoint,
            });
          }
        }

        setRowErrors(errors);
        setParsedItems(items);
      } catch (err: unknown) {
        setError('Failed to parse CSV file structure.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (parsedItems.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: parsedItems }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to import products');
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="text-accent-blue" size={24} />
            <div>
              <h2 className="text-lg font-bold text-text-primary">Bulk CSV Product Import</h2>
              <p className="text-xs text-text-secondary">Upload product directories in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-slate-100 hover:text-text-primary transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="rounded-full bg-success-green/10 p-4 text-success-green animate-bounce">
                <Check size={36} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Import Successful!</h3>
              <p className="text-sm text-text-secondary">
                {parsedItems.length} products loaded into database. Refreshing list...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-danger-red/35 bg-red-50 p-4 text-sm text-danger-red">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-border hover:border-accent-blue transition rounded-xl p-8 text-center bg-slate-50/50 flex flex-col items-center justify-center relative cursor-pointer group">
                <Upload size={32} className="text-slate-400 group-hover:text-accent-blue transition mb-2" />
                <p className="text-sm font-semibold text-text-primary">
                  {file ? file.name : 'Click to select CSV File'}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Supports .csv directories up to 2MB.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* CSV Headers Template guide */}
              {!file && (
                <div className="rounded-xl border border-border p-4 bg-slate-50/30 space-y-2">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-accent-blue" />
                    CSV File Template Guide
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Ensure your CSV starts with a **Header Row** matching the exact names below. Capitalization is ignored:
                  </p>
                  <div className="overflow-x-auto rounded border border-border bg-white p-2.5 font-mono text-[10px] text-text-primary">
                    Name, SKU, Category, Unit, Cost Price, Selling Price, Description, Reorder Point
                  </div>
                </div>
              )}

              {/* Row validation errors warning list */}
              {rowErrors.length > 0 && (
                <div className="rounded-xl border border-warning-orange/30 bg-orange-50/50 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-warning-orange uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle size={15} />
                    CSV Row Validation Conflicts ({rowErrors.length})
                  </h4>
                  <ul className="text-xs space-y-1.5 max-h-36 overflow-y-auto text-text-secondary list-disc pl-4">
                    {rowErrors.map((err) => (
                      <li key={err.row}>
                        <span className="font-bold text-text-primary">Row {err.row}:</span> {err.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parser Previews */}
              {parsedItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-text-primary flex items-center justify-between">
                    <span>Import Preview (Showing first 5 of {parsedItems.length} items)</span>
                    <span className="text-xs text-success-green font-semibold flex items-center gap-1">
                      <Check size={14} /> Ready to load
                    </span>
                  </h3>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-border text-text-secondary font-semibold">
                        <tr>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">SKU</th>
                          <th className="px-4 py-2">Category</th>
                          <th className="px-4 py-2">Unit</th>
                          <th className="px-4 py-2 text-right">Cost</th>
                          <th className="px-4 py-2 text-right">Selling</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedItems.slice(0, 5).map((item, idx) => (
                          <tr key={idx} className="border-b border-border last:border-b-0">
                            <td className="px-4 py-2.5 font-semibold text-text-primary">{item.name}</td>
                            <td className="px-4 py-2.5 text-text-secondary font-mono">{item.sku || 'Auto'}</td>
                            <td className="px-4 py-2.5">{item.categoryName}</td>
                            <td className="px-4 py-2.5 text-text-secondary">{item.unit}</td>
                            <td className="px-4 py-2.5 text-right">₦{item.costPrice.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-semibold">₦{item.sellingPrice.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Actions */}
        {!success && (
          <div className="border-t border-border p-4 bg-slate-50/50 flex justify-end gap-2.5">
            <Button variant="ghost" disabled={loading} onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              disabled={loading || parsedItems.length === 0}
              onClick={handleImportConfirm}
              className="text-xs bg-accent-blue text-white"
            >
              {loading ? 'Importing Products...' : `Confirm Import (${parsedItems.length} items)`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
