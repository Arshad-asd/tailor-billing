import { useRef } from 'react';
import { Printer } from 'lucide-react';
import TestInvoiceComponent from '../../components/print-invoices/test-invoice';

export default function InvoicePage() {
  const invoiceRef = useRef(null);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to print the invoice');
      return;
    }

    // Get the invoice content
    const invoiceElement = invoiceRef.current;
    if (!invoiceElement) return;
    
    // Find the inner div with the actual invoice content (the white bg div)
    // The structure is: outer div (bg-gray-100) > inner div (bg-white with invoice)
    const outerDiv = invoiceElement.querySelector('div');
    const innerInvoiceDiv = outerDiv?.querySelector('div.bg-white') || outerDiv?.querySelector('div');
    
    if (!innerInvoiceDiv) {
      alert('Invoice content not found');
      return;
    }
    
    // Get the HTML content
    const invoiceContent = innerInvoiceDiv.innerHTML;
    
    // Write the content to the print window with styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice Print</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page {
                margin: 10mm;
                size: A4;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              html {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: system-ui, -apple-system, sans-serif;
            }
            html {
              margin: 0;
              padding: 0;
              background: white;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div style="background: white; padding: 10px; margin: 0; width: 100%;">
            ${invoiceContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  setTimeout(function() {
                    window.close();
                  }, 100);
                };
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Print Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Printer className="w-5 h-5" />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* Invoice Content */}
      <div ref={invoiceRef}>
        <TestInvoiceComponent />
      </div>
    </div>
  );
}

