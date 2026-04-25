import { useState } from "react";
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const SCANS = [
  { id: "dup_parts",       label: "Duplicate APP Part Numbers",          risk: "error",   count: 4   },
  { id: "dup_suppliers",   label: "Duplicate Suppliers",                 risk: "warning", count: 1   },
  { id: "dup_customers",   label: "Duplicate Customers",                 risk: "warning", count: 2   },
  { id: "miss_cost",       label: "Missing Cost Price",                  risk: "error",   count: 12  },
  { id: "miss_sell",       label: "Missing Sell Price",                  risk: "error",   count: 8   },
  { id: "miss_gst",        label: "Missing GST Code",                    risk: "error",   count: 5   },
  { id: "miss_abn",        label: "Missing ABN (Customers/Suppliers)",   risk: "warning", count: 14  },
  { id: "miss_email",      label: "Missing Email Address",               risk: "warning", count: 7   },
  { id: "neg_stock",       label: "Negative Stock Quantity",             risk: "error",   count: 0   },
  { id: "inactive_stock",  label: "Inactive Parts With Stock On Hand",   risk: "warning", count: 3   },
  { id: "no_terms_cust",   label: "Customers Without Trading Terms",     risk: "warning", count: 6   },
  { id: "no_terms_supp",   label: "Suppliers Without Payment Terms",     risk: "warning", count: 2   },
  { id: "unmatched_bank",  label: "Unmatched Bank Transactions",         risk: "warning", count: 23  },
  { id: "unmapped_coa",    label: "Unmapped Chart of Accounts",          risk: "error",   count: 3   },
  { id: "old_draft_inv",   label: "Draft Invoices Older Than 30 Days",   risk: "warning", count: 4   },
  { id: "old_draft_po",    label: "Draft POs Older Than 30 Days",        risk: "warning", count: 2   },
  { id: "dup_gen_part",    label: "Duplicate Genuine Part Numbers",      risk: "warning", count: 7   },
];

const RISK_COLORS = {
  error:   { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30",    icon: XCircle },
  warning: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", icon: AlertTriangle },
  ok:      { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30",  icon: CheckCircle2 },
};

export default function DataQualityCleanup() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(true);
  const [merged, setMerged] = useState([]);

  const errorCount = SCANS.filter(s => s.risk === "error" && s.count > 0).length;
  const warnCount  = SCANS.filter(s => s.risk === "warning" && s.count > 0).length;
  const okCount    = SCANS.filter(s => s.count === 0).length;

  const totalIssues = SCANS.reduce((a, s) => a + s.count, 0);
  const healthScore = Math.max(0, Math.round(100 - (totalIssues / 3)));

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setScanned(true); }, 1500);
  };

  const handleFix = (id) => setMerged(prev => [...prev, id]);

  const healthColor = healthScore >= 80 ? "text-primary" : healthScore >= 55 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Data Quality & Cleanup</h2>
        <Button onClick={handleScan} disabled={scanning} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          {scanning ? "Scanning..." : "Run Data Scan"}
        </Button>
      </div>

      {/* Score */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4">
          <div className="text-[10px] font-heading uppercase tracking-widest text-white/30 mb-1">Data Health</div>
          <div className={`font-heading text-3xl font-bold ${healthColor}`}>{healthScore}%</div>
          <div className="text-[10px] text-white/20 mt-1">Overall quality score</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4">
          <div className="text-[10px] font-heading uppercase tracking-widest text-red-400/60 mb-1">Errors</div>
          <div className="font-heading text-3xl font-bold text-red-400">{errorCount}</div>
          <div className="text-[10px] text-red-400/40 mt-1">Issues requiring attention</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-sm p-4">
          <div className="text-[10px] font-heading uppercase tracking-widest text-yellow-400/60 mb-1">Warnings</div>
          <div className="font-heading text-3xl font-bold text-yellow-400">{warnCount}</div>
          <div className="text-[10px] text-yellow-400/40 mt-1">Issues to review</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-sm p-4">
          <div className="text-[10px] font-heading uppercase tracking-widest text-primary/60 mb-1">Passed</div>
          <div className="font-heading text-3xl font-bold text-primary">{okCount}</div>
          <div className="text-[10px] text-primary/40 mt-1">No issues detected</div>
        </div>
      </div>

      {scanned && (
        <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
          <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)]">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Scan Results</p>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
              {["Issue","Issues Found","Severity","Action"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-[hsl(0,0%,14%)]">
              {SCANS.map(scan => {
                const c = scan.count === 0 ? RISK_COLORS.ok : RISK_COLORS[scan.risk];
                const Icon = scan.count === 0 ? CheckCircle2 : c.icon;
                const fixed = merged.includes(scan.id);
                return (
                  <tr key={scan.id} className={`hover:bg-[hsl(0,0%,11%)] ${fixed ? "opacity-40" : ""}`}>
                    <td className="px-4 py-3 text-white">{scan.label}</td>
                    <td className="px-4 py-3">
                      <span className={`font-heading font-bold ${scan.count === 0 ? "text-primary" : c.text}`}>{fixed ? "Fixed" : scan.count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[10px] font-heading uppercase ${scan.count === 0 ? "text-primary" : c.text}`}>
                        <Icon className="w-3 h-3" />
                        {scan.count === 0 ? "OK" : scan.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!fixed && scan.count > 0 && (
                        <div className="flex gap-1.5">
                          {scan.id.startsWith("dup") && (
                            <button onClick={() => handleFix(scan.id)}
                              className="px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20">
                              Merge
                            </button>
                          )}
                          <button onClick={() => handleFix(scan.id)}
                            className="px-2 py-1 rounded-sm text-[10px] font-heading uppercase bg-[hsl(0,0%,14%)] text-white/50 border border-[hsl(0,0%,22%)] hover:text-white">
                            View & Fix
                          </button>
                        </div>
                      )}
                      {(fixed || scan.count === 0) && (
                        <span className="flex items-center gap-1 text-[10px] text-primary font-heading uppercase"><CheckCircle2 className="w-3 h-3" /> Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!scanned && (
        <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 font-heading uppercase text-sm">Run a scan to check data quality</p>
        </div>
      )}
    </div>
  );
}