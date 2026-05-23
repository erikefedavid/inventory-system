'use client';

import Link from 'next/link';
import { useState, useEffect, startTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import {
  FileText,
  BarChart3,
  Calendar,
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  Download,
  Search,
  RefreshCw,
} from 'lucide-react';

interface CategoryValuation {
  categoryName: string;
  totalItems: number;
  totalCostValue: number;
  totalSellingValue: number;
}

interface ValuationReport {
  categories: CategoryValuation[];
  summary: {
    totalItemsCount: number;
    grandCostValue: number;
    grandSellingValue: number;
  };
}

interface ProductItem {
  _id: string;
  name: string;
  sku: string;
}

interface LowStockItem {
  _id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  unit: string;
}

interface StockMovement {
  _id: string;
  product?: {
    name: string;
    sku: string;
    unit: string;
  };
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  performedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  reason?: string;
  notes?: string;
}

interface ReportCenterProps {
  products: ProductItem[];
  initialValuation: ValuationReport;
  initialLowStock: LowStockItem[];
}

const COLORS = ['#1A3A6B', '#2563EB', '#16A34A', '#D97706', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4'];

export function ReportCenter({ products, initialValuation, initialLowStock }: ReportCenterProps) {
  const [activeTab, setActiveTab] = useState<'valuation' | 'movement' | 'lowstock'>('valuation');

  // Stock Movement Ledger Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('');
  
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [error, setError] = useState('');

  // Fetch stock movements
  const fetchMovements = async () => {
    setLoadingMovements(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      if (selectedProductId) params.append('productId', selectedProductId);
      if (movementType) params.append('type', movementType);

      const res = await fetch(`/api/v1/reports/stock-movement?${params.toString()}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch stock movements');
      setMovements(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'movement') {
      fetchMovements();
    }
  }, [activeTab]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovements();
  };

  const formatNaira = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);

  // CSV Exporter
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVExport = () => {
    if (activeTab === 'valuation') {
      const headers = ['Category Name', 'Total Items', 'Cost Value (NGN)', 'Retail Value (NGN)'];
      const rows = initialValuation.categories.map((c) => [
        c.categoryName,
        c.totalItems,
        c.totalCostValue,
        c.totalSellingValue,
      ]);
      exportToCSV('Inventory_Valuation_Report', headers, rows);
    } else if (activeTab === 'movement') {
      const headers = ['Date', 'Product Name', 'SKU', 'Type', 'Quantity', 'Prev Stock', 'New Stock', 'Performed By', 'Reason'];
      const rows = movements.map((m) => [
        new Date(m.createdAt).toLocaleString(),
        m.product?.name ?? '—',
        m.product?.sku ?? '—',
        m.type,
        m.quantity,
        m.previousStock,
        m.newStock,
        m.performedBy.name,
        m.reason || m.notes || '—',
      ]);
      exportToCSV('Stock_Movement_Report', headers, rows);
    } else {
      const headers = ['Product Name', 'SKU', 'Current Stock', 'Reorder Point', 'Unit', 'Deficit'];
      const rows = initialLowStock.map((item) => [
        item.name,
        item.sku,
        item.currentStock,
        item.reorderPoint,
        item.unit,
        item.reorderPoint - item.currentStock,
      ]);
      exportToCSV('Low_Stock_Report', headers, rows);
    }
  };

  // PDF Exporter
  const handlePDFExport = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header Band
    doc.setFillColor(26, 58, 107); // Deep Blue
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('StockPilot Report Center', 15, 15);
    
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.text('Official Business Inventory Analytics Ledger', 15, 22);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 145, 15);
    doc.text(`Scope: SME Inventory Operations`, 145, 21);

    doc.setTextColor(15, 23, 42); // slate-900

    if (activeTab === 'valuation') {
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('INVENTORY VALUATION SUMMARY REPORT', 15, 45);

      doc.setFontSize(9.5);
      doc.setFont('Helvetica', 'normal');
      doc.text([
        `Total Tracked Stock Units: ${initialValuation.summary.totalItemsCount.toLocaleString()}`,
        `Cumulative Asset Cost Value: NGN ${initialValuation.summary.grandCostValue.toLocaleString()}`,
        `Projected Retail Asset Value: NGN ${initialValuation.summary.grandSellingValue.toLocaleString()}`,
        `Estimated Profit Margin: NGN ${(initialValuation.summary.grandSellingValue - initialValuation.summary.grandCostValue).toLocaleString()}`,
      ], 15, 52);

      const tableData = initialValuation.categories.map((c, i) => [
        i + 1,
        c.categoryName,
        c.totalItems.toLocaleString(),
        `NGN ${c.totalCostValue.toLocaleString()}`,
        `NGN ${c.totalSellingValue.toLocaleString()}`,
        `${c.totalCostValue > 0 ? (((c.totalSellingValue - c.totalCostValue) / c.totalCostValue) * 100).toFixed(1) : 0}%`,
      ]);

      (doc as any).autoTable({
        startY: 75,
        head: [['#', 'Category Name', 'Total Stock', 'Cost Valuation', 'Retail Valuation', 'Estimated Markup']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 58, 107] },
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'center' },
        },
      });

    } else if (activeTab === 'movement') {
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('STOCK MOVEMENT TRANSACTION LEDGER', 15, 45);

      doc.setFontSize(9.5);
      doc.setFont('Helvetica', 'normal');
      doc.text([
        `Report Window: ${dateFrom || 'Inception'} to ${dateTo || 'Present'}`,
        `Movement Type Filter: ${movementType || 'All Transactions'}`,
        `Total Logged Transactions: ${movements.length}`,
      ], 15, 52);

      const tableData = movements.map((m, i) => [
        i + 1,
        new Date(m.createdAt).toLocaleDateString() + ' ' + new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        m.product?.name ?? '—',
        m.type.toUpperCase().replace('_', ' '),
        m.quantity.toLocaleString(),
        `${m.previousStock} -> ${m.newStock}`,
        m.performedBy.name,
      ]);

      (doc as any).autoTable({
        startY: 70,
        head: [['#', 'Timestamp', 'Product Name', 'Action Type', 'Qty', 'Stock Shift', 'Performed By']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [26, 58, 107] },
        styles: { fontSize: 8 },
        columnStyles: {
          4: { halign: 'center' },
          5: { halign: 'center' },
        },
      });

    } else {
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text('CRITICAL LOW STOCK & REORDER REPORT', 15, 45);

      doc.setFontSize(9.5);
      doc.setFont('Helvetica', 'normal');
      doc.text([
        `Total Deficit Items Identified: ${initialLowStock.length} items`,
        'Urgent Notice: Reorder operations are required for the following items to avert stockout situations.',
      ], 15, 52);

      const tableData = initialLowStock.map((item, i) => [
        i + 1,
        item.name,
        item.sku,
        `${item.currentStock} ${item.unit}`,
        `${item.reorderPoint} ${item.unit}`,
        `${item.reorderPoint - item.currentStock} ${item.unit}`,
      ]);

      (doc as any).autoTable({
        startY: 65,
        head: [['#', 'Product Name', 'SKU Code', 'Current Stock', 'Reorder Point', 'Stock Deficit']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] }, // Red for alert low stock
        columnStyles: {
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center', textColor: [220, 38, 38] },
        },
      });
    }

    // Branded Footer
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.text('Generated dynamically from StockPilot analytical middleware. Confidiential. Lead City University.', 15, 282);
    
    doc.save(`StockPilot_${activeTab.toUpperCase()}_Report.pdf`);
  };

  // Pie chart data prep
  const pieData = initialValuation.categories
    .filter((c) => c.totalCostValue > 0)
    .map((c) => ({
      name: c.categoryName,
      value: c.totalCostValue,
    }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Report Center</h1>
          <p className="text-sm text-text-secondary">Run financial asset valuation, ledger audits, and check alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleCSVExport} className="flex items-center gap-1.5 text-xs">
            <Download size={14} />
            Export CSV
          </Button>
          <Button onClick={handlePDFExport} className="flex items-center gap-1.5 text-xs bg-accent-blue text-white">
            <Download size={14} />
            Print Report PDF
          </Button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => startTransition(() => setActiveTab('valuation'))}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'valuation'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Layers size={16} />
          Inventory Valuation
        </button>
        <button
          onClick={() => startTransition(() => setActiveTab('movement'))}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'movement'
              ? 'border-accent-blue text-accent-blue'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <ArrowRightLeft size={16} />
          Stock Movements Ledger
        </button>
        <button
          onClick={() => startTransition(() => setActiveTab('lowstock'))}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'lowstock'
              ? 'border-danger-red text-danger-red'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <AlertTriangle size={16} />
          Low Stock Alert
          {initialLowStock.length > 0 && (
            <span className="rounded-full bg-danger-red text-white font-bold px-1.5 py-0.5 text-[10px]">
              {initialLowStock.length}
            </span>
          )}
        </button>
      </div>

      {/* Valuation Tab View */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="hover-premium">
              <p className="text-xs font-semibold text-text-secondary uppercase">Stock Count (Units)</p>
              <p className="text-2xl font-bold mt-1 text-text-primary">
                {initialValuation.summary.totalItemsCount.toLocaleString()}
              </p>
            </Card>
            <Card className="hover-premium">
              <p className="text-xs font-semibold text-text-secondary uppercase">Asset Cost Value</p>
              <p className="text-2xl font-bold mt-1 text-primary-blue">
                {formatNaira(initialValuation.summary.grandCostValue)}
              </p>
            </Card>
            <Card className="hover-premium">
              <p className="text-xs font-semibold text-text-secondary uppercase">Asset Selling Value</p>
              <p className="text-2xl font-bold mt-1 text-success-green">
                {formatNaira(initialValuation.summary.grandSellingValue)}
              </p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Valuation Table */}
            <Card className="lg:col-span-2 overflow-hidden">
              <h3 className="font-semibold text-sm text-text-primary mb-4">Valuation Grouped by Category</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-text-secondary border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold text-center">Items Stocked</th>
                      <th className="px-4 py-3 font-semibold text-right">Cost Value</th>
                      <th className="px-4 py-3 font-semibold text-right">Selling Value</th>
                      <th className="px-4 py-3 font-semibold text-center">Profit markup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialValuation.categories.map((c) => (
                      <tr key={c.categoryName} className="border-b border-border hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-text-primary">{c.categoryName}</td>
                        <td className="px-4 py-3 text-center">{c.totalItems.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{formatNaira(c.totalCostValue)}</td>
                        <td className="px-4 py-3 text-right text-success-green font-semibold">
                          {formatNaira(c.totalSellingValue)}
                        </td>
                        <td className="px-4 py-3 text-center text-text-secondary font-medium">
                          {c.totalCostValue > 0
                            ? (((c.totalSellingValue - c.totalCostValue) / c.totalCostValue) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recharts Pie Chart */}
            <Card className="flex flex-col justify-between items-center min-h-[300px]">
              <h3 className="w-full text-left font-semibold text-sm text-text-primary">Category Asset Share</h3>
              {pieData.length > 0 ? (
                <div className="w-full h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNaira(Number(value))} />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-text-secondary text-xs">
                  <BarChart3 size={28} className="mb-2 opacity-35" />
                  No valuation data available.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Stock Movement Ledger View */}
      {activeTab === 'movement' && (
        <div className="space-y-4">
          {/* Movement Filters Form */}
          <Card className="bg-slate-50/50">
            <form onSubmit={handleFilterSubmit} className="grid gap-4 sm:grid-cols-5 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">From Date</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">To Date</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent-blue focus:outline-none"
                >
                  <option value="">All Products</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Type</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent-blue focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="stock_in">Stock-In</option>
                  <option value="stock_out">Stock-Out</option>
                  <option value="adjustment">Adjustments</option>
                </select>
              </div>
              <div>
                <Button type="submit" disabled={loadingMovements} className="w-full flex items-center justify-center gap-2">
                  {loadingMovements ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                  Search Ledger
                </Button>
              </div>
            </form>
          </Card>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-danger-red/35 bg-red-50 p-4 text-sm text-danger-red">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Ledger Results */}
          <Card className="overflow-hidden">
            <h3 className="font-semibold text-sm text-text-primary p-4 border-b border-border bg-white flex items-center justify-between">
              <span>Transaction Movement Ledger</span>
              <span className="text-xs text-text-secondary font-medium">{movements.length} log entries</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-text-secondary border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Shift Type</th>
                    <th className="px-4 py-3 text-center">Shift Qty</th>
                    <th className="px-4 py-3 text-center">Inventory Shift</th>
                    <th className="px-4 py-3">Performed By</th>
                    <th className="px-4 py-3">Reason / Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m._id} className="border-b border-border hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-text-primary">
                        {m.product?.name ?? 'Deleted product'}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{m.product?.sku ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`text-[9px] uppercase font-extrabold rounded px-1.5 py-0.5 border ${
                            m.type === 'stock_in'
                              ? 'bg-success-green/10 text-success-green border-success-green/20'
                              : m.type === 'stock_out'
                              ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                              : 'bg-warning-orange/10 text-warning-orange border-warning-orange/20'
                          }`}
                        >
                          {m.type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{m.quantity} {m.product?.unit}</td>
                      <td className="px-4 py-3 text-center text-text-secondary text-xs">
                        {m.previousStock} → {m.newStock}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-text-primary">{m.performedBy.name}</p>
                        <p className="text-[10px] text-text-secondary leading-none">{m.performedBy.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary italic max-w-[200px] truncate">
                        {m.reason || m.notes || '—'}
                      </td>
                    </tr>
                  ))}
                  {!movements.length && !loadingMovements && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-text-secondary">
                        No transaction logs found for this search. Adjust filters and try searching again.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Low Stock Alert View */}
      {activeTab === 'lowstock' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-orange-50 border border-warning-orange/30 p-4 text-warning-orange flex items-center gap-3">
            <AlertTriangle size={24} className="glow-warning rounded-full" />
            <div>
              <h3 className="font-bold text-sm">Low Stock Warnings</h3>
              <p className="text-xs opacity-90">
                The items below have fallen to or below their critical reorder points. Immediate procurement action is advised.
              </p>
            </div>
          </div>

          <Card className="overflow-hidden">
            <h3 className="font-semibold text-sm text-text-primary p-4 border-b border-border bg-white">
              Identified Depleted Inventory ({initialLowStock.length} items)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-text-secondary border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product Name</th>
                    <th className="px-4 py-3 font-semibold">SKU Code</th>
                    <th className="px-4 py-3 font-semibold text-center">Current Level</th>
                    <th className="px-4 py-3 font-semibold text-center">Reorder Threshold</th>
                    <th className="px-4 py-3 font-semibold text-center">Procurement Deficit</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initialLowStock.map((item) => (
                    <tr key={item._id} className="border-b border-border hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-text-primary">{item.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{item.sku}</td>
                      <td className="px-4 py-3 text-center text-danger-red font-bold">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-center text-text-secondary">
                        {item.reorderPoint} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className="bg-danger-red/10 text-danger-red border-danger-red/20 border text-xs px-2 py-0.5 rounded font-semibold">
                          Need {item.reorderPoint - item.currentStock} {item.unit}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/purchase-orders/new">
                          <Button className="text-xs py-1 px-3 bg-accent-blue text-white">
                            Procure Now
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!initialLowStock.length && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-success-green font-semibold">
                        All products have healthy inventory levels! Zero stock alerts active.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
