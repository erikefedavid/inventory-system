'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CSVImport } from '@/components/shared/CSVImport';
import { Plus, Upload } from 'lucide-react';

interface InventoryHeaderProps {
  productCount: number;
  canManage: boolean;
  isAdmin: boolean;
}

export function InventoryHeader({ productCount, canManage, isAdmin }: InventoryHeaderProps) {
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Inventory</h1>
          <p className="text-sm text-text-secondary">{productCount} active products stocked</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 text-xs text-text-secondary"
            >
              <Upload size={14} />
              Import CSV
            </Button>
          )}
          {canManage && (
            <Link href="/inventory/new">
              <Button className="flex items-center gap-1.5 text-xs bg-accent-blue text-white">
                <Plus size={14} />
                Add Product
              </Button>
            </Link>
          )}
        </div>
      </div>

      {showImportModal && (
        <CSVImport onClose={() => setShowImportModal(false)} />
      )}
    </>
  );
}
