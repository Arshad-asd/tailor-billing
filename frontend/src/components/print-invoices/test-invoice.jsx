export default function InvoicePage() {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white p-8 shadow-lg">
          {/* Company Name - Top Center */}
          <div className="text-center mb" dir="rtl">
            <div className="text-blue-700 font-bold text-2xl">المقرن للخياطة الرجالية</div>
          </div>

          {/* Phone Number */}
          <div className="text-center mb-0">
            <div className="text-blue-700 text-sm">
              Mobile: +974 5526 5123
            </div>
          </div>

          {/* TAX INVOICE with Tax Registration No. */}
          <div className="flex items-center gap-8 mb-0">
            <div className="flex gap-2 items-center">
              <span className="text-blue-700 text-sm">Tax Registration No.</span>
              <span className="border-b border-dotted border-gray-400 min-w-[150px]"></span>
            </div>
            <h1 className="text-2xl font-bold text-blue-700">TAX INVOICE</h1>
          </div>
  
          {/* Invoice Details */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <span className="text-blue-700 font-semibold">Inv. No.</span>
                <span className="font-semibold">1</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-blue-700">Date</span>
                <span className="text-blue-600 font-semibold border-b border-dotted border-gray-400 px-4">9/12</span>
                <span className="text-sm text-gray-500" dir="rtl">
                  التاريخ
                </span>
              </div>
            </div>
  
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center flex-1">
                <span className="text-blue-700">M/s.</span>
                <span className="border-b border-dotted border-gray-400 flex-1 relative inline-block">
                  <span
                    className="text-blue-600 font-semibold inline-block"
                    style={{ position: "relative", top: "4px" }}
                  >
                    Al kharthoum
                  </span>
                </span>
              </div>
              <div className="text-right mr-8" dir="rtl">
                <span className="text-sm text-gray-500 ml-2">السيد/السادة</span>
                <span className="text-blue-600 font-semibold">شرطون</span>
              </div>
            </div>
          </div>
  
          {/* Invoice Table */}
          <div className="border-2 border-blue-700">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-blue-700">
                  <th className="border-r-2 border-blue-700 p-2 text-sm text-blue-700 w-16">
                    <div>الرقم</div>
                    <div className="text-xs">S. No</div>
                  </th>
                  <th className="border-r-2 border-blue-700 p-2 text-sm text-blue-700">
                    <div>بلتفاصيل</div>
                    <div className="text-xs">DESCRIPTION</div>
                  </th>
                  <th className="border-r-2 border-blue-700 p-2 text-sm text-blue-700 w-20">
                    <div>العدد</div>
                    <div className="text-xs">Qty.</div>
                  </th>
                  <th className="border-r-2 border-blue-700 p-2 text-sm text-blue-700 w-20">
                    <div>السعر</div>
                    <div className="text-xs">Rate</div>
                  </th>
                  <th className="border-r-2 border-blue-700 p-2 text-sm text-blue-700 w-24">
                    <div>VAT</div>
                  </th>
                  <th className="p-2 text-sm text-blue-700 w-24">
                    <div>المبلغ</div>
                    <div className="text-xs">Amount</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr className="border-b border-blue-700">
                  <td className="border-r-2 border-blue-700 p-2 text-center text-sm">1</td>
                  <td className="border-r-2 border-blue-700 p-2">
                    <span className="text-blue-600">Shoes marqoob - made in sudan
                    </span>
                  </td>
                  <td className="border-r-2 border-blue-700 p-2 text-center text-blue-600">15</td>
                  <td className="border-r-2 border-blue-700 p-2 text-center text-blue-600">120</td>
                  <td className="border-r-2 border-blue-700 p-2"></td>
                  <td className="p-2 text-center text-blue-600">1500</td>
                </tr>
  
                {/* Row 2 */}
                <tr className="border-b border-blue-700">
                  <td className="border-r-2 border-blue-700 p-2 text-center text-sm">2</td>
                  <td className="border-r-2 border-blue-700 p-2">
                    <span className="text-blue-600">Hand stick - made in chaina
                    </span>
                  </td>
                  <td className="border-r-2 border-blue-700 p-2 text-center text-blue-600">10</td>
                  <td className="border-r-2 border-blue-700 p-2 text-center text-blue-600">70</td>
                  <td className="border-r-2 border-blue-700 p-2"></td>
                  <td className="p-2 text-center text-blue-600">700</td>
                </tr>
  
                {/* Row 3 */}
                <tr className="border-b border-blue-700">
                  <td className="border-r-2 border-blue-700 p-2 text-center text-sm">3</td>
                  <td className="border-r-2 border-blue-700 p-2">
                    <span className="text-blue-600">Footware - made in sudan</span>
                  </td>
                  <td className="border-r-2 border-blue-700 p-2 text-center text-blue-600">5</td>
                  <td className="border-r-2 border-blue-700 p-2 text-center text-blue-600">60</td>
                  <td className="border-r-2 border-blue-700 p-2"></td>
                  <td className="p-2 text-center text-blue-600">300</td>
                </tr>
  

  
                {/* Empty rows */}
                {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num, idx) => (
                  <tr key={idx} className="border-b border-blue-700">
                    <td className="border-r-2 border-blue-700 p-2 text-center text-sm text-blue-700">{num}</td>
                    <td className="border-r-2 border-blue-700 p-4"></td>
                    <td className="border-r-2 border-blue-700 p-4"></td>
                    <td className="border-r-2 border-blue-700 p-4"></td>
                    <td className="border-r-2 border-blue-700 p-4"></td>
                    <td className="p-4"></td>
                  </tr>
                ))}
  
                <tr className="border-b-2 border-blue-700">
                  <td className="border-r-2 border-blue-700 p-2 text-center text-sm text-blue-700">16</td>
                  <td className="border-r-2 border-blue-700 p-2"></td>
                  <td className="border-r-2 border-blue-700 p-2"></td>
                  <td className="border-r-2 border-blue-700 p-2"></td>
                  <td className="border-r-2 border-blue-700 p-2"></td>
                  <td className="p-2"></td>
                </tr>

                {/* Summary Section - Inside Table */}
                {/* <tr>
                  <td colSpan="4" className="border-r-2 border-blue-700 p-2"></td>
                  <td className="border-r-2 border-blue-700 p-2 text-blue-700 font-semibold">Sub Total</td>
                  <td className="p-2 text-blue-600 font-semibold text-right border-b border-dotted border-gray-400">2381</td>
                </tr> */}
                {/* <tr>
                  <td colSpan="4" className="border-r-2 border-blue-700 p-2"></td>
                  <td className="border-r-2 border-blue-700 p-2 text-blue-700 font-semibold">VAT 5%</td>
                  <td className="p-2 text-blue-600 font-semibold text-right border-b border-dotted border-gray-400">119</td>
                </tr> */}
                <tr className="border-t-2 border-blue-700">
                  <td colSpan="4" className="border-r-2 border-blue-700 p-2"></td>
                  <td className="border-r-2 border-blue-700 p-2 text-blue-700 font-bold text-lg">Total</td>
                  <td className="p-2 text-blue-600 font-bold text-xl text-right border-b border-dotted border-gray-400">2500</td>
                </tr>
              </tbody>
            </table>
  
          </div>

          {/* Signatures */}
          <div className="mt-6 flex justify-between">
            <div className="flex items-center gap-4">
              <span className="text-blue-700">Rec. Signature</span>
              <div className="border-b border-blue-600 w-32 h-8"></div>
              <span className="text-sm text-gray-500">توقيع المستلم</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-blue-700">Signature</span>
              <div className="border-b border-blue-600 w-32 h-8"></div>
              <span className="text-sm text-gray-500" dir="rtl">
                التوقيع
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  