

  function formatDateDMY(input) {
    if (!input) return "N/A"
    const d = new Date(input)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }
  
  function fix2(n) {
    return Number(n ?? 0).toFixed(2)
  }
  
  /**
   * Build print-ready HTML that corresponds to the provided image:
   * - Exact A5 portrait sheet in mm
   * - Header, dual-column meta, large bordered panel with table + totals + delivery date
   * - Bottom working hours line
   */
  export function buildA5TailorInvoiceHTML(data) {
    const items = (
      data.items && data.items.length
        ? data.items
        : [{ description: data.notes || "خدمة خياطة", qty: 1, unitPrice: Number(data.total ?? 0) }]
    ).slice(0, 1) // photo shows mainly one filled row; keep to 1 to match, rest blank
  
    const total = Number(data.total ?? (items[0]?.unitPrice ?? 0) * (items[0]?.qty ?? 1))
    const deposit = Number(data.deposit ?? 0)
    const balance = Number(data.balance ?? total - deposit)
  
    // Generate up to 4 additional blank rows to mirror the photographed table spacing
    const blankRows = Array.from({ length: Math.max(0, 4 - items.length) })
      .map(() => `<tr><td>&nbsp;</td><td class="c">&nbsp;</td><td class="c">&nbsp;</td><td class="c">&nbsp;</td></tr>`)
      .join("")
  
    const itemsRows = items
      .map((it) => {
        const lineTotal = (it.qty ?? 0) * (it.unitPrice ?? 0)
        return `
        <tr>
          <td>${it.description || ""}</td>
          <td class="c">${it.qty ?? ""}</td>
          <td class="c">${fix2(it.unitPrice)}</td>
          <td class="c">${fix2(lineTotal)}</td>
        </tr>
      `
      })
      .join("")
  
    const saleNo = data.sale_number ?? data.id ?? ""
    const custId = data.customer_id ?? data.id ?? ""
    const dateStr = formatDateDMY(data.date)
    const deliveryStr = formatDateDMY(data.deliveryDate || data.date)
    const companyNameAr = data.company_name_ar ?? "أم د رمان للخياطة والأقمشة السودانية"
    const companyNameEn = data.company_name ?? "Kharthoum"
  
    return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8" />
    <title>فاتورة - ${saleNo}</title>
    <style>
      /* PAGE SETUP */
      @page { size: A5 portrait; margin: 0; }
      html, body { height: 100%; }
      body {
        margin: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        font-family: Tahoma, Arial, "Segoe UI", "Noto Kufi Arabic", sans-serif;
        color: #000;
      }
      .sheet {
        width: 148mm;
        height: 210mm;
        box-sizing: border-box;
        padding: 8mm 10mm 6mm; /* close to photographed inner margins */
        margin: 0 auto;
      }
  
      /* HEADER */
      .header {
        position: relative;
        text-align: center;
        margin-bottom: 4mm;
      }
      .since {
        position: absolute;
        left: 0;
        top: 0;
        font-size: 9px;
        color: #666;
        letter-spacing: 0.5px;
      }
      .shop {
        font-weight: 700;
        font-size: 14px;
        margin-bottom: 1mm;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4mm;
      }
      .shop-ar {
        text-align: right;
        flex: 1;
      }
      .shop-en {
        text-align: left;
        flex: 1;
        direction: ltr;
      }
      .city {
        font-size: 12px;
        color: #222;
      }
      .phone {
        position: absolute;
        right: 0;
        top: 0;
        font-size: 11px;
        color: #222;
      }
      .title {
        text-align: center;
        margin-top: 3mm;
        font-size: 14px;
        font-weight: 700;
      }
  
      /* META (TOP LINES) */
      .meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4mm;
        margin: 5mm 0 4mm;
        font-size: 11px;
      }
      .meta .left, .meta .right { line-height: 1.6; }
      .meta b { font-weight: 700; }
  
      /* LARGE BORDERED PANEL */
      .panel {
        border: 1px solid #000;
        padding: 4mm;
        min-height: 125mm; /* to visually match the big rectangle height in photo */
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
  
      /* TABLE */
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        margin-bottom: 10mm;
      }
      thead th {
        border: 1px solid #000;
        background: #f5f5f5;
        font-weight: 700;
        padding: 2.5mm 2mm;
      }
      td {
        border: 1px solid #000;
        padding: 2.5mm 2mm;
        vertical-align: middle;
      }
      /* Column widths to match the image proportions */
      .col-details { width: 52%; }
      .col-qty { width: 12%; }
      .col-unit { width: 18%; }
      .col-amount { width: 18%; }
  
      .c { text-align: center; }
  
      /* TOTALS AND DELIVERY */
      .bottom-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6mm;
        align-items: start;
      }
      .totals {
        /* lower-left stack like the photo */
        display: inline-block;
        line-height: 1.8;
        font-size: 11px;
      }
      .totals b { display: inline-block; min-width: 20mm; }
      .delivery {
        text-align: right;
        font-size: 11px;
        align-self: start;
      }
  
      /* WORKING HOURS AT THE VERY BOTTOM */
      .hours {
        margin-top: auto;
        text-align: center;
        font-size: 10px;
        color: #444;
        border-top: 1px solid #bbb;
        padding-top: 3mm;
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <div class="since">SINCE 1981</div>
        <div class="shop">
          <span class="shop-ar">${companyNameAr}</span>
          ${companyNameEn ? `<span class="shop-en">${companyNameEn}</span>` : ''}
        </div>
        <div class="city">الدوحة</div>
        <div class="phone">جوال: 50715161</div>
        <div class="title">فاتورة الخياطة</div>
      </div>
  
      <div class="meta">
        <div class="left">
          <div><b>الرقم فاتورة:</b> ${saleNo}</div>
          <div><b>التاريخ:</b> ${dateStr}</div>
        </div>
        <div class="right" style="text-align:right">
          <div><b>رقم العميل:</b> ${custId}</div>
          <div><b>اسم الزبون:</b> ${data.customer_name ?? ""}${data.customer_phone ? " - " + data.customer_phone : ""}</div>
        </div>
      </div>
  
      <div class="panel">
        <table>
          <thead>
            <tr>
              <th class="col-details">التفاصيل</th>
              <th class="col-qty c">كمية</th>
              <th class="col-unit c">سعر الوحدة</th>
              <th class="col-amount c">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
            ${blankRows}
          </tbody>
        </table>
  
        <div class="bottom-row">
          <div class="totals">
            <div><b>المجموع:</b> ${fix2(total)}</div>
            <div><b>مقدماً:</b> ${fix2(deposit)}</div>
            <div><b>الباقي:</b> ${fix2(balance)}</div>
          </div>
          <div class="delivery">
            <b>تاريخ تسليم:</b> ${deliveryStr}
          </div>
        </div>
  
        <div class="hours">
          ساعات العمل: صباحا من 08:30 الي 01:00 / مساءا من 04:00 الي 10:00 / الجمعة من 04:00 الي 10:00
        </div>
      </div>
    </div>
  </body>
  </html>
    `
  }
  