import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const csvCell = (value) => {
  let text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (typeof value === "string" && /^(?:[\t\r\n]|\s*[=+\-@])/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export default function PartsMasterExport() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const exportAll = async () => {
    setBusy(true);
    setMessage("");
    try {
      const rows = [];
      let cursor;
      do {
        const page = await base44.entities.Part.list({ sort: "id", limit: 100, ...(cursor ? { cursor } : {}) });
        rows.push(...page.items);
        setMessage(`Preparing ${rows.length} parts…`);
        if (page.has_more && (!page.next_cursor || page.next_cursor === cursor)) throw new Error("Could not retrieve all parts. Please try again.");
        cursor = page.has_more ? page.next_cursor : null;
      } while (cursor);
      if (!rows.length) { setMessage("No parts available to export."); return; }
      const fields = new Set(rows.flatMap(row => Object.keys(row)));
      const first = ["app_part_number", "part_number", "name", "description", "supplier_sku"];
      const columns = [...first.filter(key => fields.has(key)), ...[...fields].filter(key => !first.includes(key)).sort()];
      const csv = [columns, ...rows.map(row => columns.map(key => row[key]))].map(row => row.map(csvCell).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `parts-master-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`Exported ${rows.length} parts.`);
    } catch (error) { setMessage(error.message || "Export failed. Please try again."); }
    finally { setBusy(false); }
  };
  return <div className="flex flex-col items-end gap-1">
    <Button variant="outline" onClick={exportAll} disabled={busy} title="Download every accessible part and all saved fields as CSV, regardless of current filters" className="rounded-sm font-heading text-xs uppercase tracking-wider">
      {busy ? <Loader2 className="animate-spin" /> : <Download />} {busy ? "Exporting…" : "Export All Parts"}
    </Button>
    {message && <span role="status" className="max-w-64 text-xs text-muted-foreground">{message}</span>}
  </div>;
}