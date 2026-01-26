"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X,
  Ruler,
  List,
  Printer,
} from "lucide-react"
import AddMaterialModal from "../../components/modals/AddMaterialModal"
import EditMaterialModal from "../../components/modals/EditMaterialModal"
import JobOrderMeasurementModal from "../../components/modals/JobOrderMeasurementModal"
import materialsApi from "../../services/materialsApi"
import jobOrdersApi from "../../services/jobOrdersApi"
import { formatCurrency } from "../../utils/currencyUtils"

export default function Materials() {
  const [activeTab, setActiveTab] = useState("measurements") // 'materials' or 'measurements'
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [materials, setMaterials] = useState([])
  const [jobOrders, setJobOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false)
  const [selectedJobOrder, setSelectedJobOrder] = useState(null)
  const [selectedJobOrders, setSelectedJobOrders] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  
  // Date filter state - default to today
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0] // Format: YYYY-MM-DD
  }
  const [fromDate, setFromDate] = useState(getTodayDate())
  const [toDate, setToDate] = useState(getTodayDate())

  // Load data on component mount and when dates change
  useEffect(() => {
    if (activeTab === "materials") {
      loadMaterials()
    } else {
      loadJobOrders()
    }
  }, [activeTab, fromDate, toDate])

  const loadMaterials = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await materialsApi.getMaterials()
      setMaterials(data || [])
    } catch (error) {
      console.error("Error loading materials:", error)
      setError("Failed to load materials. Please try again.")
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  const loadJobOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      
      // Only add date filters if dates are valid
      if (fromDate) {
        params.from_date = fromDate
      }
      if (toDate) {
        params.to_date = toDate
      }
      
      const data = await jobOrdersApi.getJobOrders(params)
      setJobOrders(data || [])
    } catch (error) {
      console.error("Error loading job orders:", error)
      setError("Failed to load job orders. Please try again.")
      setJobOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) return "out-of-stock"
    if (quantity <= minStock) return "low-stock"
    return "in-stock"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800"
      case "low-stock":
        return "bg-yellow-100 text-yellow-800"
      case "out-of-stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStockIcon = (status) => {
    switch (status) {
      case "in-stock":
        return <TrendingUp className="w-4 h-4" />
      case "low-stock":
        return <AlertTriangle className="w-4 h-4" />
      case "out-of-stock":
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.material_number && material.material_number.toLowerCase().includes(searchTerm.toLowerCase()))
    // Note: API materials don't have category field, so we'll skip category filtering for now
    return matchesSearch
  })

  const filteredJobOrders = jobOrders.filter((jobOrder) => {
    const matchesSearch =
      jobOrder.job_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobOrder.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobOrder.id.toString().toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = categoryFilter === "all" || jobOrder.status === categoryFilter

    return matchesSearch && matchesStatus
  })

  const totalValue = materials.reduce((sum, material) => sum + Number.parseFloat(material.price || 0), 0)
  const activeMaterials = materials.filter((material) => material.is_active).length
  const inactiveMaterials = materials.filter((material) => !material.is_active).length

  const handleAddMaterial = async (formData) => {
    try {
      setLoading(true)
      const newMaterial = await materialsApi.createMaterial(formData)
      setMaterials((prev) => [...prev, newMaterial])
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error creating material:", error)
      setError("Failed to create material. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditMaterial = async (formData, materialId) => {
    try {
      setLoading(true)
      const updatedMaterial = await materialsApi.updateMaterial(materialId, formData)
      setMaterials((prev) => prev.map((material) => (material.id === materialId ? updatedMaterial : material)))
      setIsEditModalOpen(false)
      setEditingMaterial(null)
    } catch (error) {
      console.error("Error updating material:", error)
      setError("Failed to update material. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        setLoading(true)
        await materialsApi.deleteMaterial(materialId)
        setMaterials((prev) => prev.filter((material) => material.id !== materialId))
      } catch (error) {
        console.error("Error deleting material:", error)
        setError("Failed to delete material. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEditClick = (material) => {
    setEditingMaterial(material)
    setIsEditModalOpen(true)
  }

  const handleViewMeasurements = (jobOrder) => {
    setSelectedJobOrder(jobOrder)
    setIsMeasurementModalOpen(true)
  }


  // Selection functions
  const handleSelectJobOrder = (jobOrderId) => {
    setSelectedJobOrders(prev => {
      if (prev.includes(jobOrderId)) {
        return prev.filter(id => id !== jobOrderId)
      } else {
        return [...prev, jobOrderId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedJobOrders([])
      setSelectAll(false)
    } else {
      const allIds = filteredJobOrders.map(jobOrder => jobOrder.id)
      setSelectedJobOrders(allIds)
      setSelectAll(true)
    }
  }

  const handlePrintJobOrderMeasurements = async (jobOrder) => {
    try {
      setLoading(true)
      console.log('Fetching measurements for job order:', jobOrder.id)
      const measurements = await jobOrdersApi.getJobOrderMeasurements(jobOrder.id)
      console.log('Measurements received:', measurements)

      if (measurements && measurements.length > 0) {
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Job Order Measurement - ${jobOrder.job_order_number}</title>
              <style>
                /* Page + base */
                @page {
                  size: A5 portrait;
                  margin: 5mm;
                }
                html, body {
                  height: auto;
                  overflow: visible;
                }
                body {
                  font-family: Arial, sans-serif;
                  font-size: 16px;
                  line-height: 1.25;
                  margin: 0;
                  padding: 0;
                  color: #111;
                }
                .a5 {
                  width: 100%;
                  max-width: 100%;
                }

                /* Header */
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  gap: 8px;
                  margin-bottom: 4mm;
                  border-bottom: 1px solid #000;
                  padding-bottom: 2mm;
                }
                .customer-info, .job-info {
                  flex: 1;
                  max-width: 35%;
                }
                .customer-id-center {
                  flex: 1;
                  text-align: center;
                  max-width: 30%;
                }
                .header h1 {
                  margin: 0 0 2px 0;
                  font-size: 16px;
                  color: #111;
                }
                .header p {
                  margin: 1px 0;
                  font-size: 16px;
                  color: #444;
                }

                /* Measurement Items */
                .measurement-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 3mm;
                  padding-bottom: 2mm;
                  border-bottom: 0.5px solid #ccc;
                  gap: 3mm;
                  page-break-inside: avoid;
                  break-inside: avoid;
                  orphans: 3;
                  widows: 3;
                }
                .measurement-left {
                  flex: 1;
                  min-width: 0;
                  max-width: calc(100% - 45mm);
                  overflow: hidden;
                }
                .material-name {
                  font-weight: 600;
                  font-size: 16px;
                  margin-bottom: 1mm;
                  color: #111;
                }
                .notes {
                  font-size: 16px;
                  color: #555;
                  margin-bottom: 1mm;
                  line-height: 1.3;
                  word-wrap: break-word;
                  word-break: break-word;
                  overflow-wrap: break-word;
                  max-width: 100%;
                }
                .measurement-values {
                  font-size: 16px;
                  color: #333;
                  white-space: nowrap;
                  margin-top: 1mm;
                  margin-bottom: 1mm;
                }
                .measurement-right {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  gap: 3mm;
                  width: 40mm;
                  min-width: 40mm;
                  max-width: 40mm;
                  flex-shrink: 0;
                  padding-left: 2mm;
                }
                .cutter-stitcher {
                  display: flex;
                  flex-direction: column;
                  gap: 0;
                  font-size: 16px;
                  align-items: flex-end;
                }
                .cutter-stitcher > div {
                  display: flex;
                  align-items: baseline;
                  white-space: nowrap;
                }
                .cutter-stitcher-label {
                  font-weight: 600;
                }
                .cutter-stitcher-line {
                  display: inline-block;
                  border-bottom: 0.5px solid #000;
                  width: 25mm;
                  height: 1em;
                  margin-left: 2mm;
                  vertical-align: baseline;
                }

                /* Footer */
                .footer {
                  margin-top: 6mm;
                  text-align: center;
                  font-size: 16px;
                  color: #555;
                  border-top: 0.6px solid #bbb;
                  padding-top: 3mm;
                }

                /* Print-specific tweaks */
                @media print {
                  body { 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact;
                  }
                  .measurement-item { 
                    page-break-inside: avoid;
                    break-inside: avoid;
                    page-break-after: auto;
                    orphans: 3;
                    widows: 3;
                  }
                  .measurements-container {
                    page-break-inside: auto;
                  }
                }
              </style>
            </head>
            <body>
              <div class="a5">
                <div class="header">
                  <div class="customer-info">
                    <h1>${jobOrder.customer_name}</h1>
                    <p>Mobile: ${jobOrder.customer_phone}</p>
                  </div>
                  <div class="customer-id-center">
                    <h1>ID: ${jobOrder.customer_id || 'N/A'}</h1>
                  </div>
                  <div class="job-info">
                    <h1>${jobOrder.job_order_number}</h1>
                    <p>Delivery: ${new Date(jobOrder.delivery_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div class="measurements-container">
                  ${measurements.map(measurement => {
                    // Combine all measurement values into a single string, remove trailing zeros
                    const formatValue = (val) => {
                      if (val === "" || val === null || val === undefined) return "";
                      const num = parseFloat(val);
                      if (isNaN(num)) return "";
                      // Convert to string and remove trailing zeros and decimal point if not needed
                      return num.toString().replace(/\.0+$/, '').replace(/(\d+\.\d*?)0+$/, '$1');
                    };
                    
                    const measurementValues = [
                      formatValue(measurement.thool),
                      formatValue(measurement.kethet),
                      formatValue(measurement.thool_kum),
                      formatValue(measurement.ardh_f_kum),
                      formatValue(measurement.jamba),
                      formatValue(measurement.ragab)
                    ].filter(val => val !== "")
                     .join(" - ");
                    
                    // Collect notes and join with hyphens
                    const notes = [
                      measurement.note1,
                      measurement.note2,
                      measurement.note3,
                      measurement.note4
                    ].filter(note => note && note.trim() !== "");
                    
                    const notesHtml = notes.length > 0 
                      ? `<div class="notes">${notes.join(" - ")}</div>`
                      : '';
                    
                    return `
                      <div class="measurement-item">
                        <div class="measurement-left">
                          <div class="material-name">${measurement.material_name || "Material"}</div>
                          <div class="measurement-values">${measurementValues || ""}</div>
                          ${notesHtml}
                        </div>
                        <div class="measurement-right">
                          <div class="cutter-stitcher">
                            <div>
                              <span class="cutter-stitcher-label">Cutter</span>
                              <span class="cutter-stitcher-line"></span>
                            </div>
                          </div>
                          <div class="cutter-stitcher">
                            <div>
                              <span class="cutter-stitcher-label">Stitcher</span>
                              <span class="cutter-stitcher-line"></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>

              </div>
              <script>
                window.document.close();
                window.focus();
                window.print();
                window.close();
              </script>
            </body>
          </html>
        `

        // Create one print window with all measurements for this job order
        const printWindow = window.open("", "_blank")
        
        if (printWindow) {
          printWindow.document.write(printContent)
          printWindow.document.close()
          printWindow.focus()
          printWindow.print()
        } else {
          alert("Please allow popups for this site to print measurements.")
        }
      } else {
        alert("No measurements found for this job order.")
      }
    } catch (error) {
      console.error("Error printing measurements:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      alert(`Failed to load measurements for printing. Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkPrintJobOrderMeasurements = async () => {
    if (selectedJobOrders.length === 0) {
      alert("Please select at least one job order to print.")
      return
    }

    try {
      setLoading(true)
      
      // Prepare job order list
      const jobOrderList = []
      for (let i = 0; i < selectedJobOrders.length; i++) {
        const jobOrderId = selectedJobOrders[i]
        const jobOrder = jobOrders.find(jo => jo.id === jobOrderId)
        if (jobOrder) {
          jobOrderList.push({ jobOrder, index: i })
        }
      }

      if (jobOrderList.length === 0) {
        alert("No valid job orders found.")
        setLoading(false)
        return
      }

      // STEP 1: Open ONE window immediately (synchronously, before any async)
      // We'll reuse this single window for all prints to avoid popup blocking
      console.log(`\n=== Opening single print window ===`)
      let printWindow = window.open("", "print_window", "width=800,height=600,scrollbars=yes")
      
      if (!printWindow) {
        alert(`Popup blocked! Please allow popups to print job orders.`)
        setLoading(false)
        return
      }
      
      console.log(`✓ Print window opened successfully\n`)

      // STEP 2: Process each job order sequentially using the same window
      for (let i = 0; i < jobOrderList.length; i++) {
        const { jobOrder, index } = jobOrderList[i]
        
        console.log(`\n=== Processing print ${i + 1} of ${jobOrderList.length}: ${jobOrder.job_order_number} ===`)
        
        // Check if window is still open
        if (!printWindow || printWindow.closed) {
          console.error(`❌ Print window closed, cannot continue`)
          break
        }
        
        try {
          // Show loading message
          try {
            printWindow.document.open()
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head><title>Loading...</title></head>
                <body>
                  <div style="padding: 20px; text-align: center; font-family: Arial;">
                    <h2>Loading measurements...</h2>
                    <p>Preparing ${jobOrder.job_order_number} for printing...</p>
                    <p>Print ${i + 1} of ${jobOrderList.length}</p>
                  </div>
                </body>
              </html>
            `)
            printWindow.document.close()
            console.log(`✓ Loading message shown for ${jobOrder.job_order_number}`)
          } catch (e) {
            console.error(`Error writing loading message:`, e)
          }

          // Fetch measurements
          console.log(`Fetching measurements ${i + 1} of ${jobOrderList.length}: ${jobOrder.job_order_number}`)
          let measurements
          try {
            measurements = await jobOrdersApi.getJobOrderMeasurements(jobOrder.id)
            console.log(`✓ Measurements fetched for ${jobOrder.job_order_number}:`, measurements?.length || 0, 'items')
          } catch (e) {
            console.error(`❌ Error fetching measurements for ${jobOrder.job_order_number}:`, e)
            continue
          }
          
          if (!measurements || measurements.length === 0) {
            console.log(`⚠ No measurements found for job order: ${jobOrder.job_order_number}`)
            continue
          }

          // STEP 4: Create and populate print content
          const printContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Job Order Measurement - ${jobOrder.job_order_number}</title>
                <style>
                  @page {
                    size: A5 portrait;
                    margin: 5mm;
                  }
                  html, body {
                    height: auto;
                    overflow: visible;
                  }
                  body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.25;
                    margin: 0;
                    padding: 0;
                    color: #111;
                  }
                  .a5 {
                    width: 100%;
                    max-width: 100%;
                  }
                  .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 4mm;
                    border-bottom: 1px solid #000;
                    padding-bottom: 2mm;
                  }
                  .customer-info, .job-info {
                    flex: 1;
                    max-width: 35%;
                  }
                  .customer-id-center {
                    flex: 1;
                    text-align: center;
                    max-width: 30%;
                  }
                  .header h1 {
                    margin: 0 0 2px 0;
                    font-size: 16px;
                    color: #111;
                  }
                  .header p {
                    margin: 1px 0;
                    font-size: 16px;
                    color: #444;
                  }
                  /* Measurement Items */
                  .measurement-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 3mm;
                    padding-bottom: 2mm;
                    border-bottom: 0.5px solid #ccc;
                    gap: 3mm;
                    page-break-inside: avoid;
                    break-inside: avoid;
                    orphans: 3;
                    widows: 3;
                  }
                  .measurement-left {
                    flex: 1;
                    min-width: 0;
                    max-width: calc(100% - 45mm);
                    overflow: hidden;
                  }
                  .material-name {
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 1mm;
                    color: #111;
                  }
                  .notes {
                    font-size: 16px;
                    color: #555;
                    margin-bottom: 1mm;
                    line-height: 1.3;
                    word-wrap: break-word;
                    word-break: break-word;
                    overflow-wrap: break-word;
                    max-width: 100%;
                  }
                  .measurement-values {
                    font-size: 16px;
                    color: #333;
                    white-space: nowrap;
                    margin-top: 1mm;
                    margin-bottom: 1mm;
                  }
                  .measurement-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 3mm;
                    width: 40mm;
                    min-width: 40mm;
                    max-width: 40mm;
                    flex-shrink: 0;
                    padding-left: 2mm;
                  }
                  .cutter-stitcher {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    font-size: 16px;
                    align-items: flex-end;
                  }
                  .cutter-stitcher > div {
                    display: flex;
                    align-items: baseline;
                    white-space: nowrap;
                  }
                  .cutter-stitcher-label {
                    font-weight: 600;
                  }
                  .cutter-stitcher-line {
                    display: inline-block;
                    border-bottom: 0.5px solid #000;
                    width: 25mm;
                    height: 1em;
                    margin-left: 2mm;
                    vertical-align: baseline;
                  }
                  .footer {
                    margin-top: 6mm;
                    text-align: center;
                    font-size: 16px;
                    color: #555;
                    border-top: 0.6px solid #bbb;
                    padding-top: 3mm;
                  }
                  @media print {
                    body { 
                      -webkit-print-color-adjust: exact; 
                      print-color-adjust: exact;
                    }
                    .measurement-item { 
                      page-break-inside: avoid;
                      break-inside: avoid;
                      page-break-after: auto;
                      orphans: 3;
                      widows: 3;
                    }
                    .measurements-container {
                      page-break-inside: auto;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="a5">
                  <div class="header">
                    <div class="customer-info">
                      <h1>${jobOrder.customer_name}</h1>
                      <p>Mobile: ${jobOrder.customer_phone}</p>
                    </div>
                    <div class="customer-id-center">
                      <h1>ID: ${jobOrder.customer_id || 'N/A'}</h1>
                    </div>
                    <div class="job-info">
                      <h1>${jobOrder.job_order_number}</h1>
                      <p>Delivery: ${new Date(jobOrder.delivery_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div class="measurements-container">
                    ${measurements.map(measurement => {
                      // Combine all measurement values into a single string, remove trailing zeros
                      const formatValue = (val) => {
                        if (val === "" || val === null || val === undefined) return "";
                        const num = parseFloat(val);
                        if (isNaN(num)) return "";
                        // Convert to string and remove trailing zeros and decimal point if not needed
                        return num.toString().replace(/\.0+$/, '').replace(/(\d+\.\d*?)0+$/, '$1');
                      };
                      
                      const measurementValues = [
                        formatValue(measurement.thool),
                        formatValue(measurement.kethet),
                        formatValue(measurement.thool_kum),
                        formatValue(measurement.ardh_f_kum),
                        formatValue(measurement.jamba),
                        formatValue(measurement.ragab)
                      ].filter(val => val !== "")
                       .join(" - ");
                      
                      // Collect notes and join with hyphens
                      const notes = [
                        measurement.note1,
                        measurement.note2,
                        measurement.note3,
                        measurement.note4
                      ].filter(note => note && note.trim() !== "");
                      
                      const notesHtml = notes.length > 0 
                        ? `<div class="notes">${notes.join(" - ")}</div>`
                        : '';
                      
                      return `
                        <div class="measurement-item">
                          <div class="measurement-left">
                            <div class="material-name">${measurement.material_name || "Material"}</div>
                            <div class="measurement-values">${measurementValues || ""}</div>
                            ${notesHtml}
                          </div>
                          <div class="measurement-right">
                            <div class="cutter-stitcher">
                              <div>
                                <span class="cutter-stitcher-label">Cutter</span>
                                <span class="cutter-stitcher-line"></span>
                              </div>
                            </div>
                            <div class="cutter-stitcher">
                              <div>
                                <span class="cutter-stitcher-label">Stitcher</span>
                                <span class="cutter-stitcher-line"></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>


                </div>
                <script>
                  (function() {
                    var printIndex = ${index};
                    var printTriggered = false;
                    var dialogClosed = false;
                    var printDialogOpen = false;
                    
                    // Monitor for print dialog close
                    var afterPrint = function() {
                      if (dialogClosed) return;
                      dialogClosed = true;
                      
                      console.log('Print dialog closed detected for index ' + printIndex);
                      
                      try {
                        if (window.opener) {
                          window.opener.postMessage('printDialogClosed_' + printIndex, '*');
                        }
                      } catch(e) {
                        console.log('Could not send message to opener');
                      }
                      
                      // Don't close window - we're reusing it for multiple prints
                    };
                    
                    // Track when print is called
                    var originalPrint = window.print;
                    window.print = function() {
                      printTriggered = true;
                      printDialogOpen = true;
                      console.log('Print called for index ' + printIndex);
                      originalPrint.apply(window, arguments);
                      
                      // Set a flag that dialog is open
                      setTimeout(function() {
                        printDialogOpen = false;
                      }, 100);
                    };
                    
                    // Use afterprint event (most reliable)
                    window.addEventListener('afterprint', function() {
                      console.log('afterprint event fired for index ' + printIndex);
                      afterPrint();
                    });
                    
                    // Use beforeprint to track
                    window.addEventListener('beforeprint', function() {
                      printDialogOpen = true;
                      console.log('beforeprint event fired for index ' + printIndex);
                    });
                    
                    // Fallback: Use matchMedia for print detection
                    if (window.matchMedia) {
                      var mediaQueryList = window.matchMedia('print');
                      var handleChange = function(mql) {
                        console.log('matchMedia change: matches=' + mql.matches + ' for index ' + printIndex);
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
                    
                    // Aggressive fallback: Monitor window focus
                    var hadFocus = false;
                    var focusCheckCount = 0;
                    var focusCheckInterval = setInterval(function() {
                      try {
                        focusCheckCount++;
                        var hasFocus = window.document.hasFocus();
                        
                        // If we had focus, lost it (print dialog opened), then regained it (dialog closed)
                        if (hasFocus && !hadFocus && printTriggered && focusCheckCount > 5) {
                          // Wait a bit to confirm dialog is really closed
                          setTimeout(function() {
                            if (!dialogClosed && window.document.hasFocus()) {
                              console.log('Focus regained, dialog likely closed for index ' + printIndex);
                              afterPrint();
                            }
                          }, 800);
                        }
                        
                        hadFocus = hasFocus;
                      } catch(e) {
                        clearInterval(focusCheckInterval);
                      }
                    }, 200);
                    
                    // Cleanup after 2 minutes
                    setTimeout(function() {
                      clearInterval(focusCheckInterval);
                    }, 120000);
                  })();
                </script>
              </body>
            </html>
          `

          // STEP 4: Populate window with content (shows preview)
          console.log(`Populating window with content for ${jobOrder.job_order_number}...`)
          if (printWindow && !printWindow.closed) {
            try {
              printWindow.document.open()
              printWindow.document.write(printContent)
              printWindow.document.close()
              console.log(`✓ Content populated for ${jobOrder.job_order_number}`)
            } catch (e) {
              console.error(`❌ Error populating content for ${jobOrder.job_order_number}:`, e)
              if (printWindow && !printWindow.closed) {
                printWindow.close()
              }
              continue
            }
            
            // Wait a moment for content to render
            console.log(`Waiting for content to render for ${jobOrder.job_order_number}...`)
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Check if window is still open before printing
            if (printWindow.closed) {
              console.error(`❌ Window closed before print for ${jobOrder.job_order_number}`)
              continue
            }
            
            // STEP 5: Trigger print dialog
            console.log(`Triggering print ${i + 1} of ${jobOrderList.length}: ${jobOrder.job_order_number}`)
            try {
              printWindow.focus()
              printWindow.print()
              console.log(`✓ Print dialog triggered for ${jobOrder.job_order_number}`)
            } catch (e) {
              console.error(`❌ Error triggering print for ${jobOrder.job_order_number}:`, e)
              if (printWindow && !printWindow.closed) {
                printWindow.close()
              }
              continue
            }
            
            // STEP 6: Wait for print dialog to be closed (saved or cancelled)
            await new Promise((resolve) => {
              let resolved = false
              let checkCount = 0
              const maxChecks = 600 // 120 seconds max (600 * 200ms)
              let lastFocusState = null
              let focusStableCount = 0
              
              console.log(`Waiting for print dialog to close for ${jobOrder.job_order_number}`)
              
              // Listen for message from print window
              const messageHandler = (event) => {
                if (event.data === 'printDialogClosed_' + index && !resolved) {
                  resolved = true
                  clearInterval(checkInterval)
                  window.removeEventListener('message', messageHandler)
                  console.log(`✓ Print dialog closed (via message) for ${jobOrder.job_order_number}`)
                  resolve()
                }
              }
              window.addEventListener('message', messageHandler)
              
              // Aggressive polling to detect print dialog close
              const checkInterval = setInterval(() => {
                checkCount++
                
                try {
                  // Check if window is closed
                  if (printWindow.closed) {
                    if (!resolved) {
                      resolved = true
                      clearInterval(checkInterval)
                      window.removeEventListener('message', messageHandler)
                      console.log(`✓ Print window closed for ${jobOrder.job_order_number}`)
                      resolve()
                    }
                    return
                  }
                  
                  // Check if window has focus (indicates print dialog might be closed)
                  try {
                    const hasFocus = printWindow.document.hasFocus()
                    
                    // Track focus stability - if focus is stable for a few checks, dialog is likely closed
                    if (lastFocusState === hasFocus) {
                      focusStableCount++
                    } else {
                      focusStableCount = 0
                      lastFocusState = hasFocus
                    }
                    
                    // If window has focus and it's been stable for a while, dialog is likely closed
                    if (hasFocus && focusStableCount >= 5 && checkCount > 20) {
                      if (!resolved) {
                        resolved = true
                        clearInterval(checkInterval)
                        window.removeEventListener('message', messageHandler)
                        console.log(`✓ Print dialog closed (via focus stability) for ${jobOrder.job_order_number}`)
                        resolve()
                      }
                    }
                  } catch (e) {
                    // Can't check focus, might be cross-origin or closed
                  }
                  
                  // Timeout fallback
                  if (checkCount >= maxChecks) {
                    if (!resolved) {
                      resolved = true
                      clearInterval(checkInterval)
                      window.removeEventListener('message', messageHandler)
                      console.log(`⚠ Timeout waiting for print dialog for ${jobOrder.job_order_number}`)
                      try {
                        if (!printWindow.closed) {
                          printWindow.close()
                        }
                      } catch (e) {}
                      resolve()
                    }
                  }
                } catch (e) {
                  // Window might be closed or inaccessible
                  if (!resolved) {
                    resolved = true
                    clearInterval(checkInterval)
                    window.removeEventListener('message', messageHandler)
                    console.log(`⚠ Window check error for ${jobOrder.job_order_number}`)
                    resolve()
                  }
                }
              }, 200) // Check every 200ms
            })
            
            console.log(`✓ Completed waiting for ${jobOrder.job_order_number}, moving to next...`)
            
            console.log(`✓✓✓ Completed print ${i + 1} of ${jobOrderList.length}: ${jobOrder.job_order_number} ✓✓✓\n`)
          } else {
            console.error(`❌ Window is closed or null for ${jobOrder.job_order_number}`)
          }
        } catch (error) {
          console.error(`❌❌❌ Error printing job order ${jobOrder.job_order_number}:`, error)
          console.error(`Error stack:`, error.stack)
          // Continue with next job order even if this one fails
        }
      }
      
      console.log(`\n=== All prints completed! ===`)
      
      // Close the print window after all prints are done
      if (printWindow && !printWindow.closed) {
        try {
          printWindow.close()
          console.log(`✓ Print window closed`)
        } catch (e) {
          console.log(`Could not close print window:`, e)
        }
      }
      
      // Clear selection after all prints are completed
      setSelectedJobOrders([])
      setSelectAll(false)
      
    } catch (error) {
      console.error("Error printing measurements:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      alert(`Failed to load measurements for printing. Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("materials")}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === "materials"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Package className="w-4 h-4 mr-2" />
            <span className="font-medium">Materials</span>
          </button>
          <button
            onClick={() => setActiveTab("measurements")}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === "measurements"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Ruler className="w-4 h-4 mr-2" />
            <span className="font-medium">Job Order Measurements</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTab === "materials" ? "Materials" : "Job Order Measurements"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === "materials" ? "Manage inventory and materials" : "View job order measurements and details"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={activeTab === "materials" ? loadMaterials : loadJobOrders}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          {activeTab === "materials" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Material</span>
            </button>
          )}
          {activeTab === "measurements" && selectedJobOrders.length > 0 && (
            <button
              onClick={handleBulkPrintJobOrderMeasurements}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Selected ({selectedJobOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {activeTab === "materials" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Materials</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{materials.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeMaterials}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveMaterials}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <List className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Job Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Printer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected for Print</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedJobOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jobOrders.filter((order) => order.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jobOrders.filter((order) => order.status === "in_progress").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jobOrders.filter((order) => order.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === "materials" ? "Search materials..." : "Search job orders..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === "materials" && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Sewing">Sewing</option>
                </select>
              )}
              {activeTab === "measurements" && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                </select>
              )}
              <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Date Filters - Only show for measurements tab */}
          {activeTab === "measurements" && (
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 sm:flex-initial">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 sm:flex-initial">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => {
                  const today = getTodayDate()
                  setFromDate(today)
                  setToDate(today)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Reset to Today
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "materials" ? (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Material Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">Loading materials...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No materials found. {searchTerm && "Try adjusting your search."}
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{material.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {material.id}</div>
                        {material.is_measurement_required !== undefined && (
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                material.is_measurement_required
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {material.is_measurement_required ? "Measurement Required" : "No Measurement"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {material.material_number ? `Number: ${material.material_number}` : "No material number"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {material.is_measurement_required ? "Measurement Required" : "No measurement required"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(material.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            material.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {material.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(material.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(material)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit material"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Measurements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">Loading job orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No job orders found. {searchTerm && "Try adjusting your search."}
                    </td>
                  </tr>
                ) : (
                  filteredJobOrders.map((jobOrder) => (
                    <tr key={jobOrder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedJobOrders.includes(jobOrder.id)}
                          onChange={() => handleSelectJobOrder(jobOrder.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {jobOrder.job_order_number}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {jobOrder.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {jobOrder.customer_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{jobOrder.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {jobOrder.job_order_measurements?.length || 0} measurements
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {jobOrder.job_order_items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            jobOrder.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : jobOrder.status === "in_progress"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : jobOrder.status === "delivered"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {jobOrder.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(jobOrder.delivery_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewMeasurements(jobOrder)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View measurements"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintJobOrderMeasurements(jobOrder)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="Print measurements"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddMaterialModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMaterial}
        loading={loading}
      />

      <EditMaterialModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingMaterial(null)
        }}
        onSubmit={handleEditMaterial}
        editingMaterial={editingMaterial}
        loading={loading}
      />

      <JobOrderMeasurementModal
        open={isMeasurementModalOpen}
        onClose={() => {
          setIsMeasurementModalOpen(false)
          setSelectedJobOrder(null)
        }}
        jobOrder={selectedJobOrder}
      />
    </div>
  )
}
