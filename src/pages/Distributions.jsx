import React, { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DistributionCatalog from "@/components/distributions/DistributionCatalog";
import ProposalBuilder from "@/components/distributions/ProposalBuilder";
import { DISTRIBUTION_SUPPLIERS, productUnitPrice, packUnitCount, packCost } from "@/lib/distributionData";

export default function Distributions() {
  const [activeSupplier, setActiveSupplier] = useState("total_energies");
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: "", company: "", email: "", title: "", notes: "" });

  const addToProposal = (product) => {
    const pu = productUnitPrice(product);
    const uc = packUnitCount(product.pack_size);
    setItems((prev) => [
      ...prev,
      {
        supplier_sku: product.sku,
        description: `${product.product} (${product.family})`,
        pack_size: product.pack_size,
        pack_cost: packCost(product),
        per_unit_cost: pu.price,
        unit_count: uc.count,
        unit_label: uc.label,
        pricing_basis: "per_unit",
        quantity: uc.count,
        unit_price: +(pu.price * 1.65).toFixed(2),
      },
    ]);
  };

  return (
    <div>
      <PageHeader title="Distributions" subtitle="Supplier portals & proposal generator" />
      <div className="p-4 lg:p-6">
        <div className="flex gap-1 mb-5 border-b border-[hsl(0,0%,14%)] overflow-x-auto">
          {DISTRIBUTION_SUPPLIERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSupplier(s.id)}
              className={`px-4 py-2.5 text-xs uppercase tracking-wider font-heading border-b-2 transition whitespace-nowrap ${
                activeSupplier === s.id
                  ? "border-primary text-primary"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <DistributionCatalog supplierId={activeSupplier} onAddToProposal={addToProposal} />
          </div>
          <div className="xl:col-span-1">
            <div className="xl:sticky xl:top-20">
              <ProposalBuilder
                supplierId={activeSupplier}
                items={items}
                setItems={setItems}
                customer={customer}
                setCustomer={setCustomer}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}