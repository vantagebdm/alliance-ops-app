import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-[hsl(0,0%,14%)] last:border-0">
    <div className="flex-1 pr-4">
      <div className="text-xs font-heading uppercase tracking-wider text-white">{label}</div>
      {desc && <div className="text-[10px] text-white/30 mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 mt-0.5 ${value ? "bg-primary" : "bg-[hsl(0,0%,22%)]"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

const WORKFLOWS = [
  "Purchase Order Approval", "Supplier Bill Approval", "Customer Credit Approval",
  "Sales Discount Approval", "Margin Override Approval", "Stock Adjustment Approval",
  "Payroll Approval", "Journal Approval", "BAS Approval", "Supplier Bank Detail Change Approval",
];

const ESCALATION_HOURS = ["1","2","4","8","12","24","48","72"];

export default function WorkflowSettings() {
  const [s, setS] = useState({
    enable_approvals: true, enable_draft_states: true, enable_auto_status: true,
    enable_internal_notes: true, enable_task_assignment: true,
    enable_due_dates: true, enable_escalation: true,
  });
  const [workflows, setWorkflows] = useState(Object.fromEntries(WORKFLOWS.map(w => [w, true])));
  const [escalation, setEscalation] = useState({
    manager_hours: "4", director_hours: "24",
    auto_escalate: true, flag_critical: true,
  });
  const [saved, setSaved] = useState(false);
  const toggle = (k) => (v) => setS(x => ({ ...x, [k]: v }));
  const toggleWF = (w) => setWorkflows(x => ({ ...x, [w]: !x[w] }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base uppercase tracking-wider text-white">Workflow Settings</h2>
        <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
          <Save className="w-3.5 h-3.5 mr-1" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2 mb-3">General Workflow</h3>
        <Toggle label="Enable Approval Workflows" value={s.enable_approvals} onChange={toggle("enable_approvals")} />
        <Toggle label="Enable Draft/Approved States" value={s.enable_draft_states} onChange={toggle("enable_draft_states")} />
        <Toggle label="Enable Automatic Status Changes" value={s.enable_auto_status} onChange={toggle("enable_auto_status")} />
        <Toggle label="Enable Internal Notes" value={s.enable_internal_notes} onChange={toggle("enable_internal_notes")} />
        <Toggle label="Enable Task Assignment" value={s.enable_task_assignment} onChange={toggle("enable_task_assignment")} />
        <Toggle label="Enable Due Dates" value={s.enable_due_dates} onChange={toggle("enable_due_dates")} />
        <Toggle label="Enable Escalation Rules" value={s.enable_escalation} onChange={toggle("enable_escalation")} />
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-3">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Approval Workflows</h3>
        <div className="grid grid-cols-2 gap-2">
          {WORKFLOWS.map(w => (
            <button key={w} onClick={() => toggleWF(w)}
              className={`flex items-center gap-2 px-3 py-2 rounded-sm text-left text-[10px] font-heading uppercase border transition-all ${workflows[w] ? "bg-primary/10 border-primary text-primary" : "bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white/40 hover:border-white/30"}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${workflows[w] ? "bg-primary" : "bg-[hsl(0,0%,30%)]"}`} />
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,18%)] rounded-sm p-5 space-y-4">
        <h3 className="font-heading text-[10px] uppercase tracking-widest text-white/30 border-b border-[hsl(0,0%,16%)] pb-2">Escalation Rules</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Notify Manager After (Hours)</label>
            <Select value={escalation.manager_hours} onValueChange={v => setEscalation(e => ({ ...e, manager_hours: v }))}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{ESCALATION_HOURS.map(h => <SelectItem key={h} value={h}>{h} hrs</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-heading uppercase text-white/30 block mb-1.5">Notify Director After (Hours)</label>
            <Select value={escalation.director_hours} onValueChange={v => setEscalation(e => ({ ...e, director_hours: v }))}>
              <SelectTrigger className="bg-[hsl(0,0%,13%)] border-[hsl(0,0%,22%)] text-white text-xs rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,20%)]">{ESCALATION_HOURS.map(h => <SelectItem key={h} value={h}>{h} hrs</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Toggle label="Auto-Escalate Overdue Approvals" value={escalation.auto_escalate} onChange={v => setEscalation(e => ({ ...e, auto_escalate: v }))} />
          <Toggle label="Flag Critical Approvals" value={escalation.flag_critical} onChange={v => setEscalation(e => ({ ...e, flag_critical: v }))} />
        </div>
      </div>
    </div>
  );
}