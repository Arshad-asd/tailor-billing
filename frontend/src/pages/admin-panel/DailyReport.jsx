import { useState, useRef } from 'react';
import { Calendar, DollarSign, TrendingUp, Users, Package, Clock, BarChart3, Download, Printer, ArrowUp, ArrowDown, Plus, Minus } from 'lucide-react';

export default function DailyReport() {
  const [selectedDate, setSelectedDate] = useState('2025-07-13');
  const dailyReportRef = useRef(null);
  const monthlyDataRef = useRef(null);

  // Daily Cash Flow Data
  const dailyCashFlow = {
    date: '13-07-2025 Sunday',
    cashIn: {
      advanceOnOrder: 0.00,
      delivery: 300.00,
      cashOnSales: 81.00,
      receipt: 0.00,
      otherCashIn: 0.00,
      total: 381.00
    },
    cashOut: {
      cashOutExp: 0.00,
      total: 0.00
    },
    netCash: 381.00,
    summary: {
      totalJobOrder: 200.00,
      totalSales: 81.00,
      totalBusiness: 281.00
    }
  };

  // Historical Monthly Data - Matching image values
  const monthlyData2025 = [
    { month: 'January', advance: 4865.00, delivery: 5565.00, sales: 5551.00, receipt: 0.00, total: 15981.00 },
    { month: 'February', advance: 7590.00, delivery: 7300.00, sales: 7155.00, receipt: 470.00, total: 22515.00 },
    { month: 'March', advance: 15780.00, delivery: 28245.00, sales: 29947.00, receipt: 725.00, total: 74697.00 },
    { month: 'April', advance: 7230.00, delivery: 9670.00, sales: 9179.00, receipt: 170.00, total: 26249.00 },
    { month: 'May', advance: 9495.00, delivery: 13215.00, sales: 14438.00, receipt: 100.00, total: 37248.00 },
    { month: 'June', advance: 3140.00, delivery: 10625.00, sales: 10607.00, receipt: 0.00, total: 24372.00 },
    { month: 'July', advance: 2530.00, delivery: 3810.00, sales: 4755.00, receipt: 50.00, total: 11145.00 },
    { month: 'August', advance: 0.00, delivery: 0.00, sales: 0.00, receipt: 0.00, total: 0.00 },
    { month: 'September', advance: 0.00, delivery: 0.00, sales: 0.00, receipt: 0.00, total: 0.00 },
    { month: 'October', advance: 0.00, delivery: 0.00, sales: 40.00, receipt: 0.00, total: 40.00 },
    { month: 'November', advance: 0.00, delivery: 0.00, sales: 0.00, receipt: 0.00, total: 0.00 },
    { month: 'December', advance: 0.00, delivery: 0.00, sales: 0.00, receipt: 0.00, total: 0.00 }
  ];

  const monthlyData2024 = [
    { month: 'January', advance: 5655.00, delivery: 8340.00, sales: 6761.00, receipt: 425.00, total: 21181.00 },
    { month: 'February', advance: 13090.00, delivery: 9469.00, sales: 9807.00, receipt: 100.00, total: 32466.00 },
    { month: 'March', advance: 30800.00, delivery: 18630.00, sales: 18925.00, receipt: 665.00, total: 69020.00 },
    { month: 'April', advance: 5600.00, delivery: 27600.00, sales: 30962.00, receipt: 565.00, total: 64727.00 },
    { month: 'May', advance: 17200.00, delivery: 13405.00, sales: 13904.00, receipt: 735.00, total: 45244.00 },
    { month: 'June', advance: 9608.00, delivery: 20330.00, sales: 18704.00, receipt: 785.00, total: 49427.00 },
    { month: 'July', advance: 5310.00, delivery: 7120.00, sales: 7742.00, receipt: 40.00, total: 20212.00 },
    { month: 'August', advance: 3965.00, delivery: 7940.00, sales: 8359.00, receipt: 100.00, total: 20364.00 },
    { month: 'September', advance: 2865.00, delivery: 6195.00, sales: 5048.00, receipt: 100.00, total: 14208.00 },
    { month: 'October', advance: 5660.00, delivery: 5480.00, sales: 4037.00, receipt: 100.00, total: 15277.00 },
    { month: 'November', advance: 4655.00, delivery: 7930.00, sales: 4306.00, receipt: 0.00, total: 16891.00 },
    { month: 'December', advance: 5525.00, delivery: 6725.00, sales: 6344.00, receipt: 0.00, total: 18594.00 }
  ];

  const total2025 = monthlyData2025.reduce((acc, month) => ({
    advance: acc.advance + month.advance,
    delivery: acc.delivery + month.delivery,
    sales: acc.sales + month.sales,
    receipt: acc.receipt + month.receipt,
    total: acc.total + month.total
  }), { advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 });

  const total2024 = monthlyData2024.reduce((acc, month) => ({
    advance: acc.advance + month.advance,
    delivery: acc.delivery + month.delivery,
    sales: acc.sales + month.sales,
    receipt: acc.receipt + month.receipt,
    total: acc.total + month.total
  }), { advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 });

  // Print Daily Report function
  const printDailyReport = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Report - ${dailyCashFlow.date}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            .header h1 {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .header p {
              font-size: 10pt;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 10px;
              padding: 5px;
              background-color: #f0f0f0;
            }
            .cash-in {
              margin-bottom: 15px;
            }
            .cash-in-title {
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 10px;
              border-bottom: 1px solid #ddd;
            }
            .item-row.total {
              font-weight: bold;
              background-color: #e3f2fd;
              border: 2px solid #2196f3;
              padding: 8px 10px;
            }
            .summary-section {
              margin-top: 20px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }
            .summary-item {
              padding: 10px;  
              border: 1px solid #ddd;
              text-align: center;
            }
            .summary-item strong {
              display: block;
              margin-bottom: 5px;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Daily Cash IN and OUT</h1>
            <p>Date: ${dailyCashFlow.date}</p>
          </div>
          
          <div class="section">
            <div class="cash-in">
              <div class="cash-in-title">Cash IN</div>
              <div class="item-row">
                <span>Advance on Order</span>
                <span>${dailyCashFlow.cashIn.advanceOnOrder.toFixed(2)}</span>
              </div>
              <div class="item-row">
                <span>Delivery</span>
                <span>${dailyCashFlow.cashIn.delivery.toFixed(2)}</span>
              </div>
              <div class="item-row">
                <span>Cash on Sales</span>
                <span>${dailyCashFlow.cashIn.cashOnSales.toFixed(2)}</span>
              </div>
              <div class="item-row">
                <span>Receipt</span>
                <span>${dailyCashFlow.cashIn.receipt.toFixed(2)}</span>
              </div>
              <div class="item-row total">
                <span>Total Cash IN</span>
                <span>${dailyCashFlow.cashIn.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="section summary-section">
            <div class="section-title">Summary</div>
            <div class="summary-grid">
              <div class="summary-item">
                <strong>Total Job Order</strong>
                <span>${dailyCashFlow.summary.totalJobOrder.toFixed(2)}</span>
              </div>
              <div class="summary-item">
                <strong>Total Sales</strong>
                <span>${dailyCashFlow.summary.totalSales.toFixed(2)}</span>
              </div>
              <div class="summary-item">
                <strong>Total Business</strong>
                <span>${dailyCashFlow.summary.totalBusiness.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Print Monthly Data function
  const printMonthlyData = () => {
    const printWindow = window.open('', '_blank');
    
    const tableRow2025 = monthlyData2025.map(month => `
      <tr>
        <td>${month.month}</td>
        <td style="text-align: right;">${month.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${month.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${month.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${month.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right; font-weight: bold;">${month.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const tableRow2024 = monthlyData2024.map(month => `
      <tr>
        <td>${month.month}</td>
        <td style="text-align: right;">${month.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${month.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${month.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${month.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right; font-weight: bold;">${month.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Data Report</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10pt;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            .header h1 {
              font-size: 16pt;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 10px;
              padding: 5px;
              background-color: #f0f0f0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            th {
              background-color: #e0e0e0;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #000;
              font-size: 9pt;
            }
            th.text-right {
              text-align: right;
            }
            td {
              padding: 6px 8px;
              border: 1px solid #ddd;
              font-size: 9pt;
            }
            .total-row {
              background-color: #e3f2fd;
              font-weight: bold;
              border-top: 2px solid #000;
            }
            .total-row td {
              border: 1px solid #000;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Monthly Data Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">2025 Monthly Data</div>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th class="text-right">Advance</th>
                  <th class="text-right">Delivery</th>
                  <th class="text-right">Sales</th>
                  <th class="text-right">Receipt</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRow2025}
                <tr class="total-row">
                  <td>TOTAL (2025)</td>
                  <td style="text-align: right;">${total2025.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right;">${total2025.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right;">${total2025.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right;">${total2025.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right;">${total2025.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">2024 Monthly Data</div>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th class="text-right">Advance</th>
                  <th class="text-right">Delivery</th>
                  <th class="text-right">Sales</th>
                  <th class="text-right">Receipt</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRow2024}
                <tr class="total-row">
                  <td>TOTAL (2024)</td>
                  <td style="text-align: right;">${total2024.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right;">${total2024.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right;">${total2024.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right;">${total2024.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="text-align: right;">${total2024.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Cash IN and OUT</h1>
          <p className="text-gray-600 dark:text-gray-400">Daily financial summary and cash flow</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Section: Left (Cash IN/OUT) and Right (Monthly Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Daily Cash IN and OUT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Daily Cash IN and OUT</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">(for {dailyCashFlow.date})</p>
            </div>

            {/* Cash IN Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <ArrowUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash IN</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Advance on Order</span>
                  <span className="font-medium text-gray-900 dark:text-white">{dailyCashFlow.cashIn.advanceOnOrder.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Delivery</span>
                  <span className="font-medium text-gray-900 dark:text-white">{dailyCashFlow.cashIn.delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Cash on Sales</span>
                  <span className="font-medium text-gray-900 dark:text-white">{dailyCashFlow.cashIn.cashOnSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Receipt</span>
                  <span className="font-medium text-gray-900 dark:text-white">{dailyCashFlow.cashIn.receipt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <span className="font-semibold text-blue-800 dark:text-blue-200">Total Cash IN</span>
                  <span className="font-bold text-blue-800 dark:text-blue-200 text-lg">{dailyCashFlow.cashIn.total.toFixed(2)}</span>
                </div>
              </div>
            </div>


          </div>

          {/* Summary Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" ref={dailyReportRef}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
              <button 
                onClick={printDailyReport}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Daily Report</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Job Order</span>
                <span className="font-medium text-gray-900 dark:text-white">{dailyCashFlow.summary.totalJobOrder.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Sales</span>
                <span className="font-medium text-gray-900 dark:text-white">{dailyCashFlow.summary.totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Business</span>
                <span className="font-medium text-gray-900 dark:text-white">{dailyCashFlow.summary.totalBusiness.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Monthly Data Tables */}
        <div className="space-y-6" ref={monthlyDataRef}>
          {/* 2025 Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2025 Monthly Data</h3>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Current Year</span>
                </div>
                <button
                  onClick={printMonthlyData}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-1 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-1 text-sm"
                  title="Print Monthly Data"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Month</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Advance</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Delivery</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receipt</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {monthlyData2025.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{month.month}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{month.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                    <td className="px-3 py-2 text-blue-800 dark:text-blue-200">TOTAL (2025)</td>
                    <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2024 Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2024 Monthly Data</h3>
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Previous Year</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Month</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Advance</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Delivery</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receipt</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {monthlyData2024.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{month.month}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{month.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-200">TOTAL (2024)</td>
                    <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 