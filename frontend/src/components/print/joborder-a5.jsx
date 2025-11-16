"use client"

import { useMemo } from "react"

function formatMoney(n) {
  const num = Number(n || 0)
  return num.toFixed(2)
}

// Numeric cell helper to keep numbers LTR but still right-aligned visually
function Num({ children }) {
  return (
    <span dir="ltr" style={{ unicodeBidi: "bidi-override" }}>
      {children}
    </span>
  )
}

/**
 * JobOrderA5
 * Renders a single A5-sized tailoring invoice for printing.
 *
 * Props:
 * - order: {
 *     invoiceNumber, date, customerNumber,
 *     customerName, customerPhone,
 *     items: [{ description, qty, unitPrice }],
 *     totals: { total, advance, balance },
 *     deliveryDate
 *   }
 * - showPrintButton?: boolean
 *
 * Notes:
 * - Uses precise mm measurements and @page A5 for exact print output.
 * - Direction is RTL for Arabic labels; numbers are forced LTR.
 */
export default function JobOrderA5({ order, showPrintButton = true }) {
  const {
    invoiceNumber = "",
    date = "",
    customerNumber = "",
    customerName = "",
    customerPhone = "",
    items = [],
    totals = {},
    deliveryDate = "",
  } = order || {}

  const computed = useMemo(() => {
    const rows = items.length
      ? items
      : [
          // Fallback example row if no items are provided
          { description: "جلاليب", qty: 1, unitPrice: 120 },
        ]

    const sum = rows.reduce((acc, r) => acc + Number(r.qty || 0) * Number(r.unitPrice || 0), 0)
    const total = totals.total != null ? Number(totals.total) : sum
    const advance = totals.advance != null ? Number(totals.advance) : 0
    const balance = totals.balance != null ? Number(totals.balance) : total - advance

    return { rows, total, advance, balance }
  }, [items, totals])

  return (
    <div className="a5-wrapper">
      {showPrintButton && (
        <div className="controls no-print">
          <button onClick={() => window.print()} className="btn-print">
            طباعة
          </button>
        </div>
      )}

      <section className="a5-sheet" role="document" aria-label="فاتورة الخياطة">
        {/* Header */}
        <header className="hdr" dir="rtl">
          <div className="hdr-top">
            <div className="left small">SINCE 1987</div>
            <div className="center brand">أم درمان للخياطة والأقمشة السودانية - الدوحة</div>
            <div className="right small">
              <span>جوال:</span> <Num>50715161</Num>
            </div>
          </div>

          <div className="row meta">
            <div className="cell">
              <span>الرقم فاتورة:</span>{" "}
              <strong>
                <Num>{invoiceNumber}</Num>
              </strong>
            </div>
            <div className="cell center title">فاتورة الخياطة</div>
            <div className="cell left">
              <span>التاريخ:</span>{" "}
              <strong>
                <Num>{date}</Num>
              </strong>
            </div>
          </div>

          <div className="row submeta">
            <div className="cell">
              <span>اسم الزبون:</span> <strong>{customerName}</strong>{" "}
              {customerPhone ? (
                <>
                  - <Num>{customerPhone}</Num>
                </>
              ) : null}
            </div>
            <div className="cell right">
              <span>رقم العميل:</span>{" "}
              <strong>
                <Num>{customerNumber}</Num>
              </strong>
            </div>
          </div>
        </header>

        {/* Table */}
        <main className="tbl" dir="rtl">
          <table className="items">
            <thead>
              <tr>
                <th className="col-details">التفاصيل</th>
                <th className="col-qty">كمية</th>
                <th className="col-unit">سعر الوحدة</th>
                <th className="col-amt">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {computed.rows.map((row, idx) => {
                const qty = Number(row.qty || 0)
                const unit = Number(row.unitPrice || 0)
                const amt = qty * unit
                return (
                  <tr key={idx}>
                    <td className="col-details">{row.description || ""}</td>
                    <td className="col-qty">
                      <Num>{qty}</Num>
                    </td>
                    <td className="col-unit">
                      <Num>{formatMoney(unit)}</Num>
                    </td>
                    <td className="col-amt">
                      <Num>{formatMoney(amt)}</Num>
                    </td>
                  </tr>
                )
              })}

              {/* Spacer rows to resemble the photographed blank area */}
              {Array.from({ length: Math.max(6 - computed.rows.length, 0) }).map((_, i) => (
                <tr key={`sp-${i}`}>
                  <td className="col-details">&nbsp;</td>
                  <td className="col-qty">&nbsp;</td>
                  <td className="col-unit">&nbsp;</td>
                  <td className="col-amt">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Delivery Date */}
          <div className="totals">
            <div className="delivery">
              <span>تاريخ تسليم:</span>{" "}
              <strong>
                <Num>{deliveryDate}</Num>
              </strong>
            </div>
            <div className="sum">
              <div className="row">
                <div className="label">المجموع:</div>
                <div className="value">
                  <Num>{formatMoney(computed.total)}</Num>
                </div>
              </div>
              <div className="row">
                <div className="label">مقدماً:</div>
                <div className="value">
                  <Num>{formatMoney(computed.advance)}</Num>
                </div>
              </div>
              <div className="row">
                <div className="label">الباقي:</div>
                <div className="value">
                  <Num>{formatMoney(computed.balance)}</Num>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="ftr" dir="rtl">
          <div className="hours">
            <span>ساعات العمل:</span> صباحاً من <Num>08:30</Num> الى <Num>01:00</Num> مساءً من <Num>04:00</Num> الى{" "}
            <Num>10:00</Num> / الجمعة من <Num>04:00</Num> الى <Num>10:00</Num>
          </div>
        </footer>
      </section>

      {/* Styles */}
      <style jsx global>{`
        /* Print setup */
        @page {
          size: A5 portrait;
          margin: 8mm;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .a5-sheet {
            border: none;
            box-shadow: none;
            margin: 0;
            width: auto;
            height: auto;
          }
        }

        /* Screen preview wrapper */
        .a5-wrapper {
          display: grid;
          justify-content: center;
          padding: 16px;
          background: #f3f4f6;
        }
        .controls {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }
        .btn-print {
          background: #0f766e;
          color: #fff;
          border: 0;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-print:hover {
          background: #115e59;
        }

        /* A5 canvas */
        .a5-sheet {
          width: 148mm;
          height: 210mm;
          background: #fff;
          color: #111827;
          border: 1px solid #d1d5db;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
          padding: 8mm;
          display: flex;
          flex-direction: column;
          font-family: "Noto Naskh Arabic", "Tahoma", "Segoe UI", Arial, sans-serif;
        }

        /* Header */
        .hdr {
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 4mm;
          margin-bottom: 4mm;
        }
        .hdr-top {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          align-items: center;
          margin-bottom: 2mm;
        }
        .hdr .brand {
          font-weight: 700;
          text-align: center;
          font-size: 14pt;
        }
        .hdr .small {
          font-size: 9pt;
          color: #4b5563;
        }
        .hdr .left {
          text-align: left;
        }
        .hdr .right {
          text-align: right;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 4mm;
          align-items: center;
          margin-top: 2mm;
          font-size: 10.5pt;
        }
        .row .cell {
          text-align: right;
        }
        .row .cell.left {
          text-align: left;
        }
        .row .cell.center {
          text-align: center;
        }
        .row.meta .title {
          font-weight: 700;
          font-size: 12pt;
        }
        .submeta {
          grid-template-columns: 2fr 1fr;
        }

        /* Table */
        .tbl {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        table.items {
          width: 100%;
          border: 1px solid #9ca3af;
          border-collapse: collapse;
          font-size: 10.5pt;
          table-layout: fixed;
        }
        table.items th,
        table.items td {
          border: 1px solid #9ca3af;
          padding: 6px 8px;
          vertical-align: middle;
        }
        table.items thead th {
          background: #f3f4f6;
          font-weight: 700;
          text-align: right;
        }
        .col-details { width: 55%; }
        .col-qty { width: 15%; text-align: center; }
        .col-unit { width: 15%; text-align: right; }
        .col-amt { width: 15%; text-align: right; }

        /* Totals area */
        .totals {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6mm;
          margin-top: 6mm;
        }
        .delivery {
          align-self: end;
          font-size: 11pt;
        }
        .sum {
          justify-self: end;
          min-width: 45mm;
          font-size: 11pt;
        }
        .sum .row {
          grid-template-columns: auto 1fr;
          gap: 6mm;
          margin: 0;
        }
        .sum .label {
          text-align: right;
        }
        .sum .value {
          text-align: right;
          min-width: 30mm;
        }

        /* Footer */
        .ftr {
          border-top: 1px solid #d1d5db;
          margin-top: 6mm;
          padding-top: 3mm;
          font-size: 9.5pt;
          color: #374151;
        }
        .hours {
          text-align: center;
        }
      `}</style>
    </div>
  )
}
