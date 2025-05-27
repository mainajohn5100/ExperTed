'use client';

import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';

export function PrintDownloadActions() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownload = () => {
    // Placeholder for download functionality
    alert('Download functionality to be implemented.');
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <Button variant="outline" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
