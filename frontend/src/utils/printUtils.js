// Print utilities for reports
export const printJobOrderReport = (data, filters, totals) => {
  const printWindow = window.open('', '_blank')
  
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Job Order Report</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .report-date {
          font-size: 14px;
          color: #666;
        }
        .filters {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .filters h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        .filter-item {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .totals {
          margin-top: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }
        .totals h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          padding: 5px 0;
          border-bottom: 1px solid #ddd;
        }
        .total-label {
          font-weight: bold;
        }
        .total-value {
          font-weight: bold;
          color: #2c5aa0;
        }
        .grand-total {
          font-size: 16px;
          color: #2c5aa0;
          border-top: 2px solid #333;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Tailor Pro Management System</div>
        <div class="report-title">Job Order Report</div>
        <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="filters">
        <h3>Applied Filters:</h3>
        <div class="filter-item"><strong>Payment Method:</strong> ${filters.payment_method === 'all' ? 'All Methods' : filters.payment_method.replace('_', ' ')}</div>
        ${filters.start_date ? `<div class="filter-item"><strong>Start Date:</strong> ${filters.start_date}</div>` : ''}
        ${filters.end_date ? `<div class="filter-item"><strong>End Date:</strong> ${filters.end_date}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Job Order #</th>
            <th>Customer Name</th>
            <th>Advance Amount</th>
            <th>Balance Amount</th>
            <th>Cash Amount</th>
            <th>Card Amount</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(order => `
            <tr>
              <td>${order.job_order_number}</td>
              <td>${order.customer_name || order.customer?.name || 'N/A'}</td>
              <td>$${parseFloat(order.advance_amount || 0).toFixed(2)}</td>
              <td>$${parseFloat(order.balance_amount || 0).toFixed(2)}</td>
              <td>$${parseFloat(order.cash_amount || 0).toFixed(2)}</td>
              <td>$${parseFloat(order.card_amount || 0).toFixed(2)}</td>
              <td>${order.payment_method?.replace('_', ' ') || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <h3>Report Totals</h3>
        <div class="total-row">
          <span class="total-label">Total Advance Amount:</span>
          <span class="total-value">$${(totals?.total_advance || 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Total Balance Amount:</span>
          <span class="total-value">$${(totals?.total_balance || 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Total Cash Amount:</span>
          <span class="total-value">$${(totals?.total_cash || 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Total Card Amount:</span>
          <span class="total-value">$${(totals?.total_card || 0).toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span class="total-label">Grand Total:</span>
          <span class="total-value">$${(totals?.grand_total || 0).toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <p>This report was generated by Tailor Pro Management System</p>
        <p>Total Records: ${data.length}</p>
      </div>
    </body>
    </html>
  `
  
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

export const printSalesReport = (data, filters, totals) => {
  const printWindow = window.open('', '_blank')
  
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sales Report</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .report-date {
          font-size: 14px;
          color: #666;
        }
        .filters {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .filters h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        .filter-item {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .totals {
          margin-top: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }
        .totals h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          padding: 5px 0;
          border-bottom: 1px solid #ddd;
        }
        .total-label {
          font-weight: bold;
        }
        .total-value {
          font-weight: bold;
          color: #2c5aa0;
        }
        .grand-total {
          font-size: 16px;
          color: #2c5aa0;
          border-top: 2px solid #333;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Tailor Pro Management System</div>
        <div class="report-title">Sales Report</div>
        <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="filters">
        <h3>Applied Filters:</h3>
        <div class="filter-item"><strong>Payment Method:</strong> ${filters.payment_method === 'all' ? 'All Methods' : filters.payment_method.replace('_', ' ')}</div>
        <div class="filter-item"><strong>Item Filter:</strong> ${filters.item_filter === 'all' ? 'All Items' : filters.item_filter}</div>
        ${filters.start_date ? `<div class="filter-item"><strong>Start Date:</strong> ${filters.start_date}</div>` : ''}
        ${filters.end_date ? `<div class="filter-item"><strong>End Date:</strong> ${filters.end_date}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Sale #</th>
            <th>Customer Name</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(sale => `
            <tr>
              <td>${sale.sale_number}</td>
              <td>${sale.customer_name}</td>
              <td>$${parseFloat(sale.amount || 0).toFixed(2)}</td>
              <td>${sale.payment_method?.replace('_', ' ') || 'N/A'}</td>
              <td>${new Date(sale.date).toLocaleDateString()}</td>
              <td>${sale.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <h3>Report Totals</h3>
        <div class="total-row">
          <span class="total-label">Total Amount:</span>
          <span class="total-value">$${(totals?.total_amount || 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Cash Sales:</span>
          <span class="total-value">$${(totals?.total_cash || 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Bank Sales:</span>
          <span class="total-value">$${(totals?.total_bank || 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Mixed Sales:</span>
          <span class="total-value">$${(totals?.total_cash_bank || 0).toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <p>This report was generated by Tailor Pro Management System</p>
        <p>Total Records: ${data.length}</p>
      </div>
    </body>
    </html>
  `
  
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

export const printCustomerReport = (data, filters) => {
  const printWindow = window.open('', '_blank')
  
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Customer Report</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .report-date {
          font-size: 14px;
          color: #666;
        }
        .filters {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .filters h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        .filter-item {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Tailor Pro Management System</div>
        <div class="report-title">Customer Report</div>
        <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="filters">
        <h3>Applied Filters:</h3>
        ${filters.start_date ? `<div class="filter-item"><strong>Start Date:</strong> ${filters.start_date}</div>` : ''}
        ${filters.end_date ? `<div class="filter-item"><strong>End Date:</strong> ${filters.end_date}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Total Orders</th>
            <th>Total Amount</th>
            <th>Last Order Date</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(customer => `
            <tr>
              <td>${customer.name}</td>
              <td>${customer.phone}</td>
              <td>${customer.email}</td>
              <td>${customer.total_orders || 0}</td>
              <td>$${parseFloat(customer.total_amount || 0).toFixed(2)}</td>
              <td>${customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This report was generated by Tailor Pro Management System</p>
        <p>Total Customers: ${data.length}</p>
      </div>
    </body>
    </html>
  `
  
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

export const printSummaryReport = (stats) => {
  const printWindow = window.open('', '_blank')
  
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Business Summary Report</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .report-date {
          font-size: 14px;
          color: #666;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          text-align: center;
          background-color: #f9f9f9;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #2c5aa0;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
        }
        .summary-section {
          margin-bottom: 30px;
        }
        .summary-section h3 {
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .summary-label {
          font-weight: bold;
        }
        .summary-value {
          color: #2c5aa0;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Tailor Pro Management System</div>
        <div class="report-title">Business Summary Report</div>
        <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.total_orders || 0}</div>
          <div class="stat-label">Total Job Orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">$${(stats.total_revenue || 0).toFixed(2)}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.active_customers || 0}</div>
          <div class="stat-label">Active Customers</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.growth_rate || 0}%</div>
          <div class="stat-label">Growth Rate</div>
        </div>
      </div>

      <div class="summary-section">
        <h3>Order Status Breakdown</h3>
        <div class="summary-item">
          <span class="summary-label">Pending Orders:</span>
          <span class="summary-value">${stats.pending || 0}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Completed Orders:</span>
          <span class="summary-value">${stats.completed || 0}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Delivered Orders:</span>
          <span class="summary-value">${stats.delivered || 0}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Outstanding Balance:</span>
          <span class="summary-value">$${(stats.total_balance || 0).toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <p>This report was generated by Tailor Pro Management System</p>
        <p>Report Period: ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `
  
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}
