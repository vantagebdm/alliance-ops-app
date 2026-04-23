import { useEffect, useRef } from "react";
import { X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ReorderPDFModal({ supplier_name, lines, onClose }) {
  const previewRef = useRef(null);

  const subtotal = lines.reduce((s, l) => s + (l.total || l.quantity * l.unit_cost), 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;
  const today = new Date().toLocaleDateString("en-AU");

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Header block
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PURCHASE ORDER", 14, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text("ALLIANCE PRIORITY PARTS", 14, 19);
    doc.text(`Date: ${today}`, 14, 24);

    // Supplier block
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("SUPPLIER", 14, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(supplier_name, 14, 44);

    // Status tag
    doc.setFillColor(230, 255, 230);
    doc.roundedRect(150, 33, 46, 14, 2, 2, "F");
    doc.setTextColor(30, 120, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("DRAFT", 173, 39, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text("Auto-generated · Low Stock", 173, 44, { align: "center" });

    // Line items table
    const tableData = lines.map(l => [
      l.app_part_number || "—",
      l.part_number,
      l.description,
      l.quantity,
      `$${(l.unit_cost || 0).toFixed(2)}`,
      `$${(l.total || l.quantity * l.unit_cost || 0).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 54,
      head: [["APP #", "Part #", "Description", "Qty", "Unit Cost", "Total"]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 22, font: "courier" },
        1: { cellWidth: 25, font: "courier" },
        2: { cellWidth: 80 },
        3: { cellWidth: 12, halign: "center" },
        4: { cellWidth: 22, halign: "right" },
        5: { cellWidth: 22, halign: "right", fontStyle: "bold" },
      },
      alternateRowStyles: { fillColor: [248, 248, 248] },
    });

    const finalY = doc.lastAutoTable.finalY + 6;

    // Totals
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Subtotal (ex GST)", 140, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, 196, finalY, { align: "right" });
    doc.text("GST (10%)", 140, finalY + 6);
    doc.text(`$${gst.toFixed(2)}`, 196, finalY + 6, { align: "right" });

    doc.setFillColor(30, 30, 30);
    doc.rect(133, finalY + 9, 67, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL (inc GST)", 136, finalY + 16);
    doc.text(`$${total.toFixed(2)}`, 196, finalY + 16, { align: "right" });

    // Footer note
    doc.setTextColor(140, 140, 140);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("This purchase order was auto-generated from Alliance Priority Parts ERP · Low Stock Replenishment", 14, 285);

    doc.save(`PO-DRAFT_${supplier_name.replace(/\s+/g, "_")}_${today.replace(/\//g, "-")}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[hsl(0,0%,8%)] px-5 py-3 flex items-center justify-between rounded-t-sm flex-shrink-0">
          <div>
            <h2 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Purchase Order Preview</h2>
            <p className="text-white/50 text-[11px] mt-0.5">{supplier_name}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="bg-white rounded shadow-md p-6 max-w-xl mx-auto text-xs text-gray-700 font-mono">
            {/* PO Header */}
            <div className="bg-gray-900 text-white px-4 py-3 rounded-sm mb-4">
              <div className="font-bold text-base tracking-wider">PURCHASE ORDER</div>
              <div className="text-gray-400 text-[10px] mt-0.5">ALLIANCE PRIORITY PARTS · {today}</div>
            </div>

            <div className="mb-3">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider font-sans mb-0.5">Supplier</div>
              <div className="font-bold text-sm font-sans">{supplier_name}</div>
              <div className="text-[10px] text-gray-500 font-sans mt-0.5">DRAFT · Auto-generated from low stock replenishment</div>
            </div>

            {/* Lines */}
            <table className="w-full mb-4 border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white text-[9px]">
                  <th className="text-left px-2 py-1">APP #</th>
                  <th className="text-left px-2 py-1">Part #</th>
                  <th className="text-left px-2 py-1">Description</th>
                  <th className="text-center px-2 py-1">Qty</th>
                  <th className="text-right px-2 py-1">Cost</th>
                  <th className="text-right px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-2 py-1 text-primary">{l.app_part_number || "—"}</td>
                    <td className="px-2 py-1">{l.part_number}</td>
                    <td className="px-2 py-1 font-sans">{l.description}</td>
                    <td className="px-2 py-1 text-center">{l.quantity}</td>
                    <td className="px-2 py-1 text-right">${(l.unit_cost || 0).toFixed(2)}</td>
                    <td className="px-2 py-1 text-right font-bold">${(l.total || l.quantity * l.unit_cost || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex flex-col items-end gap-1 text-[10px] font-sans">
              <div className="flex gap-8 text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex gap-8 text-gray-500"><span>GST (10%)</span><span>${gst.toFixed(2)}</span></div>
              <div className="flex gap-8 bg-gray-900 text-white font-bold px-3 py-1.5 rounded-sm mt-1 text-xs">
                <span>TOTAL (inc GST)</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-sm font-heading text-xs uppercase tracking-wider">Close</Button>
          <Button onClick={generatePDF} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Printer className="w-4 h-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}