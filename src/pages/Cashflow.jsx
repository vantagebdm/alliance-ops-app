import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, LayoutDashboard, CalendarDays, ArrowDownCircle, ArrowUpCircle, List, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import CashflowOverview from "@/components/cashflow/CashflowOverview";
import CashflowCalendar from "@/components/cashflow/CashflowCalendar";
import CashflowEntryForm from "@/components/cashflow/CashflowEntryForm";
import moment from "moment";

const TABS = [
  { id: "overview", label: "Overview & Alerts", icon: LayoutDashboard },
  { id: "calendar", label: "Payment Calendar", icon: CalendarDays },
  { id: "outgoing", label: "Outgoings", icon: ArrowDownCircle },
  { id: "incoming", label: "Incomings", icon: ArrowUpCircle },
];

const CATEGORY_LABELS = {
  wages: "Wages / Payroll", rent: "Rent / Lease", utilities: "Utilities",
  insurance: "Insurance", supplier_payment: "Supplier Payment", cogs: "COGS",
  freight: "Freight", maintenance: "Maintenance", tax: "Tax / BAS",
  loan: "Loan / Finance", sales_revenue: "Sales Revenue",
  invoice_payment: "Invoice Payment", other: "Other",
};

export default function Cashflow() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [listView, setListView] = useState("list"); // "list" | "calendar"

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CashflowEntry.list("-due_date", 500);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const listEntries = (type) => {
    return entries
      .filter(e => e.type === type)
      .filter(e => filterStatus === "all" || e.status === filterStatus)
      .filter(e => filterCategory === "all" || e.category === filterCategory)
      .sort((a, b) => moment(a.due_date).diff(moment(b.due_date)));
  };

  const handleEntryClick = (entry) => {
    setEditing(entry);
    setShowForm(true);
  };

  return (
    <div>
      <PageHeader
        title="Cashflow & Payments"
        subtitle="Plan and track ingoings and outgoings"
        actions={
          <Button onClick={() => { setEditing(null); setShowForm(true); }}
            className="bg-primary text-black font-heading font-semibold uppercase text-xs tracking-wider hover:bg-primary/90 rounded-sm">
            <Plus className="w-4 h-4 mr-1" /> New Entry
          </Button>
        }
      />

      {/* Tab Bar */}
      <div className="flex border-b border-border bg-card/50 px-6 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 font-heading text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px
                ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === "overview" && <CashflowOverview entries={entries} />}
            {tab === "calendar" && <CashflowCalendar entries={entries} onEntryClick={handleEntryClick} />}
            {(tab === "outgoing" || tab === "incoming") && (
              <>
                {/* View toggle */}
                <div className="flex justify-end mb-4">
                  <div className="flex border border-border rounded-sm overflow-hidden">
                    <button onClick={() => setListView("list")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading uppercase tracking-wider transition-colors
                        ${listView === "list" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                      <LayoutList className="w-3.5 h-3.5" /> List
                    </button>
                    <button onClick={() => setListView("calendar")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading uppercase tracking-wider transition-colors border-l border-border
                        ${listView === "calendar" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                      <CalendarDays className="w-3.5 h-3.5" /> Calendar
                    </button>
                  </div>
                </div>
                {listView === "list" ? (
                  <EntriesList
                    entries={listEntries(tab === "outgoing" ? "outgoing" : "incoming")}
                    type={tab === "outgoing" ? "outgoing" : "incoming"}
                    filterStatus={filterStatus}
                    filterCategory={filterCategory}
                    onFilterStatus={setFilterStatus}
                    onFilterCategory={setFilterCategory}
                    onEdit={handleEntryClick}
                    onDelete={async (id) => { await base44.entities.CashflowEntry.delete(id); load(); }}
                  />
                ) : (
                  <CashflowCalendar
                    entries={entries.filter(e => e.type === (tab === "outgoing" ? "outgoing" : "incoming"))}
                    onEntryClick={handleEntryClick}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {showForm && (
        <CashflowEntryForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function EntriesList({ entries, type, filterStatus, filterCategory, onFilterStatus, onFilterCategory, onEdit, onDelete }) {
  const isOut = type === "outgoing";
  const total = entries.filter(e => e.status !== "cancelled").reduce((a, e) => a + (e.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={onFilterStatus}>
          <SelectTrigger className="w-36 rounded-sm text-xs h-8"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={onFilterCategory}>
          <SelectTrigger className="w-44 rounded-sm text-xs h-8"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="ml-auto font-heading text-sm font-bold">
          Total: <span className={isOut ? "text-red-400" : "text-green-400"}>{isOut ? "-" : "+"}${total.toLocaleString()}</span>
        </span>
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {type} entries found.</p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(0,0%,12%)]">
              <tr>
                {["Title", "Category", "Amount", "Due Date", "Recurrence", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id} className={`border-t border-border hover:bg-muted/20 cursor-pointer ${i % 2 === 0 ? "" : "bg-muted/5"}`}
                  onClick={() => onEdit(e)}>
                  <td className="px-4 py-2.5 font-medium">
                    <div>{e.title}</div>
                    {e.supplier_name && <div className="text-[11px] text-muted-foreground">{e.supplier_name}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{CATEGORY_LABELS[e.category] || e.category}</td>
                  <td className={`px-4 py-2.5 font-heading font-bold ${isOut ? "text-red-400" : "text-green-400"}`}>
                    {isOut ? "-" : "+"}${(e.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <div>{moment(e.due_date).format("DD/MM/YY")}</div>
                    <div className="text-muted-foreground text-[10px]">{moment(e.due_date).fromNow()}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground capitalize">{e.recurrence}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-2.5" onClick={ev => ev.stopPropagation()}>
                    <button onClick={() => { if (confirm("Delete this entry?")) onDelete(e.id); }}
                      className="text-muted-foreground hover:text-red-400 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}