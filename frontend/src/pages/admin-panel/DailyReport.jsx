import { useState, useEffect, useRef } from 'react';
import { Calendar, DollarSign, TrendingUp, Users, Package, Clock, BarChart3, Download, Printer, ArrowUp, ArrowDown, Plus, Minus, Loader2 } from 'lucide-react';
import { transactionAPI } from '../../services/transactionsApi';

export default function DailyReport() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dailyReportRef = useRef(null);
  const monthlyDataRef = useRef(null);

  // Daily Cash Flow Data
  const [dailyCashFlow, setDailyCashFlow] = useState({
    date: '',
    cashIn: {
      advanceOnOrder: 0.00,
      delivery: 0.00,
      cashOnSales: 0.00,
      receipt: 0.00,
      otherCashIn: 0.00,
      total: 0.00
    },
    cashOut: {
      cashOutExp: 0.00,
      total: 0.00
    },
    netCash: 0.00,
    summary: {
      totalJobOrder: 0.00,
      totalSales: 0.00,
      totalBusiness: 0.00
    }
  });

  // Monthly Data
  const [monthlyData2025, setMonthlyData2025] = useState([]);
  const [monthlyData2024, setMonthlyData2024] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(true);

  // Fetch daily report data
  const fetchDailyReport = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionAPI.getDailyReport(date);
      
      // Ensure data has the correct structure
      if (data && typeof data === 'object') {
        setDailyCashFlow({
          date: data.date || '',
          cashIn: {
            advanceOnOrder: data.cashIn?.advanceOnOrder || 0.00,
            delivery: data.cashIn?.delivery || 0.00,
            cashOnSales: data.cashIn?.cashOnSales || 0.00,
            receipt: data.cashIn?.receipt || 0.00,
            otherCashIn: data.cashIn?.otherCashIn || 0.00,
            total: data.cashIn?.total || 0.00
          },
          cashOut: {
            cashOutExp: data.cashOut?.cashOutExp || 0.00,
            total: data.cashOut?.total || 0.00
          },
          netCash: data.netCash || 0.00,
          summary: {
            totalJobOrder: data.summary?.totalJobOrder || 0.00,
            totalSales: data.summary?.totalSales || 0.00,
            totalBusiness: data.summary?.totalBusiness || 0.00
          }
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching daily report:', err);
      setError('Failed to load daily report data');
      // Set default values on error
      setDailyCashFlow({
        date: '',
        cashIn: {
          advanceOnOrder: 0.00,
          delivery: 0.00,
          cashOnSales: 0.00,
          receipt: 0.00,
          otherCashIn: 0.00,
          total: 0.00
        },
        cashOut: {
          cashOutExp: 0.00,
          total: 0.00
        },
        netCash: 0.00,
        summary: {
          totalJobOrder: 0.00,
          totalSales: 0.00,
          totalBusiness: 0.00
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly report data
  const fetchMonthlyReport = async (year) => {
    try {
      const data = await transactionAPI.getMonthlyReport(year);
      // Ensure it's an array
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.error(`Error fetching monthly report for ${year}:`, err);
      // Return empty data on error
      return Array(12).fill(null).map((_, index) => ({
        month: ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'][index],
        advance: 0.00,
        delivery: 0.00,
        sales: 0.00,
        receipt: 0.00,
        total: 0.00
      }));
    }
  };

  // Fetch all monthly data
  const fetchAllMonthlyData = async () => {
    try {
      setLoadingMonthly(true);
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      
      const [data2025, data2024] = await Promise.all([
        fetchMonthlyReport(currentYear),
        fetchMonthlyReport(previousYear)
      ]);
      
      setMonthlyData2025(data2025);
      setMonthlyData2024(data2024);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  // Fetch data on component mount and when date changes
  useEffect(() => {
    fetchDailyReport(selectedDate);
  }, [selectedDate]);

  // Fetch monthly data on component mount
  useEffect(() => {
    fetchAllMonthlyData();
  }, []);

  // Calculate totals for monthly data
  const total2025 = monthlyData2025.reduce((acc, month) => ({
    advance: acc.advance + (month?.advance || 0),
    delivery: acc.delivery + (month?.delivery || 0),
    sales: acc.sales + (month?.sales || 0),
    receipt: acc.receipt + (month?.receipt || 0),
    total: acc.total + (month?.total || 0)
  }), { advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 });

  const total2024 = monthlyData2024.reduce((acc, month) => ({
    advance: acc.advance + (month?.advance || 0),
    delivery: acc.delivery + (month?.delivery || 0),
    sales: acc.sales + (month?.sales || 0),
    receipt: acc.receipt + (month?.receipt || 0),
    total: acc.total + (month?.total || 0)
  }), { advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 });

  // Print Daily Report function
  const printDailyReport = () => {
    if (loading || !dailyCashFlow?.date || !dailyCashFlow?.cashIn) {
      return;
    }
    const cashIn = dailyCashFlow.cashIn || {};
    const summary = dailyCashFlow.summary || {};
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
                <span>${(cashIn.advanceOnOrder || 0).toFixed(2)}</span>
              </div>
              <div class="item-row">
                <span>Delivery</span>
                <span>${(cashIn.delivery || 0).toFixed(2)}</span>
              </div>
              <div class="item-row">
                <span>Cash on Sales</span>
                <span>${(cashIn.cashOnSales || 0).toFixed(2)}</span>
              </div>
              <div class="item-row">
                <span>Receipt</span>
                <span>${(cashIn.receipt || 0).toFixed(2)}</span>
              </div>
              <div class="item-row total">
                <span>Total Cash IN</span>
                <span>${(cashIn.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="section summary-section">
            <div class="section-title">Summary</div>
            <div class="summary-grid">
              <div class="summary-item">
                <strong>Total Job Order</strong>
                <span>${(summary.totalJobOrder || 0).toFixed(2)}</span>
              </div>
              <div class="summary-item">
                <strong>Total Sales</strong>
                <span>${(summary.totalSales || 0).toFixed(2)}</span>
              </div>
              <div class="summary-item">
                <strong>Total Business</strong>
                <span>${(summary.totalBusiness || 0).toFixed(2)}</span>
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
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const tableRowCurrent = monthlyData2025.map(month => `
      <tr>
        <td>${month?.month || ''}</td>
        <td style="text-align: right;">${(month?.advance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${(month?.delivery || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${(month?.sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${(month?.receipt || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right; font-weight: bold;">${(month?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const tableRowPrevious = monthlyData2024.map(month => `
      <tr>
        <td>${month?.month || ''}</td>
        <td style="text-align: right;">${(month?.advance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${(month?.delivery || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${(month?.sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right;">${(month?.receipt || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align: right; font-weight: bold;">${(month?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
            <div class="section-title">${currentYear} Monthly Data</div>
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
                ${tableRowCurrent}
                <tr class="total-row">
                  <td>TOTAL (${currentYear})</td>
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
            <div class="section-title">${previousYear} Monthly Data</div>
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
                ${tableRowPrevious}
                <tr class="total-row">
                  <td>TOTAL (${previousYear})</td>
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
            disabled={loading}
          />
          <button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Section: Left (Cash IN/OUT) and Right (Monthly Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Daily Cash IN and OUT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Daily Cash IN and OUT</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `(for ${dailyCashFlow?.date || selectedDate})`
                )}
              </p>
            </div>

            {/* Cash IN Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <ArrowUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash IN</h3>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading daily report...</span>
                </div>
              ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Advance on Order</span>
                  <span className="font-medium text-gray-900 dark:text-white">{(dailyCashFlow?.cashIn?.advanceOnOrder || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Delivery</span>
                  <span className="font-medium text-gray-900 dark:text-white">{(dailyCashFlow?.cashIn?.delivery || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Cash on Sales</span>
                  <span className="font-medium text-gray-900 dark:text-white">{(dailyCashFlow?.cashIn?.cashOnSales || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Receipt</span>
                  <span className="font-medium text-gray-900 dark:text-white">{(dailyCashFlow?.cashIn?.receipt || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <span className="font-semibold text-blue-800 dark:text-blue-200">Total Cash IN</span>
                  <span className="font-bold text-blue-800 dark:text-blue-200 text-lg">{(dailyCashFlow?.cashIn?.total || 0).toFixed(2)}</span>
                </div>
              </div>
              )}
            </div>


          </div>

          {/* Summary Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6" ref={dailyReportRef}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
              <button 
                onClick={printDailyReport}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !dailyCashFlow?.date || !dailyCashFlow?.cashIn}
              >
                <Printer className="w-4 h-4" />
                <span>Print Daily Report</span>
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading summary...</span>
              </div>
            ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Job Order</span>
                <span className="font-medium text-gray-900 dark:text-white">{(dailyCashFlow?.summary?.totalJobOrder || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Sales</span>
                <span className="font-medium text-gray-900 dark:text-white">{(dailyCashFlow?.summary?.totalSales || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Business</span>
                <span className="font-medium text-gray-900 dark:text-white">{(dailyCashFlow?.summary?.totalBusiness || 0).toFixed(2)}</span>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Right Side: Monthly Data Tables */}
        <div className="space-y-6" ref={monthlyDataRef}>
          {/* 2025 Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date().getFullYear()} Monthly Data
              </h3>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Current Year</span>
                </div>
                <button
                  onClick={printMonthlyData}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-1 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Print Monthly Data"
                  disabled={loadingMonthly}
                >
                  <Printer className="w-3 h-3" />
                  <span>Print</span>
                </button>
              </div>
            </div>
            {loadingMonthly ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading monthly data...</span>
              </div>
            ) : (
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
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{month?.month || ''}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{(month?.advance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{(month?.delivery || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{(month?.sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{(month?.receipt || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{(month?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                      <td className="px-3 py-2 text-blue-800 dark:text-blue-200">TOTAL ({new Date().getFullYear()})</td>
                      <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Previous Year Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date().getFullYear() - 1} Monthly Data
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Previous Year</span>
              </div>
            </div>
            {loadingMonthly ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading monthly data...</span>
              </div>
            ) : (
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
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{month?.month || ''}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{(month?.advance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{(month?.delivery || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{(month?.sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{(month?.receipt || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{(month?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">TOTAL ({new Date().getFullYear() - 1})</td>
                      <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.advance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.delivery.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.receipt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 