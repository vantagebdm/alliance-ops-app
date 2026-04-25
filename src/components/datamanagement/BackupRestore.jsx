import { useState } from "react";
import { HardDrive, Download, Trash2, RotateCcw, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKUP_TYPES = ["Full System Backup", "Accounting Only", "Inventory Only", "Customer / Supplier", "Payroll Backup", "User & Security", "Attachments"];
const SCHEDULE_OPTIONS = ["Manual Only", "Daily (04:00 AWST)", "Weekly (Sunday 02:00)", "Monthly (1st 03:00)"];

const DEMO_BACKUPS = [
  { id: 1, date: "2026-04-25 04:00", type: "Full System Backup",   by: "Scheduled",   size: "84.2 MB", status: "Complete" },
  { id: 2, date: "2026-04-24 04:00", type: "Full System Backup",   by: "Scheduled",   size: "83.9 MB", status: "Complete" },
  { id: 3, date: "2026-04-23 14:22", type: "Accounting Only",      by: "Admin User",  size: "12.4 MB", status: "Complete" },
  { id: 4, date: "2026-04-22 04:00", type: "Full System Backup",   by: "Scheduled",   size: "81.1 MB", status: "Complete" },
  { id: 5, date: "2026-04-20 09:15", type: "Payroll Backup",       by: "Mike P",      size: " 3.2 MB", status: "Complete" },
];

const STATUS_COLORS = {
  Complete: "bg-green-500/10 text-green-400 border-green-500/20",
  Failed:   "bg-red-500/10 text-red-400 border-red-500/20",
  Running:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function BackupRestore() {
  const [backups, setBackups] = useState(DEMO_BACKUPS);
  const [backupType, setBackupType] = useState("Full System Backup");
  const [schedule, setSchedule] = useState("Daily (04:00 AWST)");
  const [backing, setBacking] = useState(false);
  const [backupDone, setBackupDone] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoreStep, setRestoreStep] = useState(0); // 0=none 1=confirm 2=done
  const [notes, setNotes] = useState("");

  const handleBackupNow = () => {
    setBacking(true);
    setTimeout(() => {
      const newBackup = { id: Date.now(), date: new Date().toLocaleString("en-AU"), type: backupType, by: "Admin User", size: "84.5 MB", status: "Complete" };
      setBackups(prev => [newBackup, ...prev]);
      setBacking(false);
      setBackupDone(true);
      setTimeout(() => setBackupDone(false), 3000);
    }, 1500);
  };

  const handleDelete = (id) => setBackups(prev => prev.filter(b => b.id !== id));

  return (
    <div className="space-y-4 max-w-5xl">
      <h2 className="font-heading text-base uppercase tracking-wider text-white">Backup & Restore</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="space-y-3">
          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-4">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Create Backup</p>
            <div>
              <label className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-2 block">Backup Type</label>
              <Select value={backupType} onValueChange={setBackupType}>
                <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                  {BACKUP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-heading uppercase tracking-wider text-white/30 mb-2 block">Backup Notes (Optional)</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Pre-import backup"
                className="w-full bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] text-white text-xs rounded-sm px-3 py-2 outline-none focus:border-primary/50" />
            </div>
            {backupDone && (
              <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-primary font-heading uppercase">Backup Complete</span>
              </div>
            )}
            <Button onClick={handleBackupNow} disabled={backing}
              className="w-full bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
              <HardDrive className="w-3.5 h-3.5 mr-1" />
              {backing ? "Backing Up..." : "Backup Now"}
            </Button>
          </div>

          <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-4 space-y-3">
            <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Scheduled Backup</p>
            <Select value={schedule} onValueChange={setSchedule}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">
                {SCHEDULE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-white/30">Current: <span className="text-white">{schedule}</span></p>
            <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-sm">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] text-primary font-heading uppercase">Next: Tomorrow 04:00 AWST</span>
            </div>
          </div>

          <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
            <p className="text-[10px] text-yellow-400 font-heading uppercase tracking-wider">⚠ Restore requires Super Admin approval and MFA re-authentication</p>
          </div>
        </div>

        {/* Backup Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="border border-[hsl(0,0%,18%)] rounded-sm overflow-hidden">
            <div className="bg-[hsl(0,0%,9%)] px-4 py-3 border-b border-[hsl(0,0%,16%)]">
              <p className="font-heading text-[10px] uppercase tracking-widest text-white/30">Backup History</p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[hsl(0,0%,10%)] border-b border-[hsl(0,0%,18%)]">
                  {["Date","Type","Created By","Size","Status","Actions"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-heading text-[9px] uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(0,0%,14%)]">
                {backups.map(b => (
                  <tr key={b.id} className="hover:bg-[hsl(0,0%,11%)]">
                    <td className="px-3 py-2.5 text-white/40 font-mono text-[10px] whitespace-nowrap">{b.date}</td>
                    <td className="px-3 py-2.5 text-white text-[11px]">{b.type}</td>
                    <td className="px-3 py-2.5 text-white/50">{b.by}</td>
                    <td className="px-3 py-2.5 text-white/40">{b.size}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-heading uppercase border ${STATUS_COLORS[b.status] || ""}`}>{b.status}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5">
                        <button className="p-1 text-white/30 hover:text-primary" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setRestoreTarget(b); setRestoreStep(1); }}
                          className="p-1 text-white/30 hover:text-yellow-400" title="Restore"><RotateCcw className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(b.id)}
                          className="p-1 text-white/20 hover:text-red-400" title="Delete (Super Admin)"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Restore Modal */}
      {restoreStep === 1 && restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,22%)] rounded-sm p-6 w-full max-w-md space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-heading text-sm uppercase tracking-wider">Confirm Restore</h3>
            </div>
            <p className="text-sm text-white/60">You are about to restore from:</p>
            <div className="bg-[hsl(0,0%,13%)] border border-[hsl(0,0%,22%)] rounded-sm p-3 space-y-1 text-xs">
              <div className="text-white/30"><span className="text-white">Type:</span> {restoreTarget.type}</div>
              <div className="text-white/30"><span className="text-white">Date:</span> {restoreTarget.date}</div>
              <div className="text-white/30"><span className="text-white">Size:</span> {restoreTarget.size}</div>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm space-y-1">
              <p className="text-[10px] text-red-400 font-heading uppercase font-bold">⚠ This will overwrite existing data</p>
              <p className="text-[10px] text-red-400/70">A pre-restore backup will be created automatically. This action requires Super Admin approval and MFA.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRestoreStep(0)} className="flex-1 rounded-sm text-xs border-[hsl(0,0%,25%)] text-white/50">Cancel</Button>
              <Button onClick={() => { setRestoreStep(2); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-heading font-semibold uppercase text-xs tracking-wider rounded-sm">
                Confirm Restore
              </Button>
            </div>
          </div>
        </div>
      )}

      {restoreStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,22%)] rounded-sm p-6 w-full max-w-md text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h3 className="font-heading text-sm uppercase tracking-wider text-primary">Restore Complete</h3>
            <p className="text-xs text-white/50">A pre-restore backup was saved before the restore. Restore audit record created.</p>
            <Button onClick={() => setRestoreStep(0)} className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}