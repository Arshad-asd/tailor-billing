import { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, Users, Package, Clock, BarChart3, Download, Printer, ArrowUp, ArrowDown, Plus, Minus } from 'lucide-react';

export default function DailyReport() {
  const [selectedDate, setSelectedDate] = useState('2025-07-13');

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

  // Historical Monthly Data
  const monthlyData2025 = [
    { month: 'January', advance: 8500, delivery: 12000, sales: 15000, receipt: 250, total: 35750 },
    { month: 'February', advance: 9200, delivery: 13500, sales: 14200, receipt: 180, total: 37080 },
    { month: 'March', advance: 7800, delivery: 11000, sales: 12800, receipt: 320, total: 31920 },
    { month: 'April', advance: 8900, delivery: 12500, sales: 13800, receipt: 290, total: 35490 },
    { month: 'May', advance: 7600, delivery: 10800, sales: 12500, receipt: 210, total: 31110 },
    { month: 'June', advance: 8200, delivery: 11800, sales: 13200, receipt: 265, total: 33465 },
    { month: 'July', advance: 6300, delivery: 7800, sales: 8100, receipt: 0, total: 22200 },
    { month: 'August', advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 },
    { month: 'September', advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 },
    { month: 'October', advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 },
    { month: 'November', advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 },
    { month: 'December', advance: 0, delivery: 0, sales: 0, receipt: 0, total: 0 }
  ];

  const monthlyData2024 = [
    { month: 'January', advance: 9500, delivery: 14000, sales: 15800, receipt: 450, total: 39750 },
    { month: 'February', advance: 10200, delivery: 14500, sales: 15200, receipt: 380, total: 40280 },
    { month: 'March', advance: 8800, delivery: 12000, sales: 13800, receipt: 420, total: 35020 },
    { month: 'April', advance: 9900, delivery: 13500, sales: 14800, receipt: 350, total: 38550 },
    { month: 'May', advance: 8600, delivery: 11800, sales: 13500, receipt: 280, total: 34180 },
    { month: 'June', advance: 9200, delivery: 12800, sales: 14200, receipt: 315, total: 36515 },
    { month: 'July', advance: 7300, delivery: 9800, sales: 10800, receipt: 0, total: 27900 },
    { month: 'August', advance: 8100, delivery: 11200, sales: 12500, receipt: 290, total: 32090 },
    { month: 'September', advance: 7800, delivery: 10800, sales: 12200, receipt: 265, total: 31065 },
    { month: 'October', advance: 8500, delivery: 11800, sales: 13200, receipt: 310, total: 33810 },
    { month: 'November', advance: 9200, delivery: 12500, sales: 13800, receipt: 340, total: 35840 },
    { month: 'December', advance: 9800, delivery: 13100, sales: 14400, receipt: 380, total: 37680 }
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
          <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Date Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{dailyCashFlow.date}</h2>
        </div>
      </div>

      {/* Main Cash Flow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash IN Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <ArrowUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash IN</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Advance on Order</span>
              <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.cashIn.advanceOnOrder.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Delivery</span>
              <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.cashIn.delivery.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Cash on Sales</span>
              <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.cashIn.cashOnSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Receipt</span>
              <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.cashIn.receipt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Other Cash IN</span>
              <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.cashIn.otherCashIn.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <span className="font-semibold text-blue-800 dark:text-blue-200">Total Cash IN</span>
              <span className="font-bold text-blue-800 dark:text-blue-200 text-lg">${dailyCashFlow.cashIn.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Cash OUT Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <ArrowDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash OUT</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Cash Out (Exp)</span>
              <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.cashOut.cashOutExp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-100 dark:bg-red-900 rounded-lg border-2 border-red-200 dark:border-red-800">
              <span className="font-semibold text-red-800 dark:text-red-200">Total Cash OUT</span>
              <span className="font-bold text-red-800 dark:text-red-200 text-lg">${dailyCashFlow.cashOut.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Net Cash */}
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg border-2 border-green-200 dark:border-green-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-green-800 dark:text-green-200">Net Cash</span>
              <span className="font-bold text-green-800 dark:text-green-200 text-xl">${dailyCashFlow.netCash.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Total Job Order</span>
            <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.summary.totalJobOrder.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Total Sales</span>
            <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.summary.totalSales.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Total Business</span>
            <span className="font-medium text-gray-900 dark:text-white">${dailyCashFlow.summary.totalBusiness.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Historical Monthly Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2025 Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2025 Monthly Data</h3>
            <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Current Year</span>
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
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.advance.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.delivery.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.sales.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.receipt.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{month.total.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                  <td className="px-3 py-2 text-blue-800 dark:text-blue-200">Total 2025</td>
                  <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.advance.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.delivery.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.sales.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.receipt.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-blue-800 dark:text-blue-200">{total2025.total.toLocaleString()}</td>
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
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.advance.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.delivery.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.sales.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{month.receipt.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{month.total.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-200">Total 2024</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.advance.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.delivery.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.sales.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.receipt.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">{total2024.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 