import { SectionTitle } from "./ProfileField";
import { FileSearch, PenLine, Calendar, User } from "lucide-react";
import moment from "moment";
import CustomerCommunication from "../CustomerCommunication";

export default function TabActivity({ customer }) {
  const events = [
    {
      icon: customer.created_by_method === "pdf_extraction" ? FileSearch : PenLine,
      color: "text-primary",
      bg: "bg-primary/10",
      label: customer.created_by_method === "pdf_extraction" ? "Customer created from PDF extraction" : "Customer created via manual entry",
      date: customer.created_date,
      user: customer.created_by,
    },
    customer.pdf_attachment_url && {
      icon: FileSearch,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      label: "Credit application PDF uploaded and linked",
      date: customer.created_date,
      user: customer.created_by,
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Activity Log</SectionTitle>
        <div className="space-y-0 border border-border rounded-sm overflow-hidden divide-y divide-border">
          {events.map((ev, i) => {
            const Icon = ev.icon;
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className={`w-6 h-6 rounded-sm ${ev.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-3 h-3 ${ev.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{ev.label}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {ev.date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {moment(ev.date).format("DD/MM/YYYY HH:mm")}
                      </span>
                    )}
                    {ev.user && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {ev.user}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle>Email Communications</SectionTitle>
        <CustomerCommunication customer={customer} />
      </div>
    </div>
  );
}