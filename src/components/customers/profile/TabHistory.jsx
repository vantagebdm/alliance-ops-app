import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionTitle } from "./ProfileField";
import { ShoppingCart, FileText, Receipt, Package, Loader2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import moment from "moment";

function HistorySection({ icon: SectionIcon, title, items, emptyMsg, renderRow }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm p-4 text-center text-muted-foreground/50 text-xs font-heading uppercase tracking-wider">
          {emptyMsg}
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
          {items.slice(0, 5).map((item, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SectionIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                {renderRow(item)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TabHistory({ customer }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [allOrders, allQuotes, allInvoices, allEnquiries] = await Promise.all([
        base44.entities.SalesOrder.list("-created_date", 100),
        base44.entities.Quote.list("-created_date", 100),
        base44.entities.Invoice.list("-created_date", 100),
        base44.entities.Enquiry.list("-created_date", 100),
      ]);
      const match = (item) =>
        item.customer_name === customer.name ||
        (customer.email && item.customer_email === customer.email) ||
        (customer.company && item.company === customer.company);

      setOrders(allOrders.filter(match));
      setQuotes(allQuotes.filter(match));
      setInvoices(allInvoices.filter(match));
      setEnquiries(allEnquiries.filter(match));
      setLoading(false);
    };
    load();
  }, [customer]);

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <HistorySection
        icon={ShoppingCart}
        title="Sales Orders"
        items={orders}
        emptyMsg="No orders found"
        renderRow={(o) => (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-primary">{o.order_number}</span>
            <StatusBadge status={o.status} />
            <span className="text-xs text-muted-foreground">{moment(o.created_date).format("DD/MM/YY")}</span>
            <span className="text-sm font-semibold">${(o.total || 0).toLocaleString()}</span>
          </div>
        )}
      />
      <HistorySection
        icon={FileText}
        title="Quotes"
        items={quotes}
        emptyMsg="No quotes found"
        renderRow={(q) => (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-primary">{q.quote_number}</span>
            <StatusBadge status={q.status} />
            <span className="text-xs text-muted-foreground">{moment(q.created_date).format("DD/MM/YY")}</span>
            <span className="text-sm font-semibold">${(q.total || 0).toLocaleString()}</span>
          </div>
        )}
      />
      <HistorySection
        icon={Receipt}
        title="Invoices"
        items={invoices}
        emptyMsg="No invoices found"
        renderRow={(inv) => (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-primary">{inv.invoice_number}</span>
            <StatusBadge status={inv.status} />
            <span className="text-xs text-muted-foreground">{moment(inv.created_date).format("DD/MM/YY")}</span>
            <span className="text-sm font-semibold">${(inv.total || 0).toLocaleString()}</span>
          </div>
        )}
      />
      <HistorySection
        icon={Package}
        title="Enquiries"
        items={enquiries}
        emptyMsg="No enquiries found"
        renderRow={(e) => (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-primary">{e.enquiry_number}</span>
            <StatusBadge status={e.status} />
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">{e.part_description}</span>
          </div>
        )}
      />
    </div>
  );
}