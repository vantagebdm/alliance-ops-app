import { useState } from "react";
import { Plus, Download, Trash2, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TEMPLATES = [
  { id: 1, name: "Parts Master Import",       type: "Parts",        columns: 14, lastUsed: "Today" },
  { id: 2, name: "Supplier Price List",        type: "Supplier",     columns: 8,  lastUsed: "Yesterday" },
  { id: 3, name: "Customer Import",            type: "Customer",     columns: 12, lastUsed: "Apr 20" },
  { id: 4, name: "Inventory Stocktake",        type: "Inventory",    columns: 6,  lastUsed: "Apr 18" },
  { id: 5, name: "ANZ Bank Statement",         type: "Bank",         columns: 5,  lastUsed: "Apr 15" },
  { id: 6, name: "Payroll Employee List",      type: "Payroll",      columns: 10, lastUsed: "Apr 10" },
  { id: 7, name: "Chart of Accounts",          type: "Accounting",   columns: 7,  lastUsed: "Apr 5" },
];

const TYPE_COLORS = {
  Parts: "bg-primary/10 text-primary border-primary/20",
  Supplier: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Customer: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Inventory: "bg-green-500/10 text-green-400 border-green-500/20",
  Bank: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Payroll: "bg-red-500/10 text-red-400 border-red-500/20",
  Accounting: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const DOWNLOADABLE = [
  "Parts Master", "Inventory Quantities", "Suppliers", "Customers",
  "Supplier Price List", "Bank Transactions", "Payroll Employees",
  "Chart of Accounts", "Opening Balances", "Stocktake Count",
];

const SAMPLE_FIELDS = {
  "Parts Master":        ["APP Part Number", "Part Number", "Description", "Category", "Brand", "Make", "Model", "Cost Price", "Sell Price", "GST Code", "Unit of Measure", "Min Stock", "Supplier", "Status"],
  "Inventory Quantities":["Part Number", "Warehouse", "Bin", "Quantity", "Unit Cost", "Stock Category"],
  "Suppliers":           ["Supplier Name", "ABN", "Email", "Phone", "Payment Terms", "Account Number", "Address", "City", "State", "Postcode"],
  "Customers":           ["Customer Name", "ABN", "Email", "Phone", "Trading Terms", "Credit Limit", "Pricing Tier", "Account Manager", "Address"],
};

export default function DataMapping() {
  const [templates, setTemplates] = useState(TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDownload, setSelectedDownload] = useState("Parts Master");
  const [showFields, setShowFields] = useState(false);

  const handleDelete = (id) => setTemplates(prev => prev.filter(t => t.id !== id));

  return (
    <div className="space-y-4 max-w-5xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Data Mapping & Templates</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Templates list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Mapping Templates</h3>
            <Button onClick={() => alert("Create new template wizard")} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Template
            </Button>
          </div>
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                  {["Template Name", "Type", "Columns", "Last Used", "Actions"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {templates.map(t => (
                  <tr key={t.id} className={`hover:bg-[hsl(0,0%,11%)] cursor-pointer ${selectedTemplate?.id === t.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedTemplate(t)}>
                    <td className="px-4 py-3 text-white font-semibold">{t.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${TYPE_COLORS[t.type] || ""}`}>{t.type}</span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{t.columns} cols</td>
                    <td className="px-4 py-3 text-white/40">{t.lastUsed}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <button className="p-1 text-white/30 hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button className="p-1 text-white/30 hover:text-primary"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Column map preview */}
          {selectedTemplate && (
            <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-3">
              <h3 className="font-heading text-xs uppercase tracking-wider text-white/40">Column Mapping — {selectedTemplate.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                {(SAMPLE_FIELDS[selectedTemplate.name.split(" ").slice(0, 2).join(" ")] || SAMPLE_FIELDS["Parts Master"]).slice(0, 6).map((field, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,20%)] rounded-sm p-2.5">
                    <div className="flex-1 text-[10px] text-white/50 font-heading uppercase">CSV Column {i + 1}</div>
                    <div className="text-white/20 text-xs">→</div>
                    <div className="flex-1">
                      <select className="w-full bg-[hsl(0,0%,16%)] border border-[hsl(0,0%,25%)] text-white text-[10px] rounded-sm px-2 py-1">
                        <option>{field}</option>
                        <option>— Ignore —</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Mapping
                </Button>
                <Button variant="outline" className="rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">Auto-Detect</Button>
              </div>
            </div>
          )}
        </div>

        {/* Download Templates */}
        <div className="space-y-3">
          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-4">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Download Sample Templates</p>
            <p className="text-[10px] text-white/30">Use these templates as a starting point for your imports.</p>
            <Select value={selectedDownload} onValueChange={setSelectedDownload}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                {DOWNLOADABLE.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            {SAMPLE_FIELDS[selectedDownload] && (
              <div className="space-y-1">
                <p className="text-[10px] font-heading uppercase tracking-wider text-white/20 mb-1">Columns included:</p>
                {SAMPLE_FIELDS[selectedDownload].map(f => (
                  <div key={f} className="text-[10px] text-white/50 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary" /> {f}
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <Download className="w-3.5 h-3.5 mr-1" /> Download CSV Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}