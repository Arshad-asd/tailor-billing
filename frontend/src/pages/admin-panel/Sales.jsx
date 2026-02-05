"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Plus, Search, Printer, Edit, Trash2, DollarSign, TrendingUp, Users, Clock } from "lucide-react"
import AddSaleModal from "../../components/modals/AddSaleModal"
import EditSaleModal from "../../components/modals/EditSaleModal"
import { salesAPI } from "../../services/salesApi"
import { useNotification } from "../../hooks/useNotification"
import { safeParseFloat } from "../../utils/currencyUtils"
import { formatDateStr, toIsoDate, toIsoDateTime, formatDate, nowTimeString } from "../../utils/dateUtils"

export default function Sales() {
  const location = useLocation()
  const navigate = useNavigate()
  const today = formatDateStr(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showNotification } = useNotification()

  // Print state and helpers
  const [printSale, setPrintSale] = useState(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [pendingPrintSale, setPendingPrintSale] = useState(null)

  // Load sales data on component mount and when filters change
  useEffect(() => {
    loadSales()
  }, [startDate, endDate])

  // Check for search result navigation and open edit form
  useEffect(() => {
    if (location.state?.openEditForm && location.state?.editId) {
      const editId = location.state.editId;
      // Wait for sales to load, then find and open edit form
      if (sales.length > 0) {
        const sale = sales.find(s => s.id === editId);
        if (sale) {
          const timer = setTimeout(() => {
            setEditingSale(sale);
            setIsEditModalOpen(true);
            // Clear the state to prevent reopening on re-render
            navigate(location.pathname, { replace: true, state: {} });
          }, 100);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [location.state, sales, navigate, location.pathname]);

  useEffect(() => {
    const onAfter = () => setPrintSale(null)
    window.addEventListener("afterprint", onAfter)
    return () => window.removeEventListener("afterprint", onAfter)
  }, [])

  const mapToA5 = (sale) => {
    const totalAmount = safeParseFloat(sale?.total_amount ?? sale?.amount ?? 0)
    const depositAmount = safeParseFloat(sale?.deposit ?? 0)
    const balanceAmount = safeParseFloat(sale?.balance ?? (totalAmount - depositAmount))
    
    // Map sale items to print items
    let items = []
    if (sale?.sale_items && Array.isArray(sale.sale_items) && sale.sale_items.length > 0) {
      // Use actual sale items
      items = sale.sale_items.map(item => {
        const description = item.description || sale.notes || "خدمة خياطة"
        return {
          description: description,
          qty: parseInt(item.quantity ?? item.qty ?? 1) || 1,
          unitPrice: safeParseFloat(item.unit_price ?? item.unitPrice ?? item.price ?? 0),
          amount: safeParseFloat(item.sub_total ?? item.amount ?? (safeParseFloat(item.unit_price ?? item.unitPrice ?? item.price ?? 0) * (parseInt(item.quantity ?? item.qty ?? 1) || 1)))
        }
      })
    } else {
      // Fallback to single item with notes if no items exist
      items = [
        {
          description: sale?.notes || "خدمة خياطة",
          qty: 1,
          unitPrice: totalAmount || 0,
          amount: totalAmount || 0
        },
      ]
    }
    
    return {
      invoiceNumber: sale?.sale_number || sale?.id || "",
      date: toIsoDate(sale?.date ?? sale?.created_at),
      dateTime: toIsoDateTime(sale?.date ?? sale?.created_at),
      customerNumber: sale?.customer_id || sale?.id || "",
      customerName: sale?.customer_name || "",
      customerPhone: sale?.customer_phone || "",
      items: items,
      totals: { 
        total: totalAmount, 
        advance: depositAmount, 
        balance: balanceAmount 
      },
      deliveryDate: toIsoDate(sale?.delivery_date ?? sale?.date),
    }
  }

  const handlePrintSale = async (sale) => {
    try {
      // Fetch complete sale details with sale_items
      const response = await salesAPI.getSale(sale.id)
      const saleData = response.data
      
      const a5 = mapToA5(saleData)
      setPendingPrintSale(a5)
      setIsPrintModalOpen(true)
    } catch (err) {
      console.error("Error fetching sale details:", err)
      showNotification("Failed to load sale details", "error")
    }
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
    
    // Generate header HTML
    const generateHeader = () => `
      <div class="hdr" dir="rtl">
        <div class="hdr-top">
      <div class="right brand">الخرطوم لتفصيل وخياطة الملابس السودانية</div>
     </div>
        <div class="hdr-phone small">
          <div class="hdr-phone-left">
          <strong style="color: black;">${a5.invoiceNumber}</strong><span style="color: black;">:الرقم فاتورة</span> 
          </div>
          <div class="hdr-phone-right">
            <span style="color: black;">جوال:</span> <strong style="color: black;">50377968</strong>
          </div>
        </div>
        <div style="text-align: left; direction: ltr; margin-top: 1mm; font-size: 10.5pt; display: block; clear: both;">
          <span>التاريخ:</span> <strong>${a5.dateTime ? a5.dateTime.split(' ')[0] : a5.date}</strong>
        </div>
        ${a5.dateTime ? `
        <div style="text-align: left; direction: ltr; margin-top: 1mm; font-size: 10.5pt; display: block; clear: both;">
          <span>الوقت:</span> <strong>${a5.dateTime.split(' ')[1] || ''}</strong>
        </div>
        ` : ''}
        ${copyType === 'customer' ? `
        <div style="text-align: center; margin-top: 1mm; margin-bottom: 1mm;">
          <div class="title" style="text-decoration: underline; display: inline-block;">فاتورة الخياطة</div>
        </div>
        <div style="text-align: center; margin-top: 1mm; margin-bottom: 1mm; font-size: 10pt; font-weight: 700;">
          (customer copy)
        </div>
        ` : `
        <div style="text-align: center; margin-top: 1mm; margin-bottom: 1mm; font-size: 10pt; font-weight: 700;">
          (file copy)
        </div>
        `}
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
            <title>Print Sale</title>
            <style>
              @page { 
                size: A5 portrait; 
                margin: 4mm 3mm 15mm 3mm; 
              }
              html, body { 
                margin: 0; 
                padding: 0; 
                height: auto;
                overflow: visible;
                font-family: "Noto Naskh Arabic", "Tahoma", "Segoe UI", Arial, sans-serif; 
              }
              .a5-sheet { 
                width: 142mm; 
                min-height: auto;
                max-height: 210mm;
                background: #fff; 
                color: #111827; 
                padding: 3mm 2mm 3mm 2mm; 
                page-break-after: always;
                page-break-inside: avoid;
              }
              .a5-sheet:last-child {
                page-break-after: avoid;
              }
              .hdr { padding-bottom: 2mm; margin-bottom: 2mm; page-break-inside: avoid; }
              .hdr-top { margin-bottom: 0.5mm; margin-top: -1mm; }
              .hdr-phone { display: grid; grid-template-columns: 1fr 1fr; margin-top: 1mm; gap: 4mm; direction: ltr; }
              .hdr-phone-left { text-align: left; justify-self: start; }
              .hdr-phone-right { text-align: right; justify-self: end; }
              .brand { font-weight: 700; text-align: right; font-size: 14pt; }
              .small { font-size: 9pt; color: #4b5563; }
              .left { text-align: left; }
              .right { text-align: right; }
              .row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; align-items: center; margin-top: 1mm; font-size: 10.5pt; }
              .row .cell { text-align: right; }
              .row .cell.left { text-align: left; }
              .row .cell.center { text-align: center; }
              .title { font-weight: 700; font-size: 12pt; }
              .submeta { grid-template-columns: 1fr 2fr; direction: ltr; }
              .submeta .cell.left { text-align: left; justify-self: start; }
              .submeta .cell:not(.left) { text-align: right; justify-self: end; }
              table.items { width: 100%; max-width: 100%; border: 1px solid #9ca3af; border-collapse: collapse; font-size: 10.5pt; table-layout: fixed; page-break-inside: avoid; }
              .tbl { width: 100%; }
              table.items th, table.items td { border: none; padding: 4px 6px; vertical-align: middle; }
              table.items thead tr { border-bottom: 1px solid #9ca3af; }
              table.items thead th { background: #f3f4f6; font-weight: 700; text-align: right; white-space: nowrap; }
              table.items thead th.col-qty { text-align: center; }
              table.items thead th.col-unit { text-align: center; }
              .col-details { width: 55%; }
              .col-qty { width: 15%; text-align: center; }
              .col-unit { width: 15%; text-align: center; }
              .col-amt { width: 15%; text-align: right; }
              table.items tfoot td { padding: 2px 6px; vertical-align: middle; }
              table.items tfoot .totals-separator td { padding: 2px 6px; }
              .tbl { margin-bottom: 0; }
              .ftr { margin-top: 1mm; padding-top: 1mm; font-size: 9.5pt; color: #374151; page-break-inside: avoid; }
              .hours { text-align: center; white-space: nowrap; }
              
              @media print {
                html, body {
                  height: auto !important;
                  overflow: visible !important;
                  margin: 0;
                  padding: 0;
                }
                .a5-sheet {
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
                /* Prevent blank pages - only print pages with content */
                @page {
                  size: A5 portrait;
                  margin: 4mm 3mm 15mm 3mm;
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

  const doPrint = (copyType, onComplete, saleData = null) => {
    return new Promise((resolve) => {
      const a5 = saleData || pendingPrintSale
      
      if (!a5) {
        console.log(`⚠ No sale data available for ${copyType} copy`)
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
    if (!pendingPrintSale) return
    
    setPrintSale(pendingPrintSale)
    setIsPrintModalOpen(false)
    doPrint(copyType, () => {
      setPrintSale(null)
      setPendingPrintSale(null)
    })
  }

  const executePrintBoth = async () => {
    if (!pendingPrintSale) return
    
    const saleDataToPrint = pendingPrintSale
    console.log('🖨️ Starting Print Both process')
    setPrintSale(saleDataToPrint)
    setIsPrintModalOpen(false)
    
    try {
      const customerPrintId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const filePrintId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const customerContent = generatePrintContent(saleDataToPrint, 'customer', customerPrintId)
      const fileContent = generatePrintContent(saleDataToPrint, 'file', filePrintId)
      
      // Open customer window immediately
      console.log('📄 Opening customer print window...')
      let printWindow = window.open('', 'print_both', 'width=800,height=600')
      
      if (!printWindow) {
        console.error('❌ Failed to open print window')
        setPrintSale(null)
        setPendingPrintSale(null)
        return
      }
      
      // Write customer content first
      printWindow.document.write(customerContent)
      printWindow.document.close()
      
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
          setPrintSale(null)
          setPendingPrintSale(null)
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
      setPrintSale(null)
      setPendingPrintSale(null)
    } catch (error) {
      console.error('❌ Error in Print Both process:', error)
      setPrintSale(null)
      setPendingPrintSale(null)
    }
  }

  const loadSales = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = {}
      if (startDate) {
        params.start_date = startDate
      }
      if (endDate) {
        params.end_date = endDate
      }
      
      const response = await salesAPI.getSales(params)
      // Handle both array response and object with data/results property
      let salesData = []
      if (Array.isArray(response)) {
        salesData = response
      } else if (response?.data && Array.isArray(response.data)) {
        salesData = response.data
      } else if (response?.results && Array.isArray(response.results)) {
        salesData = response.results
      }
      setSales(salesData)
    } catch (err) {
      console.error("Error loading sales:", err)
      setError("Failed to load sales data")
      setSales([]) // Set empty array on error
      showNotification("Failed to load sales data", "error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredSales = (sales || []).filter((sale) => {
    const matchesSearch =
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalRevenue = (sales || [])
    .filter((s) => s.status === "completed")
    .reduce((sum, sale) => sum + Number.parseFloat(sale.total_amount || sale.amount || 0), 0)
  const pendingRevenue = (sales || [])
    .filter((s) => s.status === "pending")
    .reduce((sum, sale) => sum + Number.parseFloat(sale.total_amount || sale.amount || 0), 0)
  const totalSales = (sales || []).filter((s) => s.status === "completed").length

  const handleAddSale = async (formData) => {
    try {
      // Transform form data to match API structure
      const saleData = {
        customer_name: formData.customerName,
        amount: Number.parseFloat(formData.amount),
        total_amount: Number.parseFloat(formData.amount),
        date: formData.date,
        payment_method: formData.paymentMethod.toLowerCase().replace(" ", "_"),
        status: formData.status || "pending",
        notes: formData.notes,
        sale_items: formData.sale_items || [], // Include sale items in the payload
      }

      const response = await salesAPI.createSale(saleData)
      setSales((prev) => [response.data, ...(Array.isArray(prev) ? prev : [])])
      showNotification("Sale created successfully", "success")
      setIsAddModalOpen(false)
    } catch (err) {
      console.error("Error creating sale:", err)
      showNotification("Failed to create sale", "error")
    }
  }

  const handleEditSale = async (formData, saleId) => {
    try {
      // Transform form data to match API structure
      const saleData = {
        customer_name: formData.customerName,
        amount: Number.parseFloat(formData.amount),
        total_amount: Number.parseFloat(formData.amount),
        date: formData.date,
        payment_method: formData.paymentMethod.toLowerCase().replace(" ", "_"),
        status: formData.status,
        notes: formData.notes,
        sale_items: formData.sale_items || [], // Include sale items in the payload
      }

      const response = await salesAPI.updateSale(saleId, saleData)
      setSales((prev) => (Array.isArray(prev) ? prev : []).map((sale) => (sale.id === saleId ? response.data : sale)))
      showNotification("Sale updated successfully", "success")
      setIsEditModalOpen(false)
      setEditingSale(null)
    } catch (err) {
      console.error("Error updating sale:", err)
      showNotification("Failed to update sale", "error")
    }
  }

  const handleEditClick = async (sale) => {
    try {
      // Fetch complete sale details with sale_items
      const response = await salesAPI.getSale(sale.id)
      setEditingSale(response.data)
      setIsEditModalOpen(true)
    } catch (err) {
      console.error("Error fetching sale details:", err)
      showNotification("Failed to load sale details", "error")
    }
  }

  const handleDeleteSale = async (saleId) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await salesAPI.deleteSale(saleId)
        setSales((prev) => (Array.isArray(prev) ? prev : []).filter((sale) => sale.id !== saleId))
        showNotification("Sale deleted successfully", "success")
      } catch (err) {
        console.error("Error deleting sale:", err)
        showNotification("Failed to delete sale", "error")
      }
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h1>
          <p className="text-gray-600 dark:text-gray-400">Track sales and revenue</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => (Array.isArray(sales) && sales.length ? handlePrintSale(sales[0]) : null)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-60"
            disabled={!Array.isArray(sales) || sales.length === 0}
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Sales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(sales.map((s) => s.customerName)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("")
                  setEndDate("")
                }}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading sales...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sales Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sale ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{sale.sale_number}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {sale.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{sale.customer_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{sale.notes || "No description"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {Number.parseFloat(sale.total_amount || sale.amount || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {sale.date ? formatDate(sale.date) : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {sale.payment_method?.replace("_", " ").toUpperCase() || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handlePrintSale(sale)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(sale)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSales.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sales found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || startDate || endDate
                ? "No sales match your current filters."
                : "Get started by creating a new sale."}
            </p>
          </div>
        </div>
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
                setPendingPrintSale(null)
              }}
              className="mt-3 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddSaleModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSale} />

      <EditSaleModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSale(null)
        }}
        onSubmit={handleEditSale}
        editingSale={editingSale}
      />
    </div>
  )
}
