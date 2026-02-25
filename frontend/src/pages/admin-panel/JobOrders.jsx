"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Plus, Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, DollarSign, Printer, User, Calculator, Calendar } from "lucide-react"
import AddJobOrder from "../../components/forms/AddJobOrder"
import EditJobOrder from "../../components/forms/EditJobOrder"
import jobOrdersApi from "../../services/jobOrdersApi"
import { formatCurrency, safeParseFloat } from "../../utils/currencyUtils"
import { formatDateStr, toIsoDate, toIsoDateTime, nowTimeString, formatDate } from "../../utils/dateUtils"
import JobOrderA5 from "../../components/print/joborder-a5"

export default function JobOrders() {
  const location = useLocation()
  const navigate = useNavigate()
  const [jobOrders, setJobOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total_orders: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    delivered: 0,
    total_revenue: 0,
    total_balance: 0,
  })

  // Form states
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [editingJobOrderId, setEditingJobOrderId] = useState(null)

  // Detail modal state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Print state and helpers
  const [printOrder, setPrintOrder] = useState(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [pendingPrintOrder, setPendingPrintOrder] = useState(null)

  // Date filter: use Qatar timezone (matches server TIME_ZONE = Asia/Qatar)
  const [dateFilter, setDateFilter] = useState({
    from: formatDateStr(new Date()),
    to: formatDateStr(new Date())
  })

  // Split search states: one per field, each with its own debounce
  const [searchJobOrder, setSearchJobOrder] = useState("")
  const [searchCustomerId, setSearchCustomerId] = useState("")
  const [searchNamePhone, setSearchNamePhone] = useState("")
  const [debouncedJobOrder, setDebouncedJobOrder] = useState("")
  const [debouncedCustomerId, setDebouncedCustomerId] = useState("")
  const [debouncedNamePhone, setDebouncedNamePhone] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedJobOrder(searchJobOrder), 300)
    return () => clearTimeout(t)
  }, [searchJobOrder])
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCustomerId(searchCustomerId), 300)
    return () => clearTimeout(t)
  }, [searchCustomerId])
  useEffect(() => {
    const t = setTimeout(() => setDebouncedNamePhone(searchNamePhone), 300)
    return () => clearTimeout(t)
  }, [searchNamePhone])

  const hasAnySearch = debouncedJobOrder.trim() || debouncedCustomerId.trim() || debouncedNamePhone.trim()
  const hasAnySearchInput = searchJobOrder.trim() || searchCustomerId.trim() || searchNamePhone.trim()

  // Check for search result navigation and open edit form
  useEffect(() => {
    if (location.state?.openEditForm && location.state?.editId && !isLoading) {
      const editId = location.state.editId;
      // Wait for job orders to load, then open edit form
      if (jobOrders.length > 0 || editId) {
        const timer = setTimeout(() => {
          setEditingJobOrderId(editId);
          setIsEditFormOpen(true);
          // Clear the state to prevent reopening on re-render
          navigate(location.pathname, { replace: true, state: {} });
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [location.state, isLoading, jobOrders.length, navigate, location.pathname]);

  const mapToA5 = (order) => {
    const totalAmount = safeParseFloat(order?.total_amount ?? 0)
    const advanceAmount = safeParseFloat(order?.advance_amount ?? 0)
    const balanceAmount = safeParseFloat(order?.balance_amount ?? 0)
    
    // Map job order items to print items
    let items = []
    if (order?.job_order_items && Array.isArray(order.job_order_items) && order.job_order_items.length > 0) {
      // Use actual job order items
      items = order.job_order_items.map(item => {
        const materialName = item.material_name || "خدمة خياطة"
        const arabicName = item.material_arabic_name || ""
        const description = arabicName ? `${materialName} - ${arabicName}` : materialName
        return {
          description: description,
          qty: parseInt(item.quantity) || 1,
          unitPrice: safeParseFloat(item.amount) || 0,
          amount: safeParseFloat(item.sub_total) || (safeParseFloat(item.amount) * (parseInt(item.quantity) || 1))
        }
      })
    } else {
      // Fallback to single item with remarks if no items exist
      items = [
        {
          description: order?.remarks || "خدمة خياطة",
          qty: 1,
          unitPrice: totalAmount || 0,
          amount: totalAmount || 0
        },
      ]
    }
    
    return {
      invoiceNumber: order?.job_order_number || "",
      date: toIsoDate(order?.created_at),
      dateTime: toIsoDateTime(order?.created_at),
      customerNumber: order?.customer_id || order?.id || "",
      customerName: order?.customer_name || "",
      customerPhone: order?.customer_phone || "",
      items: items,
      totals: { 
        total: totalAmount, 
        advance: advanceAmount, 
        balance: balanceAmount 
      },
      deliveryDate: toIsoDate(order?.delivery_date),
    }
  }

  const handlePrintOrder = (order) => {
    const a5 = mapToA5(order)
    setPendingPrintOrder(a5)
    setIsPrintModalOpen(true)
  }

  const generatePrintContent = (a5, copyType, printId) => {
    // Split items into chunks of 6
    const itemsPerPage = 6
    const itemChunks = []
    for (let i = 0; i < a5.items.length; i += itemsPerPage) {
      itemChunks.push(a5.items.slice(i, i + itemsPerPage))
    }
    
    // If no items, create one empty chunk
    if (itemChunks.length === 0) {
      itemChunks.push([])
    }
    
    // Order date for print; time = current time in Qatar when printing
    const printDate = a5.dateTime ? a5.dateTime.split(' ')[0] : a5.date
    const printTime = nowTimeString()
    
    // Generate header HTML
    const generateHeader = () => `
      <div class="hdr" dir="rtl">
        <div class="hdr-top">
      <div class="right brand-main">الخرطـــــــــــــــــــــــــــــــــــــــوم</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 4mm; margin-top: 1mm;">
        <div class="brand-subtitle" style="text-align: left; white-space: nowrap;">لتفصيل وخياطة الملابس السودانية</div>
        <div class="small" style="text-align: left; color: black;"><span style="white-space: nowrap;"><span>الرقم فاتورة: <strong>${a5.invoiceNumber}</strong></span></span></div>
        </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 4mm; margin-top: 0.5mm;">
        <div class="small" style="text-align: right; color: black;"><span>جوال:</span> <strong>50377968</strong></div>
        <div style="text-align: left; direction: ltr; font-size: 10.5pt; margin-bottom: 0.25mm;"><span>التاريخ:</span> <strong>${printDate}</strong></div>
      </div>
     </div>
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-top: 0.25mm; margin-bottom: 1mm; gap: 4mm; direction: ltr;">
          <div style="text-align: left; direction: ltr; font-size: 10.5pt;">
            <strong>${printTime}</strong><span>:الوقت</span> 
           </div>
          <div style="text-align: center; justify-self: center;">
            ${copyType === 'customer' ? `
            <div class="title" style="text-decoration: underline; display: inline-block;">فاتورة الخياطة</div>
            <div style="font-size: 10pt; font-weight: 700; margin-top: 1mm;">(customer copy)</div>
            ` : `
            <div style="font-size: 10pt; font-weight: 700;">(file copy)</div>
            `}
          </div>
          <div></div>
        </div>
        <div class="row submeta">
          <div class="cell left">
            <span>رقم العميل:</span> <strong>${a5.customerNumber}</strong>
          </div>
          <div class="cell">
            <strong>${a5.customerName}</strong>
            ${a5.customerPhone ? ` - ${a5.customerPhone}` : ''}<span>:اسم الزبون</span> 
          </div>
        </div>
      </div>
    `
    
    // Generate footer HTML
    const generateFooter = () => `
      <div class="ftr" dir="rtl">
        <div class="hours">
         <span>ساعات العمل:</span> صباحاً من 09:00 الى 01:00 مساءً من 04:00 الى 10:30 / الجمعة من 04:00 الى 10:30  
         </div>
      </div>
    `
    
    // Generate table rows for items
    const generateItemRows = (items) => {
      return items.map(item => {
        const itemAmount = item.amount !== undefined ? item.amount : (item.qty * item.unitPrice);
        return `
          <tr>
            <td class="col-details">${item.description}</td>
            <td class="col-qty">${item.qty}</td>
            <td class="col-unit">${item.unitPrice.toFixed(2)}</td>
            <td class="col-amt">${itemAmount.toFixed(2)}</td>
          </tr>
        `;
      }).join('')
    }
    
    // Generate empty rows to fill up to 6
    const generateEmptyRows = (count) => {
      return Array.from({ length: count }).map(() => `
        <tr>
          <td class="col-details">&nbsp;</td>
          <td class="col-qty">&nbsp;</td>
          <td class="col-unit">&nbsp;</td>
          <td class="col-amt">&nbsp;</td>
        </tr>
      `).join('')
    }
    
    // Generate totals footer (only on last page)
    const generateTotalsFooter = (isLastPage) => {
      if (!isLastPage) return ''
      return `
        <tr class="totals-separator">
          <td colspan="4" style="border-top: 1px solid #9ca3af; padding: 4px 8px;"></td>
        </tr>
        <tr>
          <td class="col-details"></td>
          <td class="col-qty" style="text-align: right; font-weight: 700;">المجموع:</td>
          <td class="col-unit"></td>
          <td class="col-amt" style="text-align: right; font-weight: 700;">${a5.totals.total.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="col-details"></td>
          <td class="col-qty" style="text-align: right; font-weight: 700;">مقدماً:</td>
          <td class="col-unit"></td>
          <td class="col-amt" style="text-align: right; font-weight: 700;">${a5.totals.advance.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="col-details"></td>
          <td class="col-qty" style="text-align: right; font-weight: 700;">الباقي:</td>
          <td class="col-unit"></td>
          <td class="col-amt" style="text-align: right; font-weight: 700;">${a5.totals.balance.toFixed(2)}</td>
        </tr>
        <tr>
          <td class="col-details" style="text-align: right;">
            <span>تاريخ تسليم:</span> <strong>${a5.deliveryDate}</strong>
          </td>
          <td class="col-qty"></td>
          <td class="col-unit"></td>
          <td class="col-amt"></td>
        </tr>
      `
    }
    
    // Generate pages
    const pages = itemChunks.map((chunk, pageIndex) => {
      const isLastPage = pageIndex === itemChunks.length - 1
      const emptyRowsCount = Math.max(itemsPerPage - chunk.length, 0)
      
      return `
        <div class="a5-sheet">
          ${generateHeader()}
          <div class="tbl" dir="rtl">
            <table class="items">
              <thead>
                <tr>
                  <th class="col-details">التفاصيل</th>
                  <th class="col-qty">كمية</th>
                  <th class="col-unit">سعر الوحدة</th>
                  <th class="col-amt">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                ${generateItemRows(chunk)}
                ${generateEmptyRows(emptyRowsCount)}
              </tbody>
              <tfoot>
                ${generateTotalsFooter(isLastPage)}
              </tfoot>
            </table>
          </div>
          ${generateFooter()}
        </div>
      `
    }).join('')
    
    return `
        <html>
          <head>
            <title>Print Job Order</title>
            <style>
              *, *::before, *::after { box-sizing: border-box; }
              @page { 
                size: A5 portrait; 
                margin: 5mm; 
              }
              html, body { 
                margin: 0; 
                padding: 0; 
                height: auto;
                overflow-x: hidden;
                overflow-y: visible;
                font-family: "Noto Naskh Arabic", "Tahoma", "Segoe UI", Arial, sans-serif; 
              }
              .a5-sheet { 
                width: 100%;
                max-width: 100%;
                min-height: auto;
                max-height: none;
                background: #fff; 
                color: #111827; 
                padding: 2mm 0 2mm 0; 
                page-break-after: always;
                page-break-inside: avoid;
              }
              .a5-sheet:last-child {
                page-break-after: avoid;
              }
              .hdr { padding-bottom: 2mm; margin-bottom: 2mm; page-break-inside: avoid; min-width: 0; overflow: hidden; }
              .hdr-top { margin-bottom: 0.5mm; margin-top: -1mm; min-width: 0; }
              .hdr-phone { display: grid; grid-template-columns: 1fr 1fr; margin-top: 1mm; gap: 4mm; direction: ltr; }
              .hdr-phone-left { text-align: left; justify-self: start; }
              .hdr-phone-right { text-align: right; justify-self: end; }
              .brand { font-weight: 700; text-align: right; font-size: 14pt; }
              .brand-main { font-weight: 700; text-align: right; font-size: 20pt; line-height: 1.2; }
              .brand-subtitle { font-weight: 600; text-align: center; font-size: 12pt; margin-top: 1mm; color: #374151; white-space: nowrap; }
              .small { font-size: 9pt; color: #4b5563; }
              .left { text-align: left; }
              .right { text-align: right; }
              .row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; align-items: center; margin-top: 1mm; font-size: 10.5pt; min-width: 0; }
              .row .cell { text-align: right; min-width: 0; overflow: hidden; }
              .row .cell.left { text-align: left; }
              .row .cell.center { text-align: center; }
              .title { font-weight: 700; font-size: 12pt; }
              .submeta { grid-template-columns: 1fr 2fr; direction: ltr; }
              .submeta .cell.left { text-align: left; justify-self: start; }
              .submeta .cell:not(.left) { text-align: right; justify-self: end; }
              table.items { width: 100%; max-width: 100%; border: 1px solid #9ca3af; border-collapse: collapse; font-size: 10.5pt; table-layout: fixed; page-break-inside: avoid; }
              .tbl { width: 100%; min-width: 0; overflow: hidden; }
              table.items th, table.items td { border: none; padding: 4px 6px; vertical-align: middle; }
              table.items thead tr { border-bottom: 1px solid #9ca3af; }
              table.items thead th { background: #f3f4f6; font-weight: 700; text-align: right; white-space: nowrap; }
              table.items thead th.col-qty { text-align: center; }
              table.items thead th.col-unit { text-align: center; }
              .col-details { width: 55%; min-width: 0; overflow: hidden; word-wrap: break-word; }
              .col-qty { width: 15%; text-align: center; }
              .col-unit { width: 15%; text-align: center; }
              .col-amt { width: 15%; text-align: right; }
              table.items tfoot td { padding: 2px 6px; vertical-align: middle; }
              table.items tfoot .totals-separator td { padding: 2px 6px; }
              .tbl { margin-bottom: 0; }
              .ftr { margin-top: 1mm; padding-top: 1mm; font-size: 8pt; color: #374151; page-break-inside: avoid; }
              .hours { text-align: center; white-space: nowrap; font-size: 8pt; }

              @media print {
                html, body {
                  height: auto !important;
                  overflow-x: hidden !important;
                  overflow-y: visible !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                }
                .a5-sheet {
                  width: 100% !important;
                  max-width: 100% !important;
                  page-break-after: always !important;
                  page-break-inside: avoid !important;
                  height: auto !important;
                  min-height: auto !important;
                  max-height: none !important;
                  overflow: visible;
                }
                .a5-sheet:last-child {
                  page-break-after: avoid !important;
                }
                .hours { white-space: nowrap !important; }
                /* Prevent blank pages - only print pages with content */
                @page {
                  size: A5 portrait;
                  margin: 5mm;
                }
                /* Avoid breaking inside important sections */
                .hdr, .tbl, .ftr {
                  page-break-inside: avoid;
                }
                /* Prevent breaking table rows */
                table.items tbody tr {
                  page-break-inside: avoid;
                }
                table.items thead {
                  display: table-header-group;
                }
                table.items tfoot {
                  display: table-footer-group;
                }
              }
            </style>
          </head>
          <body>
            ${pages}
            <script>
              (function() {
                var printId = '${printId}';
                var printTriggered = false;
                var dialogClosed = false;
                
                // Monitor for print dialog close
                var afterPrint = function() {
                  if (dialogClosed) return;
                  dialogClosed = true;
                  
                  try {
                    if (window.opener) {
                      window.opener.postMessage('printDialogClosed_' + printId, '*');
                    }
                  } catch(e) {
                    console.log('Could not send message to opener');
                  }
                };
                
                // Track when print is called
                var originalPrint = window.print;
                window.print = function() {
                  printTriggered = true;
                  originalPrint.apply(window, arguments);
                };
                
                // Use afterprint event (most reliable)
                window.addEventListener('afterprint', function() {
                  afterPrint();
                });
                
                // Fallback: Use matchMedia for print detection
                if (window.matchMedia) {
                  var mediaQueryList = window.matchMedia('print');
                  var handleChange = function(mql) {
                    if (!mql.matches && printTriggered) {
                      setTimeout(function() {
                        afterPrint();
                      }, 100);
                    }
                  };
                  
                  if (mediaQueryList.addEventListener) {
                    mediaQueryList.addEventListener('change', handleChange);
                  } else {
                    mediaQueryList.addListener(handleChange);
                  }
                }
              })();
            </script>
          </body>
        </html>
      `
  }

  const doPrint = (copyType, onComplete, orderData = null) => {
    return new Promise((resolve) => {
      const a5 = orderData || pendingPrintOrder
      
      if (!a5) {
        console.log(`⚠ No order data available for ${copyType} copy`)
        if (onComplete) onComplete()
        resolve()
        return
      }
      
      // Create unique ID for this print session
      const printId = `${copyType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const printContent = generatePrintContent(a5, copyType, printId)
      
      setTimeout(() => {
        const printWindow = window.open('', `print_${copyType}_${Date.now()}`, 'width=800,height=600')
        
        if (!printWindow) {
          console.error(`❌ Failed to open print window for ${copyType} copy - browser may have blocked it`)
          if (onComplete) onComplete()
          resolve()
          return
        }
        
        try {
          printWindow.document.write(printContent)
          printWindow.document.close()
        } catch (error) {
          console.error(`❌ Error writing content for ${copyType} copy:`, error)
          if (onComplete) onComplete()
          resolve()
          return
        }
        
        // Wait for content to load
        setTimeout(() => {
          printWindow.focus()
          
          // Variables for detection
          let printCalled = false
          let resolved = false
          let checkCount = 0
          const maxChecks = 300
          let messageHandler = null
          let checkInterval = null
          
          // Set up message handler BEFORE calling print
          if (onComplete) {
            messageHandler = (event) => {
              if (event.data === `printDialogClosed_${printId}` && !resolved && printCalled) {
                console.log(`✓ Print dialog closed for ${copyType} copy`)
                resolved = true
                if (checkInterval) clearInterval(checkInterval)
                window.removeEventListener('message', messageHandler)
                
                setTimeout(() => {
                  if (!printWindow.closed) {
                    printWindow.close()
                  }
                  if (onComplete) onComplete()
                  resolve()
                }, 300)
              }
            }
            window.addEventListener('message', messageHandler)
          }
          
          // Call print() with a delay to ensure window is ready
          setTimeout(() => {
            if (printWindow.closed) {
              console.error(`❌ Print window closed before print() for ${copyType}`)
              if (onComplete) onComplete()
              resolve()
              return
            }
            
            try {
              printWindow.focus()
              console.log(`🖨️ Calling print() for ${copyType} copy`)
              printCalled = true
              printWindow.print()
              console.log(`✅ print() executed for ${copyType} copy`)
              
              // Start polling ONLY after print() is called
              if (onComplete) {
                checkInterval = setInterval(() => {
                  checkCount++
                  
                  if (printWindow.closed && !resolved) {
                    console.log(`✓ Print window closed for ${copyType} copy`)
                    resolved = true
                    clearInterval(checkInterval)
                    window.removeEventListener('message', messageHandler)
                    onComplete()
                    resolve()
                    return
                  }
                  
                  // Timeout fallback
                  if (checkCount >= maxChecks && !resolved) {
                    console.log(`⚠ Timeout for ${copyType} copy`)
                    resolved = true
                    clearInterval(checkInterval)
                    window.removeEventListener('message', messageHandler)
                    if (!printWindow.closed) {
                      printWindow.close()
                    }
                    onComplete()
                    resolve()
                  }
                }, 200)
              } else {
                // Single print without callback
                setTimeout(() => {
                  if (!printWindow.closed) {
                    printWindow.close()
                  }
                  resolve()
                }, 2000)
              }
            } catch (e) {
              console.error(`❌ Error in print() for ${copyType}:`, e)
              if (onComplete) onComplete()
              resolve()
            }
          }, 500) // Delay before calling print()
        }, 500) // Delay after window opens
      }, 100)
    })
  }

  const executePrint = (copyType) => {
    if (!pendingPrintOrder) return
    
    setPrintOrder(pendingPrintOrder)
    setIsPrintModalOpen(false)
    doPrint(copyType, () => {
      setPrintOrder(null)
      setPendingPrintOrder(null)
    })
  }

  const executePrintBoth = async () => {
    if (!pendingPrintOrder) return
    
    const orderDataToPrint = pendingPrintOrder
    console.log('🖨️ Starting Print Both process')
    setPrintOrder(orderDataToPrint)
    setIsPrintModalOpen(false)
    
    try {
      const customerPrintId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const filePrintId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const customerContent = generatePrintContent(orderDataToPrint, 'customer', customerPrintId)
      const fileContent = generatePrintContent(orderDataToPrint, 'file', filePrintId)
      
      // Open customer window immediately
      console.log('📄 Opening customer print window...')
      let printWindow = window.open('', 'print_both', 'width=800,height=600')
      
      if (!printWindow) {
        console.error('❌ Failed to open print window')
        setPrintOrder(null)
        setPendingPrintOrder(null)
        return
      }
      
      // Write customer content first
      printWindow.document.write(customerContent)
      printWindow.document.close()
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Print customer copy first
      console.log('🖨️ Printing customer copy...')
      printWindow.focus()
      printWindow.print()
      
      // Wait for customer copy print dialog to close
      await new Promise((resolve) => {
        let resolved = false
        const messageHandler = (event) => {
          if (event.data === `printDialogClosed_${customerPrintId}` && !resolved) {
            resolved = true
            window.removeEventListener('message', messageHandler)
            console.log('✅ Customer copy print dialog closed')
            resolve()
          }
        }
        window.addEventListener('message', messageHandler)
        
        // Fallback timeout
        setTimeout(() => {
          if (!resolved) {
            resolved = true
            window.removeEventListener('message', messageHandler)
            resolve()
          }
        }, 60000)
      })
      
      // Wait a bit before changing content
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if window is still open, if not try to open a new one
      if (printWindow.closed) {
        console.log('📄 Reopening window for file copy...')
        printWindow = window.open('', 'print_both', 'width=800,height=600')
        if (!printWindow) {
          console.error('❌ Cannot open window for file copy')
          setPrintOrder(null)
          setPendingPrintOrder(null)
          return
        }
      }
      
      // Write file content to the same window
      printWindow.document.open()
      printWindow.document.write(fileContent)
      printWindow.document.close()
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Print file copy
      console.log('🖨️ Printing file copy...')
      printWindow.focus()
      printWindow.print()
      
      // Wait for file copy print dialog to close
      await new Promise((resolve) => {
        let resolved = false
        const messageHandler = (event) => {
          if (event.data === `printDialogClosed_${filePrintId}` && !resolved) {
            resolved = true
            window.removeEventListener('message', messageHandler)
            console.log('✅ File copy print dialog closed')
            setTimeout(() => {
              if (!printWindow.closed) printWindow.close()
              resolve()
            }, 500)
          }
        }
        window.addEventListener('message', messageHandler)
        
        // Fallback timeout
        setTimeout(() => {
          if (!resolved) {
            resolved = true
            window.removeEventListener('message', messageHandler)
            if (!printWindow.closed) printWindow.close()
            resolve()
          }
        }, 60000)
      })
      
      console.log('✅ Print Both process complete')
      setPrintOrder(null)
      setPendingPrintOrder(null)
    } catch (error) {
      console.error('❌ Error in Print Both process:', error)
      setPrintOrder(null)
      setPendingPrintOrder(null)
    }
  }

  // Load job orders and stats on component mount and when date filter or debounced search changes
  useEffect(() => {
    loadJobOrders()
    loadStats()
  }, [dateFilter.from, dateFilter.to, debouncedJobOrder, debouncedCustomerId, debouncedNamePhone])

  useEffect(() => {
    const onAfter = () => setPrintOrder(null)
    window.addEventListener("afterprint", onAfter)
    return () => window.removeEventListener("afterprint", onAfter)
  }, [])

  const loadJobOrders = async () => {
    try {
      setIsLoading(true)
      setError(null) // Clear previous errors

      const params = {}

      // If any search field has a value, search across all job orders (ignore date filter)
      if (debouncedJobOrder.trim()) {
        params.search_job_order = debouncedJobOrder.trim()
      }
      if (debouncedCustomerId.trim()) {
        params.search_customer_id = debouncedCustomerId.trim()
      }
      if (debouncedNamePhone.trim()) {
        params.search_name_phone = debouncedNamePhone.trim()
      }

      if (!hasAnySearch) {
        params.from_date = dateFilter.from
        params.to_date = dateFilter.to
      }

      const response = await jobOrdersApi.getJobOrders(params)
      console.log("API Response:", response) // Debug log

      // Handle different response structures
      let jobOrdersData = []
      if (Array.isArray(response)) {
        jobOrdersData = response
      } else if (response && Array.isArray(response.results)) {
        jobOrdersData = response.results
      } else if (response && Array.isArray(response.data)) {
        jobOrdersData = response.data
      } else {
        console.warn("Unexpected response structure:", response)
        jobOrdersData = []
      }

      setJobOrders(jobOrdersData)
    } catch (error) {
      console.error("Error loading job orders:", error)
      const errorMessage = error.response?.data?.error || error.message || "Failed to load job orders"
      setError(errorMessage)
      setJobOrders([]) // Ensure it's always an array
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const params = {}
      if (!hasAnySearch) {
        params.from_date = dateFilter.from
        params.to_date = dateFilter.to
      }
      
      const statsData = await jobOrdersApi.getJobOrderStats(params)
      setStats(
        statsData || {
          total_orders: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          delivered: 0,
          total_revenue: 0,
          total_balance: 0,
        },
      )
    } catch (error) {
      console.error("Error loading stats:", error)
      // Set default stats on error
      setStats({
        total_orders: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        delivered: 0,
        total_revenue: 0,
        total_balance: 0,
      })
    }
  }

  // Handle form operations
  const handleNewJobOrder = () => {
    setIsAddFormOpen(true)
  }

  const handleEditJobOrder = (order) => {
    setEditingJobOrderId(order.id)
    setIsEditFormOpen(true)
  }

  const handleDeleteJobOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this job order?")) {
      try {
        await jobOrdersApi.deleteJobOrder(orderId)
        loadJobOrders() // Refresh the list
        loadStats() // Refresh stats
      } catch (error) {
        console.error("Error deleting job order:", error)
        setError("Failed to delete job order")
      }
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await jobOrdersApi.updateJobOrderStatus(orderId, newStatus)
      loadJobOrders() // Refresh the list
      loadStats() // Refresh stats
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Failed to update job order status")
    }
  }

  const handleFormSuccess = async (savedOrder) => {
    loadJobOrders() // Refresh the list
    loadStats() // Refresh stats
    setIsAddFormOpen(false)
    setIsEditFormOpen(false)
    setEditingJobOrderId(null)
    
    // Show print modal if order was saved
    if (savedOrder) {
      // If the saved order doesn't have all required fields, fetch it
      let orderToPrint = savedOrder
      if (!savedOrder.job_order_number || !savedOrder.job_order_items) {
        try {
          const orderId = savedOrder.id || savedOrder.job_order_id
          if (orderId) {
            const fullOrder = await jobOrdersApi.getJobOrder(orderId)
            orderToPrint = fullOrder
          }
        } catch (error) {
          console.error('Error fetching full order for print:', error)
          // Use savedOrder as fallback
        }
      }
      
      const a5 = mapToA5(orderToPrint)
      setPendingPrintOrder(a5)
      setIsPrintModalOpen(true)
    }
  }

  const handleFormClose = () => {
    setIsAddFormOpen(false)
    setIsEditFormOpen(false)
    setEditingJobOrderId(null)
  }

  const handleSwitchToEdit = (jobOrderId) => {
    setIsAddFormOpen(false)
    setEditingJobOrderId(jobOrderId)
    setIsEditFormOpen(true)
    loadJobOrders()
    loadStats()
  }

  const openOrderDetail = async (order) => {
    // Fetch full job order details to ensure we have all information
    try {
      const fullOrder = await jobOrdersApi.getJobOrder(order.id)
      setSelectedOrder(fullOrder)
    } catch (error) {
      console.error('Error fetching job order details:', error)
      // Fallback to the order from the list if fetch fails
      setSelectedOrder(order)
    }
    setIsDetailModalOpen(true)
  }

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClearSearch = () => {
    setSearchJobOrder("")
    setSearchCustomerId("")
    setSearchNamePhone("")
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && hasAnySearchInput && jobOrders.length > 0) {
      handleEditJobOrder(jobOrders[0])
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage tailoring job orders and customer measurements</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => (Array.isArray(jobOrders) && jobOrders.length ? handlePrintOrder(jobOrders[0]) : null)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-60"
            disabled={!Array.isArray(jobOrders) || jobOrders.length === 0}
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>
          <button
            onClick={handleNewJobOrder}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Job Order</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar - Only show when forms are not open */}
      {!isAddFormOpen && !isEditFormOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search and Filter Job Orders</h3>
          
          {/* Search Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="search-job-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Order Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search-job-order"
                  value={searchJobOrder}
                  onChange={(e) => setSearchJobOrder(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by order number..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="search-customer-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search-customer-id"
                  value={searchCustomerId}
                  onChange={(e) => setSearchCustomerId(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by customer ID..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="search-name-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name / Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search-name-phone"
                  value={searchNamePhone}
                  onChange={(e) => setSearchNamePhone(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by name or phone..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 sm:flex-none sm:w-48">
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="from-date"
                value={dateFilter.from}
                onChange={(e) => handleDateFilterChange('from', e.target.value)}
                disabled={!!hasAnySearchInput}
                className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  hasAnySearchInput ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div className="flex-1 sm:flex-none sm:w-48">
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="to-date"
                value={dateFilter.to}
                onChange={(e) => handleDateFilterChange('to', e.target.value)}
                disabled={!!hasAnySearchInput}
                className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  hasAnySearchInput ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const today = formatDateStr(new Date())
                  setDateFilter({ from: today, to: today })
                }}
                disabled={!!hasAnySearchInput}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  hasAnySearchInput 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                Today
              </button>
              {hasAnySearchInput && (
                <button
                  onClick={handleClearSearch}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm rounded-md transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
          
          {/* Status indicator */}
          {hasAnySearchInput && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
              <strong>Search Mode:</strong> Searching across all job orders (date filter disabled)
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Add Job Order Form */}
      {isAddFormOpen && <AddJobOrder onClose={handleFormClose} onSuccess={handleFormSuccess} onSwitchToEdit={handleSwitchToEdit} />}

      {/* Edit Job Order Form */}
      {isEditFormOpen && editingJobOrderId && (
        <EditJobOrder jobOrderId={editingJobOrderId} onClose={handleFormClose} onSuccess={handleFormSuccess} />
      )}

      {/* Print Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Print Copy</h3>
            <div className="flex gap-4">
              <button
                onClick={() => executePrint('customer')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Customer Copy
              </button>
              <button
                onClick={() => executePrint('file')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                File Copy
              </button>
            </div>
            <button
              onClick={executePrintBoth}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
            >
              Print Both
            </button>
            <button
              onClick={() => {
                setIsPrintModalOpen(false)
                setPendingPrintOrder(null)
              }}
              className="mt-3 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Job Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Job Order Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedOrder.job_order_number}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintOrder(selectedOrder)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    setSelectedOrder(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Customer Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Name</label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer ID</label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedOrder.customer_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1 capitalize">{selectedOrder.status?.replace("-", " ") || 'N/A'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Order Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Order Date</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedOrder.created_at ? formatDate(selectedOrder.created_at) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Date</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedOrder.delivery_date ? formatDate(selectedOrder.delivery_date) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.job_order_items && selectedOrder.job_order_items.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Order Items</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Item</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Amount</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {selectedOrder.job_order_items.map((item, index) => {
                          const materialName = item.material_name || 'N/A'
                          const arabicName = item.material_arabic_name || ""
                          const displayName = arabicName ? `${materialName} - ${arabicName}` : materialName
                          return (
                          <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {displayName}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                              {item.quantity || 0}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                              {formatCurrency(item.amount || 0)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">
                              {formatCurrency(item.sub_total || 0)}
                            </td>
                          </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="bg-gray-100 dark:bg-gray-600">
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(selectedOrder.total_amount || 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Payment Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</label>
                    <p className="text-gray-900 dark:text-white font-medium text-lg">
                      {formatCurrency(selectedOrder.total_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Advance Amount</label>
                    <p className="text-gray-900 dark:text-white font-medium text-lg">
                      {formatCurrency(selectedOrder.advance_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance Amount</label>
                    <p className="text-gray-900 dark:text-white font-medium text-lg">
                      {formatCurrency(selectedOrder.balance_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</label>
                    <p className="text-gray-900 dark:text-white font-medium capitalize">
                      {selectedOrder.payment_method?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                  {selectedOrder.payment_method === 'cash_card' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash Amount</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(selectedOrder.cash_amount || 0)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Card Amount</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(selectedOrder.card_amount || 0)}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedOrder.recived_on_delivery_amount > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Received on Delivery</label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(selectedOrder.recived_on_delivery_amount || 0)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              {selectedOrder.remarks && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remarks</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedOrder.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job Orders List */}
      {!isAddFormOpen && !isEditFormOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Job Orders</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading job orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Job Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Array.isArray(jobOrders) && jobOrders.length > 0 ? (
                    jobOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.job_order_number}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.created_at ? formatDate(order.created_at) : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer_phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status.replace("-", " ")}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.delivery_date ? formatDate(order.delivery_date) : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            QAR {formatCurrency(order.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            QAR {formatCurrency(order.balance_amount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor("medium")}`}
                          >
                            Medium
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openOrderDetail(order)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditJobOrder(order)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJobOrder(order.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePrintOrder(order)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Print A5 slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {isLoading ? "Loading job orders..." : "No job orders found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.in_progress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">QAR {formatCurrency(stats.total_revenue)}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
